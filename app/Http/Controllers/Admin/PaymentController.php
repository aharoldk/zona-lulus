<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin');
    }

    public function index(Request $request)
    {
        try {
            $query = Payment::with(['user', 'course']);

            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('invoice_number', 'LIKE', "%{$search}%")
                      ->orWhere('xendit_invoice_id', 'LIKE', "%{$search}%")
                      ->orWhereHas('user', function($userQ) use ($search) {
                          $userQ->where('name', 'LIKE', "%{$search}%")
                                ->orWhere('email', 'LIKE', "%{$search}%");
                      });
                });
            }

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by payment method
            if ($request->has('payment_method') && $request->payment_method !== 'all') {
                $query->where('payment_method', $request->payment_method);
            }

            // Filter by amount range
            if ($request->has('amount_min')) {
                $query->where('amount', '>=', $request->amount_min);
            }
            if ($request->has('amount_max')) {
                $query->where('amount', '<=', $request->amount_max);
            }

            // Filter by date range
            if ($request->has('date_from') && $request->has('date_to')) {
                $query->whereBetween('created_at', [
                    Carbon::parse($request->date_from)->startOfDay(),
                    Carbon::parse($request->date_to)->endOfDay()
                ]);
            }

            $payments = $query->orderBy('created_at', 'desc')
                ->paginate(20);

            // Calculate summary statistics
            $summary = [
                'total_payments' => $query->count(),
                'total_amount' => $query->sum('amount'),
                'completed_payments' => $query->where('status', 'completed')->count(),
                'pending_payments' => $query->where('status', 'pending')->count(),
                'failed_payments' => $query->where('status', 'failed')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'payments' => $payments,
                    'summary' => $summary
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load payments data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $payment = Payment::with(['user', 'course'])
                ->findOrFail($id);

            // Get Xendit payment details if available
            $xenditDetails = null;
            if ($payment->xendit_invoice_id) {
                $xenditDetails = $this->getXenditInvoiceDetails($payment->xendit_invoice_id);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'payment' => $payment,
                    'xendit_details' => $xenditDetails
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,completed,failed,cancelled,refunded',
                'admin_notes' => 'nullable|string|max:1000'
            ]);

            $payment = Payment::findOrFail($id);
            $oldStatus = $payment->status;

            $payment->update([
                'status' => $request->status,
                'admin_notes' => $request->admin_notes,
                'status_updated_by' => auth()->id(),
                'status_updated_at' => now()
            ]);

            // Log status change
            DB::table('payment_status_logs')->insert([
                'payment_id' => $payment->id,
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'changed_by' => auth()->id(),
                'notes' => $request->admin_notes,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Send notification to user about status change
            if ($request->status === 'completed') {
                $payment->user->notifications()->create([
                    'title' => 'Pembayaran Berhasil',
                    'message' => "Pembayaran untuk {$payment->course->title} telah dikonfirmasi. Selamat belajar!",
                    'type' => 'success',
                    'priority' => 'high'
                ]);
            } elseif ($request->status === 'failed') {
                $payment->user->notifications()->create([
                    'title' => 'Pembayaran Gagal',
                    'message' => "Pembayaran untuk {$payment->course->title} gagal diproses. Silakan coba lagi atau hubungi customer service.",
                    'type' => 'error',
                    'priority' => 'high'
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully',
                'data' => $payment->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function refund(Request $request, $id)
    {
        try {
            $request->validate([
                'reason' => 'required|string|max:500',
                'amount' => 'nullable|numeric|min:0'
            ]);

            $payment = Payment::findOrFail($id);

            if ($payment->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only completed payments can be refunded'
                ], 400);
            }

            $refundAmount = $request->amount ?? $payment->amount;

            // Process refund through Xendit if available
            $refundResult = null;
            if ($payment->xendit_invoice_id) {
                $refundResult = $this->processXenditRefund(
                    $payment->xendit_invoice_id,
                    $refundAmount,
                    $request->reason
                );
            }

            // Update payment record
            $payment->update([
                'status' => 'refunded',
                'refund_amount' => $refundAmount,
                'refund_reason' => $request->reason,
                'refund_processed_by' => auth()->id(),
                'refund_processed_at' => now(),
                'xendit_refund_id' => $refundResult['refund_id'] ?? null
            ]);

            // Send notification to user
            $payment->user->notifications()->create([
                'title' => 'Refund Diproses',
                'message' => "Refund sebesar Rp " . number_format($refundAmount) . " untuk {$payment->course->title} sedang diproses.",
                'type' => 'info',
                'priority' => 'high'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Refund processed successfully',
                'data' => [
                    'payment' => $payment->fresh(),
                    'refund_result' => $refundResult
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function analytics(Request $request)
    {
        try {
            $dateFrom = $request->date_from ? Carbon::parse($request->date_from) : now()->subDays(30);
            $dateTo = $request->date_to ? Carbon::parse($request->date_to) : now();

            // Revenue analytics
            $revenueData = Payment::where('status', 'completed')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('DATE(created_at) as date, SUM(amount) as revenue, COUNT(*) as transactions')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Payment method breakdown
            $paymentMethods = Payment::where('status', 'completed')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('payment_method')
                ->get();

            // Course sales analytics
            $courseSales = Payment::where('status', 'completed')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->with('course')
                ->selectRaw('course_id, COUNT(*) as sales_count, SUM(amount) as total_revenue')
                ->groupBy('course_id')
                ->orderBy('total_revenue', 'desc')
                ->limit(10)
                ->get();

            // Status breakdown
            $statusBreakdown = Payment::whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('status, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('status')
                ->get();

            // Monthly trends
            $monthlyTrends = Payment::where('status', 'completed')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(amount) as revenue, COUNT(*) as transactions')
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'revenue_data' => $revenueData,
                    'payment_methods' => $paymentMethods,
                    'course_sales' => $courseSales,
                    'status_breakdown' => $statusBreakdown,
                    'monthly_trends' => $monthlyTrends
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load analytics data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getXenditInvoiceDetails($invoiceId)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode(config('services.xendit.secret_key') . ':'),
                'Content-Type' => 'application/json'
            ])->get("https://api.xendit.co/v2/invoices/{$invoiceId}");

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            \Log::error('Failed to get Xendit invoice details: ' . $e->getMessage());
            return null;
        }
    }

    private function processXenditRefund($invoiceId, $amount, $reason)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode(config('services.xendit.secret_key') . ':'),
                'Content-Type' => 'application/json'
            ])->post('https://api.xendit.co/refunds', [
                'invoice_id' => $invoiceId,
                'amount' => $amount,
                'reason' => $reason
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            throw new \Exception('Xendit refund failed: ' . $response->body());
        } catch (\Exception $e) {
            \Log::error('Failed to process Xendit refund: ' . $e->getMessage());
            throw $e;
        }
    }
}
