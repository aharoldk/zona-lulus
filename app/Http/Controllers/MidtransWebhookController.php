<?php

namespace App\Http\Controllers;

use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Handle Midtrans webhook notifications
     */
    public function handleWebhook(Request $request)
    {
        Log::info('Midtrans webhook received', [
            'headers' => $request->headers->all(),
            'body' => $request->all()
        ]);

        // Get the signature from headers
        $signature = $request->header('X-Midtrans-Signature');
        $data = $request->all();

        // Verify signature for security
        if (!$signature || !$this->midtransService->verifySignature($data, $signature)) {
            Log::warning('Invalid Midtrans webhook signature', [
                'signature' => $signature,
                'data' => $data
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Invalid signature'
            ], 401);
        }

        // Process the webhook
        $processed = $this->midtransService->processWebhook($data);

        if ($processed) {
            Log::info('Midtrans webhook processed successfully', [
                'order_id' => $data['order_id'] ?? null
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Webhook processed successfully'
            ]);
        }

        Log::error('Failed to process Midtrans webhook', [
            'data' => $data
        ]);

        return response()->json([
            'status' => 'error',
            'message' => 'Failed to process webhook'
        ], 500);
    }

    /**
     * Test webhook endpoint (for development)
     */
    public function testWebhook(Request $request)
    {
        if (!app()->environment('local')) {
            return response()->json(['message' => 'Not available in production'], 403);
        }

        // Sample webhook data for testing
        $testData = [
            'transaction_time' => now()->toISOString(),
            'transaction_status' => 'settlement',
            'transaction_id' => 'test-' . time(),
            'status_message' => 'midtrans payment notification',
            'status_code' => '200',
            'signature_key' => 'test-signature',
            'payment_type' => 'bank_transfer',
            'order_id' => $request->input('order_id', 'ZL-1-1-' . time()),
            'merchant_id' => 'test-merchant',
            'gross_amount' => $request->input('amount', '100000.00'),
            'fraud_status' => 'accept',
            'currency' => 'IDR'
        ];

        $processed = $this->midtransService->processWebhook($testData);

        return response()->json([
            'status' => $processed ? 'success' : 'error',
            'message' => $processed ? 'Test webhook processed' : 'Failed to process test webhook',
            'data' => $testData
        ]);
    }
}
