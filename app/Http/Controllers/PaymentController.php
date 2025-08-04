<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Payment;
use App\Models\Course;
use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['finish']);
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
            return response()->json([
                'status' => 'success',
                'payment_id' => $existingPayment->id,
                'amount' => $existingPayment->amount,
                'invoice_number' => $existingPayment->invoice_number
            ]);
        }

        // Create new payment
        try {
            $payment = new Payment();
            $payment->user_id = $user->id;
            $payment->module_id = $module->id;
            $payment->amount = $module->price;
            $payment->status = 'pending';
            $payment->invoice_number = 'INV-' . strtoupper(uniqid());
            $payment->expires_at = now()->addMinutes(60);
            $payment->save();

            return response()->json([
                'status' => 'success',
                'payment_id' => $payment->id,
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
            return response()->json([
                'status' => 'success',
                'payment_id' => $existingPayment->id,
                'amount' => $existingPayment->amount,
                'invoice_number' => $existingPayment->invoice_number
            ]);
        }

        // Create new payment
        try {
            $payment = new Payment();
            $payment->user_id = $user->id;
            $payment->course_id = $course->id;
            $payment->amount = $course->price;
            $payment->status = 'pending';
            $payment->invoice_number = 'INV-' . strtoupper(uniqid());
            $payment->expires_at = now()->addMinutes(60);
            $payment->save();

            return response()->json([
                'status' => 'success',
                'payment_id' => $payment->id,
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
            return response()->json([
                'status' => 'success',
                'payment_id' => $existingPayment->id,
                'amount' => $existingPayment->amount,
                'invoice_number' => $existingPayment->invoice_number
            ]);
        }

        // Create new payment
        try {
            $payment = new Payment();
            $payment->user_id = $user->id;
            $payment->test_id = $test->id;
            $payment->amount = $test->price;
            $payment->status = 'pending';
            $payment->invoice_number = 'INV-' . strtoupper(uniqid());
            $payment->expires_at = now()->addMinutes(60);
            $payment->save();

            return response()->json([
                'status' => 'success',
                'payment_id' => $payment->id,
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
    public function getPaymentStatus(Request $request, Payment $payment)
    {
        $user = Auth::user();

        if ($payment->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access to payment'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'payment_id' => $payment->id,
                'status' => $payment->status,
                'amount' => $payment->amount,
                'invoice_number' => $payment->invoice_number,
                'created_at' => $payment->created_at,
                'expires_at' => $payment->expires_at
            ]
        ]);
    }

    /**
     * Get payment history for authenticated user
     */
    public function history(Request $request)
    {
        $user = Auth::user();

        $payments = Payment::where('user_id', $user->id)
            ->with(['module', 'course'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $payments
        ]);
    }

    /**
     * Cancel a pending payment
     */
    public function cancel(Request $request, Payment $payment)
    {
        $user = Auth::user();

        if ($payment->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access to payment'
            ], 403);
        }

        if ($payment->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pending payments can be cancelled'
            ], 400);
        }

        $payment->update(['status' => 'cancelled']);

        return response()->json([
            'status' => 'success',
            'message' => 'Payment cancelled successfully'
        ]);
    }

    /**
     * Payment finish redirect
     */
    public function finish(Request $request, Payment $payment)
    {
        // Basic redirect handler for payment completion
        // This can be used by other payment gateways
        return response()->json([
            'status' => 'success',
            'message' => 'Payment processed',
            'payment_status' => $payment->status
        ]);
    }

    /**
     * Get payment statistics for authenticated user
     */
    public function stats(Request $request)
    {
        $user = Auth::user();

        $totalSpent = Payment::where('user_id', $user->id)
            ->where('status', 'paid')
            ->sum('amount');

        $totalTransactions = Payment::where('user_id', $user->id)
            ->where('status', 'paid')
            ->count();

        $pendingPayments = Payment::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_spent' => $totalSpent,
                'total_transactions' => $totalTransactions,
                'pending_payments' => $pendingPayments
            ]
        ]);
    }
}
