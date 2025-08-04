<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Test;
use App\Services\DuitkuService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DuitkuPaymentController extends Controller
{
    protected $duitkuService;

    public function __construct(DuitkuService $duitkuService)
    {
        $this->duitkuService = $duitkuService;
        $this->middleware('auth:sanctum')->except(['callback', 'return']);
    }

    /**
     * Get available payment methods
     */
    public function getPaymentMethods(Request $request)
    {
        $amount = $request->input('amount', 10000);

        $result = $this->duitkuService->getPaymentMethods($amount);

        if ($result['success']) {
            return response()->json([
                'status' => 'success',
                'data' => $result['data']
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $result['message']
        ], 500);
    }

    /**
     * Handle Duitku callback
     */
    public function callback(Request $request)
    {
        try {
            $callbackData = $request->all();

            Log::info('Duitku callback received', $callbackData);

            $result = $this->duitkuService->handleCallback($callbackData);

            if ($result['success']) {
                $payment = $result['payment'];
                if ($payment->status === 'completed') {
                    $this->grantAccess($payment);
                }

                return response()->json(['status' => 'success']);
            }

            return response()->json(['status' => 'error'], 400);

        } catch (\Exception $e) {
            Log::error('Duitku callback error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Handle return from Duitku
     */
    public function return(Request $request)
    {
        $orderId = $request->input('merchantOrderId');

        if ($orderId) {
            $payment = Payment::where('order_id', $orderId)->first();

            if ($payment) {
                // Check payment status
                $result = $this->duitkuService->checkTransactionStatus($orderId);

                if ($result['success'] && $result['status'] === '00') {
                    // Payment successful
                    return redirect()->to(config('services.duitku.return_url') . '?status=success&payment_id=' . $payment->id);
                }
            }
        }

        return redirect()->to(config('services.duitku.return_url') . '?status=failed');
    }

    /**
     * Check payment status
     */
    public function checkStatus(Request $request, Payment $payment)
    {
        $user = Auth::user();

        if ($payment->user_id !== $user->getAuthIdentifier()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($payment->payment_method !== 'duitku') {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid payment method'
            ], 400);
        }

        $result = $this->duitkuService->checkTransactionStatus($payment->order_id);

        if ($result['success']) {
            // Update payment status if needed
            $statusCode = $result['data']['statusCode'] ?? null;
            $transactionStatus = $this->mapDuitkuStatus($statusCode);

            if ($payment->transaction_status !== $transactionStatus) {
                $payment->update([
                    'transaction_status' => $transactionStatus,
                    'status' => $transactionStatus === 'paid' ? 'completed' : 'pending'
                ]);

                if ($transactionStatus === 'paid') {
                    $this->grantAccess($payment);
                }
            }

            return response()->json([
                'status' => 'success',
                'payment_status' => $payment->status,
                'transaction_status' => $transactionStatus
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $result['message']
        ], 500);
    }

    /**
     * Create a new payment
     */
    public function createPayment(Request $request)
    {
        try {
            $request->validate([
                'test_id' => 'nullable|exists:tests,id',
                'amount' => 'required|numeric|min:1',
                'payment_method' => 'required|string',
                'description' => 'nullable|string'
            ]);

            $user = Auth::user();
            $test = $request->test_id ? Test::find($request->test_id) : null;

            // Create payment record
            $payment = $this->createPaymentRecord($user, $test);

            // Override amount if provided
            if ($request->amount) {
                $payment->update(['amount' => $request->amount]);
            }

            // Update description if provided
            if ($request->description) {
                $payment->update(['description' => $request->description]);
            }

            // Create Duitku transaction
            $result = $this->createDuitkuTransaction($payment, $request->payment_method);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'payment_id' => $payment->id,
                        'payment_url' => $result['payment_url'],
                        'reference' => $result['reference'],
                        'va_number' => $result['va_number'],
                        'order_id' => $payment->order_id,
                        'amount' => $payment->amount
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['message']
            ], 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Payment validation error', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Create payment error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Inquiry payment status
     */
    public function inquiryPayment(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|string'
            ]);

            $payment = Payment::where('order_id', $request->order_id)->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found'
                ], 404);
            }

            // Check if user owns this payment
            if ($payment->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $result = $this->duitkuService->checkTransactionStatus($payment->order_id);

            if ($result['success']) {
                // Update payment status if needed
                $statusCode = $result['data']['statusCode'] ?? null;
                $transactionStatus = $this->mapDuitkuStatus($statusCode);

                if ($payment->transaction_status !== $transactionStatus) {
                    $payment->update([
                        'transaction_status' => $transactionStatus,
                        'status' => $transactionStatus === 'paid' ? 'completed' : $payment->status
                    ]);

                    if ($transactionStatus === 'paid') {
                        $this->grantAccess($payment);
                    }
                }

                return response()->json([
                    'success' => true,
                    'data' => [
                        'payment_id' => $payment->id,
                        'order_id' => $payment->order_id,
                        'status' => $payment->status,
                        'transaction_status' => $transactionStatus,
                        'amount' => $payment->amount,
                        'payment_method' => $payment->payment_method,
                        'created_at' => $payment->created_at,
                        'paid_at' => $payment->paid_at,
                        'expires_at' => $payment->expires_at
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['message']
            ], 500);

        } catch (\Exception $e) {
            Log::error('Payment inquiry error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to inquiry payment status'
            ], 500);
        }
    }

    /**
     * Create payment record
     */
    private function createPaymentRecord($user, $test = null)
    {
        $orderId = 'ORDER-' . time() . '-' . Str::random(8);
        $invoiceNumber = 'INV-' . date('YmdHis') . '-' . Str::random(6);
        $paymentReference = 'REF-' . date('YmdHis') . '-' . Str::random(8);

        $amount = $test ? $test->price : 0;
        $description = $test
            ? "Payment for test: {$test->title}"
            : "Payment for services";

        return Payment::create([
            'user_id' => $user->getAuthIdentifier(),
            'invoice_number' => $invoiceNumber,
            'order_id' => $orderId,
            'payment_reference' => $paymentReference,
            'amount' => $amount,
            'payment_method' => 'duitku',
            'status' => 'pending',
            'transaction_status' => 'pending',
            'description' => $description,
            'expires_at' => now()->addHours(24),
            'metadata' => []
        ]);
    }

    /**
     * Create Duitku transaction
     */
    private function createDuitkuTransaction($payment, $paymentMethod)
    {
        $user = $payment->user;
        $test = $payment->test;

        $paymentData = [
            'order_id' => $payment->order_id,
            'amount' => (int) $payment->amount,
            'payment_method' => $paymentMethod,
            'customer_details' => [
                'name' => $user->name,
                'first_name' => explode(' ', $user->name)[0] ?? $user->name,
                'last_name' => implode(' ', array_slice(explode(' ', $user->name), 1)) ?: '',
                'email' => $user->email,
                'phone' => $user->phone ?? '08123456789',
                'address' => $user->address ?? 'Jakarta, Indonesia'
            ],
            'item_details' => [
                'name' => $test ? $test->title : ($payment->description ?: 'Service Payment'),
                'price' => (int) $payment->amount,
                'quantity' => 1
            ]
        ];

        return $this->duitkuService->createTransaction($paymentData);
    }

    /**
     * Grant access to user after successful payment
     */
    private function grantAccess($payment)
    {
        if ($payment->test_id) {
            // Grant tryout access logic here
            // This would typically involve creating a user_test relationship
            Log::info('Test access granted', [
                'user_id' => $payment->user_id,
                'test_id' => $payment->test_id,
                'payment_id' => $payment->id
            ]);
        } else {
            // General service access granted
            Log::info('Service access granted', [
                'user_id' => $payment->user_id,
                'payment_id' => $payment->id,
                'description' => $payment->description
            ]);
        }
    }

    /**
     * Map Duitku status codes to internal status
     */
    private function mapDuitkuStatus($statusCode)
    {
        switch ($statusCode) {
            case '00':
                return 'paid';
            case '01':
                return 'pending';
            case '02':
                return 'failed';
            default:
                return 'unknown';
        }
    }
}
