<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Payment;
use App\Models\Course;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
        $this->middleware('auth')->except(['webhook', 'finish']);
    }

    /**
     * Purchase a module
     */
    public function purchaseModule(Request $request, Module $module)
    {
        $user = Auth::user();

        // Check if module requires payment
        if (!$module->is_paid) {
            return response()->json([
                'status' => 'error',
                'message' => 'This module is free and does not require payment'
            ], 400);
        }

        // Check if user already has access
        if ($module->isAccessibleBy($user)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You already have access to this module'
            ], 400);
        }

        // Check for existing pending payment
        $existingPayment = Payment::where('user_id', $user->id)
            ->where('module_id', $module->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if ($existingPayment) {
            $snapToken = $this->midtransService->createSnapToken($existingPayment);

            if ($snapToken) {
                return response()->json([
                    'status' => 'success',
                    'payment_id' => $existingPayment->id,
                    'snap_token' => $snapToken,
                    'amount' => $existingPayment->amount,
                    'invoice_number' => $existingPayment->invoice_number
                ]);
            }
        }

        // Create new payment
        try {
            $payment = $this->midtransService->createPayment($user, $module);
            $snapToken = $this->midtransService->createSnapToken($payment);

            if (!$snapToken) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to create payment token'
                ], 500);
            }

            return response()->json([
                'status' => 'success',
                'payment_id' => $payment->id,
                'snap_token' => $snapToken,
                'amount' => $payment->amount,
                'invoice_number' => $payment->invoice_number
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating payment', [
                'user_id' => $user->id,
                'module_id' => $module->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create payment'
            ], 500);
        }
    }

    /**
     * Purchase a course
     */
    public function purchaseCourse(Request $request, Course $course)
    {
        $user = Auth::user();

        // Check if course requires payment
        if (!$course->is_paid) {
            return response()->json([
                'status' => 'error',
                'message' => 'This course is free and does not require payment'
            ], 400);
        }

        // Check for existing pending payment
        $existingPayment = Payment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if ($existingPayment) {
            $snapToken = $this->midtransService->createSnapToken($existingPayment);

            if ($snapToken) {
                return response()->json([
                    'status' => 'success',
                    'payment_id' => $existingPayment->id,
                    'snap_token' => $snapToken,
                    'amount' => $existingPayment->amount,
                    'invoice_number' => $existingPayment->invoice_number
                ]);
            }
        }

        // Create new payment
        try {
            $payment = $this->midtransService->createPayment($user, null, $course);
            $snapToken = $this->midtransService->createSnapToken($payment);

            if (!$snapToken) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to create payment token'
                ], 500);
            }

            return response()->json([
                'status' => 'success',
                'payment_id' => $payment->id,
                'snap_token' => $snapToken,
                'amount' => $payment->amount,
                'invoice_number' => $payment->invoice_number
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating course payment', [
                'user_id' => $user->id,
                'course_id' => $course->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create payment'
            ], 500);
        }
    }

    /**
     * Purchase a test/tryout
     */
    public function purchaseTest(Request $request, Test $test)
    {
        $user = Auth::user();

        // Check if test requires payment
        if ($test->is_free) {
            return response()->json([
                'status' => 'error',
                'message' => 'This test is free and does not require payment'
            ], 400);
        }

        // Check if user already has access
        if ($test->isAccessibleBy($user)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You already have access to this test'
            ], 400);
        }

        // Check for existing pending payment
        $existingPayment = Payment::where('user_id', $user->id)
            ->where('test_id', $test->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if ($existingPayment) {
            $snapToken = $this->midtransService->createSnapToken($existingPayment);

            if ($snapToken) {
                return response()->json([
                    'status' => 'success',
                    'payment_id' => $existingPayment->id,
                    'snap_token' => $snapToken,
                    'amount' => $existingPayment->amount,
                    'invoice_number' => $existingPayment->invoice_number
                ]);
            }
        }

        // Create new payment
        try {
            $payment = $this->midtransService->createPayment($user, null, null, $test);
            $snapToken = $this->midtransService->createSnapToken($payment);

            if (!$snapToken) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to create payment token'
                ], 500);
            }

            return response()->json([
                'status' => 'success',
                'payment_id' => $payment->id,
                'snap_token' => $snapToken,
                'amount' => $payment->amount,
                'invoice_number' => $payment->invoice_number
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating test payment', [
                'user_id' => $user->id,
                'test_id' => $test->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create payment'
            ], 500);
        }
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus(Payment $payment)
    {
        $user = Auth::user();

        if ($payment->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $midtransStatus = null;
        if ($payment->midtrans_order_id) {
            $midtransStatus = $this->midtransService->getTransactionStatus($payment->midtrans_order_id);
        }

        return response()->json([
            'status' => 'success',
            'payment' => $payment->load(['module', 'course']),
            'midtrans_status' => $midtransStatus
        ]);
    }

    /**
     * Get payment history for authenticated user
     */
    public function history(Request $request)
    {
        $user = Auth::user();

        $query = Payment::where('user_id', $user->id)
            ->with(['module', 'course'])
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date range if provided
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $payments = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'status' => 'success',
            'data' => $payments
        ]);
    }

    /**
     * Cancel a pending payment
     */
    public function cancel(Payment $payment)
    {
        $user = Auth::user();

        if ($payment->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($payment->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment cannot be cancelled'
            ], 400);
        }

        // Try to cancel via Midtrans API first
        $cancelled = $this->midtransService->cancelPayment($payment);

        if (!$cancelled) {
            // If Midtrans cancellation fails, cancel locally
            $payment->update([
                'status' => 'cancelled',
                'admin_notes' => 'Cancelled by user (local)',
                'status_updated_at' => now()
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Payment cancelled successfully'
        ]);
    }

    /**
     * Payment finish redirect (called by Midtrans after payment)
     */
    public function finish(Request $request, Payment $payment)
    {
        // This is called when user finishes payment on Midtrans page
        $status = $request->get('transaction_status', 'pending');

        Log::info('Payment finish redirect', [
            'payment_id' => $payment->id,
            'transaction_status' => $status,
            'params' => $request->all()
        ]);

        $redirectUrl = '/dashboard';

        if ($payment->module_id) {
            $redirectUrl = "/modules/{$payment->module_id}";
        } elseif ($payment->course_id) {
            $redirectUrl = "/courses/{$payment->course_id}";
        } elseif ($payment->test_id) {
            $redirectUrl = "/tests/{$payment->test_id}";
        }

        $message = match($status) {
            'settlement', 'capture' => 'Payment completed successfully! Access has been granted.',
            'pending' => 'Payment is being processed. Please wait for confirmation.',
            'deny', 'cancel', 'expire' => 'Payment was not completed. Please try again.',
            default => 'Payment status updated. Please check your payment history.'
        };

        return redirect($redirectUrl)->with('payment_message', $message);
    }

    /**
     * Get payment statistics for user
     */
    public function stats()
    {
        $user = Auth::user();

        $stats = [
            'total_payments' => Payment::where('user_id', $user->id)->count(),
            'completed_payments' => Payment::where('user_id', $user->id)->where('status', 'completed')->count(),
            'pending_payments' => Payment::where('user_id', $user->id)->where('status', 'pending')->count(),
            'failed_payments' => Payment::where('user_id', $user->id)->where('status', 'failed')->count(),
            'total_spent' => Payment::where('user_id', $user->id)->where('status', 'completed')->sum('amount'),
            'modules_purchased' => Payment::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereNotNull('module_id')
                ->count(),
            'courses_purchased' => Payment::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereNotNull('course_id')
                ->count()
        ];

        return response()->json([
            'status' => 'success',
            'stats' => $stats
        ]);
    }
}
