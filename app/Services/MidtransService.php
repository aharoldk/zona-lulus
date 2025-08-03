<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Module;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class MidtransService
{
    private $serverKey;
    private $clientKey;
    private $isProduction;
    private $snapUrl;
    private $apiUrl;

    public function __construct()
    {
        $this->serverKey = config('services.midtrans.server_key');
        $this->clientKey = config('services.midtrans.client_key');
        $this->isProduction = config('services.midtrans.is_production', false);

        $this->snapUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $this->apiUrl = $this->isProduction
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';
    }

    /**
     * Create Snap token for payment
     */
    public function createSnapToken(Payment $payment)
    {
        $params = [
            'transaction_details' => [
                'order_id' => $payment->midtrans_order_id,
                'gross_amount' => (int) $payment->amount
            ],
            'customer_details' => [
                'first_name' => $payment->user->name,
                'email' => $payment->user->email,
                'phone' => $payment->user->phone ?? '',
            ],
            'item_details' => [
                [
                    'id' => $payment->module_id ?? $payment->course_id,
                    'price' => (int) $payment->amount,
                    'quantity' => 1,
                    'name' => $payment->module->title ?? $payment->course->title ?? 'Module Access',
                    'category' => 'Education'
                ]
            ],
            'callbacks' => [
                'finish' => route('payment.finish', $payment->id)
            ],
            'expiry' => [
                'start_time' => now()->format('Y-m-d H:i:s O'),
                'unit' => 'hours',
                'duration' => 24
            ]
        ];

        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($this->snapUrl, $params);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Midtrans Snap Token Created', [
                    'payment_id' => $payment->id,
                    'order_id' => $payment->midtrans_order_id
                ]);
                return $data['token'] ?? null;
            }

            Log::error('Midtrans Snap Token Error', [
                'payment_id' => $payment->id,
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return null;
        } catch (Exception $e) {
            Log::error('Midtrans Snap Token Exception', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return null;
        }
    }

    /**
     * Get transaction status from Midtrans
     */
    public function getTransactionStatus($orderId)
    {
        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->get("{$this->apiUrl}/{$orderId}/status");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Midtrans Status Check Error', [
                'order_id' => $orderId,
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return null;
        } catch (Exception $e) {
            Log::error('Midtrans Status Check Exception', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    /**
     * Create payment record
     */
    public function createPayment(User $user, Module $module = null, $course = null, $test = null)
    {
        $orderId = 'ZL-' . ($module ? $module->id : ($course ? $course->id : $test->id)) . '-' . $user->id . '-' . time();

        $payment = Payment::create([
            'user_id' => $user->id,
            'module_id' => $module?->id,
            'course_id' => $course?->id,
            'test_id' => $test?->id,
            'midtrans_order_id' => $orderId,
            'invoice_number' => $this->generateInvoiceNumber(),
            'amount' => $module ? $module->price : ($course ? $course->price : $test->price),
            'payment_method' => 'midtrans',
            'status' => 'pending',
            'description' => $module
                ? "Pembelian akses modul: {$module->title}"
                : ($course
                    ? "Pembelian akses kursus: {$course->title}"
                    : "Pembelian akses tryout: {$test->title}"),
            'expires_at' => now()->addHours(24) // 24 hour payment expiry
        ]);

        Log::info('Payment Created', [
            'payment_id' => $payment->id,
            'user_id' => $user->id,
            'module_id' => $module?->id,
            'course_id' => $course?->id,
            'test_id' => $test?->id,
            'amount' => $payment->amount
        ]);

        return $payment;
    }

    /**
     * Process Midtrans webhook
     */
    public function processWebhook($data)
    {
        try {
            $orderId = $data['order_id'] ?? null;
            $transactionStatus = $data['transaction_status'] ?? null;
            $fraudStatus = $data['fraud_status'] ?? null;
            $transactionId = $data['transaction_id'] ?? null;

            Log::info('Processing Midtrans Webhook', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus
            ]);

            if (!$orderId) {
                Log::warning('Webhook missing order_id', $data);
                return false;
            }

            $payment = Payment::where('midtrans_order_id', $orderId)->first();

            if (!$payment) {
                Log::warning('Payment not found for webhook', ['order_id' => $orderId]);
                return false;
            }

            // Update payment with Midtrans data
            $payment->update([
                'midtrans_transaction_id' => $transactionId,
                'midtrans_transaction_status' => $transactionStatus,
                'payment_channel' => $data['payment_type'] ?? null,
                'metadata' => $data,
                'status_updated_at' => now()
            ]);

            // Process based on transaction status
            switch ($transactionStatus) {
                case 'capture':
                    if ($fraudStatus === 'accept' || !$fraudStatus) {
                        $this->markPaymentAsCompleted($payment);
                    } else {
                        $this->markPaymentAsFailed($payment, "Fraud status: {$fraudStatus}");
                    }
                    break;

                case 'settlement':
                    $this->markPaymentAsCompleted($payment);
                    break;

                case 'pending':
                    // Payment is still pending, no action needed
                    Log::info('Payment still pending', ['payment_id' => $payment->id]);
                    break;

                case 'deny':
                case 'cancel':
                case 'expire':
                case 'failure':
                    $this->markPaymentAsFailed($payment, "Transaction {$transactionStatus}");
                    break;

                default:
                    Log::warning('Unknown transaction status', [
                        'order_id' => $orderId,
                        'status' => $transactionStatus
                    ]);
            }

            return true;
        } catch (Exception $e) {
            Log::error('Midtrans Webhook Processing Error', [
                'data' => $data,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    /**
     * Mark payment as completed and grant access
     */
    private function markPaymentAsCompleted(Payment $payment)
    {
        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
            'status_updated_at' => now()
        ]);

        // Grant module access to user
        if ($payment->module_id) {
            $this->grantModuleAccess($payment);
        }

        // Grant course access to user
        if ($payment->course_id) {
            $this->grantCourseAccess($payment);
        }

        // Grant test access to user
        if ($payment->test_id) {
            $this->grantTestAccess($payment);
        }

        Log::info('Payment completed and access granted', [
            'payment_id' => $payment->id,
            'user_id' => $payment->user_id,
            'module_id' => $payment->module_id,
            'course_id' => $payment->course_id
        ]);
    }

    /**
     * Grant module access to user
     */
    private function grantModuleAccess(Payment $payment)
    {
        $expiresAt = null;
        if ($payment->module->duration_days) {
            $expiresAt = now()->addDays($payment->module->duration_days);
        }

        // Check if access already exists
        $existingAccess = $payment->user->moduleAccess()
            ->where('module_id', $payment->module_id)
            ->first();

        if ($existingAccess) {
            // Update existing access
            $existingAccess->pivot->update([
                'payment_id' => $payment->id,
                'purchased_at' => now(),
                'expires_at' => $expiresAt
            ]);
        } else {
            // Create new access
            $payment->user->moduleAccess()->attach($payment->module_id, [
                'payment_id' => $payment->id,
                'purchased_at' => now(),
                'expires_at' => $expiresAt
            ]);
        }
    }

    /**
     * Grant course access to user
     */
    private function grantCourseAccess(Payment $payment)
    {
        // Create or update course progress
        $payment->user->courseProgress()->updateOrCreate(
            ['course_id' => $payment->course_id],
            [
                'progress_percentage' => 0,
                'started_at' => now(),
                'status' => 'active'
            ]
        );
    }

    /**
     * Grant test access to user
     */
    private function grantTestAccess(Payment $payment)
    {
        $expiresAt = null;
        // For tests, we typically don't have expiry unless specified
        // Tests are usually one-time purchase with unlimited time

        // Check if access already exists
        $existingAccess = $payment->user->testAccess()
            ->where('test_id', $payment->test_id)
            ->first();

        if ($existingAccess) {
            // Update existing access
            $existingAccess->pivot->update([
                'payment_id' => $payment->id,
                'purchased_at' => now(),
                'expires_at' => $expiresAt
            ]);
        } else {
            // Create new access
            $payment->user->testAccess()->attach($payment->test_id, [
                'payment_id' => $payment->id,
                'purchased_at' => now(),
                'expires_at' => $expiresAt
            ]);
        }
    }

    /**
     * Mark payment as failed
     */
    private function markPaymentAsFailed(Payment $payment, $reason)
    {
        $payment->update([
            'status' => 'failed',
            'admin_notes' => "Payment failed: {$reason}",
            'status_updated_at' => now()
        ]);

        Log::info('Payment marked as failed', [
            'payment_id' => $payment->id,
            'reason' => $reason
        ]);
    }

    /**
     * Generate unique invoice number
     */
    private function generateInvoiceNumber()
    {
        $prefix = 'ZL';
        $date = now()->format('Ymd');
        $sequence = str_pad(Payment::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . $date . $sequence;
    }

    /**
     * Verify webhook signature for security
     */
    public function verifySignature($data, $signature)
    {
        $orderId = $data['order_id'] ?? '';
        $statusCode = $data['status_code'] ?? '';
        $grossAmount = $data['gross_amount'] ?? '';

        $input = $orderId . $statusCode . $grossAmount . $this->serverKey;
        $hash = hash('sha512', $input);

        $isValid = hash_equals($hash, $signature);

        Log::info('Webhook signature verification', [
            'order_id' => $orderId,
            'is_valid' => $isValid
        ]);

        return $isValid;
    }

    /**
     * Cancel payment
     */
    public function cancelPayment(Payment $payment)
    {
        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->post("{$this->apiUrl}/{$payment->midtrans_order_id}/cancel");

            if ($response->successful()) {
                $payment->update([
                    'status' => 'cancelled',
                    'admin_notes' => 'Cancelled via API',
                    'status_updated_at' => now()
                ]);

                Log::info('Payment cancelled successfully', [
                    'payment_id' => $payment->id,
                    'order_id' => $payment->midtrans_order_id
                ]);

                return true;
            }

            Log::error('Failed to cancel payment via Midtrans', [
                'payment_id' => $payment->id,
                'response' => $response->body()
            ]);

            return false;
        } catch (Exception $e) {
            Log::error('Exception cancelling payment', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Check if service is configured
     */
    public function isConfigured()
    {
        return !empty($this->serverKey) && !empty($this->clientKey);
    }
}
