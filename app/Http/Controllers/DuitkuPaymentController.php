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
                // Grant access to user if payment is successful
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
     * Create payment record
     */
    private function createPayment($user, $module = null, $course = null)
    {
        $orderId = 'ORDER-' . time() . '-' . Str::random(8);
        $invoiceNumber = 'INV-' . date('YmdHis') . '-' . Str::random(6);

        $amount = $module ? $module->price : $course->price;
        $description = $module
            ? "Payment for module: {$module->title}"
            : "Payment for course: {$course->title}";

        return Payment::create([
            'user_id' => $user->getAuthIdentifier(),
            'module_id' => $module?->id,
            'course_id' => $course?->id,
            'invoice_number' => $invoiceNumber,
            'order_id' => $orderId,
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
        $item = $payment->module ?? $payment->course;

        $paymentData = [
            'order_id' => $payment->order_id,
            'amount' => (int) $payment->amount,
            'payment_method' => $paymentMethod,
            'customer_details' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '08123456789',
                'address' => $user->address ?? 'Jakarta, Indonesia'
            ],
            'item_details' => [
                'name' => $item->title,
                'price' => (int) $payment->amount,
                'quantity' => 1
            ]
        ];

        return $this->duitkuService->createTransaction($paymentData);
    }

    /**
     * Create payment record for tryout
     */
    private function createPaymentForTryout($user, Test $test)
    {
        $orderId = 'ORDER-' . time() . '-' . Str::random(8);
        $invoiceNumber = 'INV-' . date('YmdHis') . '-' . Str::random(6);

        $description = "Payment for tryout: {$test->title}";

        return Payment::create([
            'user_id' => $user->getAuthIdentifier(),
            'test_id' => $test->id,
            'invoice_number' => $invoiceNumber,
            'order_id' => $orderId,
            'amount' => $test->price,
            'payment_method' => 'duitku',
            'status' => 'pending',
            'transaction_status' => 'pending',
            'description' => $description,
            'expires_at' => now()->addHours(24),
            'metadata' => []
        ]);
    }

    /**
     * Create Duitku transaction for tryout
     */
    private function createDuitkuTransactionForTryout($payment, $paymentMethod)
    {
        $user = $payment->user;
        $test = $payment->test;

        $paymentData = [
            'order_id' => $payment->order_id,
            'amount' => (int) $payment->amount,
            'payment_method' => $paymentMethod,
            'customer_details' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '08123456789',
                'address' => $user->address ?? 'Jakarta, Indonesia'
            ],
            'item_details' => [
                'name' => $test->title,
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
        if ($payment->module_id) {
            // Grant module access logic here
            // This would typically involve creating a user_module relationship
            Log::info('Module access granted', [
                'user_id' => $payment->user_id,
                'module_id' => $payment->module_id,
                'payment_id' => $payment->id
            ]);
        } elseif ($payment->course_id) {
            // Grant course access logic here
            // This would typically involve creating a user_course relationship
            Log::info('Course access granted', [
                'user_id' => $payment->user_id,
                'course_id' => $payment->course_id,
                'payment_id' => $payment->id
            ]);
        } elseif ($payment->test_id) {
            // Grant tryout access logic here
            // This would typically involve creating a user_test relationship
            Log::info('Tryout access granted', [
                'user_id' => $payment->user_id,
                'test_id' => $payment->test_id,
                'payment_id' => $payment->id
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

    /**
     * Purchase a tryout using Duitku
     */
    public function purchaseTryout(Request $request, Test $test)
    {
        $request->validate([
            'payment_method' => 'required|string'
        ]);

        $user = Auth::user();
        $paymentMethod = $request->input('payment_method');

        // Check if tryout requires payment
        if ($test->is_free) {
            return response()->json([
                'status' => 'error',
                'message' => 'This tryout is free and does not require payment'
            ], 400);
        }

        // Check if tryout is active
        if (!$test->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'This tryout is not currently available'
            ], 400);
        }

        // Check registration deadline
        if ($test->registration_deadline && now() > $test->registration_deadline) {
            return response()->json([
                'status' => 'error',
                'message' => 'Registration deadline has passed for this tryout'
            ], 400);
        }

        // Check if user already has a completed payment for this tryout
        $existingCompletedPayment = Payment::where('user_id', $user->getAuthIdentifier())
            ->where('test_id', $test->id)
            ->where('status', 'completed')
            ->first();

        if ($existingCompletedPayment) {
            return response()->json([
                'status' => 'error',
                'message' => 'You have already purchased access to this tryout'
            ], 400);
        }

        // Check for existing pending payment
        $existingPayment = Payment::where('user_id', $user->getAuthIdentifier())
            ->where('test_id', $test->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if ($existingPayment) {
            // Recreate payment URL for existing payment
            $result = $this->createDuitkuTransactionForTryout($existingPayment, $paymentMethod);

            if ($result['success']) {
                return response()->json([
                    'status' => 'success',
                    'payment_id' => $existingPayment->id,
                    'payment_url' => $result['payment_url'],
                    'reference' => $result['reference'],
                    'amount' => $existingPayment->amount,
                    'invoice_number' => $existingPayment->invoice_number
                ]);
            }
        }

        // Create new payment
        try {
            $payment = $this->createPaymentForTryout($user, $test);
            $result = $this->createDuitkuTransactionForTryout($payment, $paymentMethod);

            if (!$result['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['message']
                ], 500);
            }

            // Update payment with Duitku reference
            $payment->update([
                'transaction_id' => $result['reference'],
                'payment_channel' => $paymentMethod,
                'metadata' => array_merge($payment->metadata ?? [], [
                    'duitku_response' => $result['data']
                ])
            ]);

            return response()->json([
                'status' => 'success',
                'payment_id' => $payment->id,
                'payment_url' => $result['payment_url'],
                'reference' => $result['reference'],
                'va_number' => $result['va_number'] ?? null,
                'amount' => $payment->amount,
                'invoice_number' => $payment->invoice_number
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating Duitku payment for tryout', [
                'user_id' => $user->getAuthIdentifier(),
                'test_id' => $test->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create payment'
            ], 500);
        }
    }
}
