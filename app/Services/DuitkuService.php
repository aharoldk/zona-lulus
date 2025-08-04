<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class DuitkuService
{
    private $merchantCode;
    private $apiKey;
    private $baseUrl;
    private $environment;

    public function __construct()
    {
        $this->merchantCode = config('services.duitku.merchant_code');
        $this->apiKey = config('services.duitku.api_key');
        $this->environment = config('services.duitku.environment', 'sandbox');
        $this->baseUrl = $this->environment === 'production'
            ? config('services.duitku.production_url')
            : config('services.duitku.sandbox_url');
    }

    /**
     * Create payment transaction
     */
    public function createTransaction($paymentData)
    {
        try {
            $orderId = $paymentData['order_id'];
            $amount = $paymentData['amount'];
            $paymentMethod = $paymentData['payment_method'];
            $customerDetails = $paymentData['customer_details'];
            $itemDetails = $paymentData['item_details'];

            // Generate signature for authentication
            $signature = $this->generateSignature($orderId, $amount);

            $payload = [
                'merchantCode' => $this->merchantCode,
                'paymentAmount' => $amount,
                'paymentMethod' => $paymentMethod,
                'merchantOrderId' => $orderId,
                'productDetails' => $itemDetails['name'],
                'additionalParam' => '',
                'merchantUserInfo' => json_encode($customerDetails),
                'customerVaName' => $customerDetails['name'],
                'email' => $customerDetails['email'],
                'phoneNumber' => $customerDetails['phone'],
                'itemDetails' => json_encode([
                    [
                        'name' => $itemDetails['name'],
                        'price' => $amount,
                        'quantity' => 1
                    ]
                ]),
                'customerDetail' => json_encode($customerDetails),
                'callbackUrl' => config('services.duitku.callback_url'),
                'returnUrl' => config('services.duitku.return_url'),
                'signature' => $signature,
                'expiryPeriod' => 1440 // 24 hours in minutes
            ];

            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($this->baseUrl . '/transaction/request', $payload);

            if ($response->successful()) {
                $result = $response->json();

                if (isset($result['statusCode']) && $result['statusCode'] === '00') {
                    return [
                        'success' => true,
                        'data' => $result,
                        'payment_url' => $result['paymentUrl'] ?? null,
                        'reference' => $result['reference'] ?? null,
                        'va_number' => $result['vaNumber'] ?? null,
                    ];
                } else {
                    Log::error('Duitku transaction creation failed', [
                        'response' => $result,
                        'payload' => $payload
                    ]);

                    return [
                        'success' => false,
                        'message' => $result['statusMessage'] ?? 'Transaction creation failed',
                        'data' => $result
                    ];
                }
            } else {
                Log::error('Duitku API request failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'payload' => $payload
                ]);

                return [
                    'success' => false,
                    'message' => 'Failed to connect to payment gateway',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            Log::error('Duitku service error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'payload' => $paymentData ?? null
            ]);

            return [
                'success' => false,
                'message' => 'Payment service error: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Check transaction status
     */
    public function checkTransactionStatus($orderId)
    {
        try {
            $signature = $this->generateStatusSignature($orderId);

            $payload = [
                'merchantCode' => $this->merchantCode,
                'merchantOrderId' => $orderId,
                'signature' => $signature
            ];

            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($this->baseUrl . '/transaction/status', $payload);

            if ($response->successful()) {
                $result = $response->json();

                return [
                    'success' => true,
                    'data' => $result,
                    'status' => $result['statusCode'] ?? null,
                    'amount' => $result['amount'] ?? null,
                ];
            } else {
                Log::error('Duitku status check failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'order_id' => $orderId
                ]);

                return [
                    'success' => false,
                    'message' => 'Failed to check transaction status',
                    'data' => null
                ];
            }
        } catch (Exception $e) {
            Log::error('Duitku status check error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'order_id' => $orderId
            ]);

            return [
                'success' => false,
                'message' => 'Status check error: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Handle callback from Duitku
     */
    public function handleCallback($callbackData)
    {
        try {
            $orderId = $callbackData['merchantOrderId'] ?? null;
            $amount = $callbackData['amount'] ?? null;
            $signature = $callbackData['signature'] ?? null;

            // Verify signature
            if (!$this->verifyCallbackSignature($orderId, $amount, $signature)) {
                Log::warning('Invalid Duitku callback signature', $callbackData);
                return [
                    'success' => false,
                    'message' => 'Invalid signature'
                ];
            }

            // Find payment record
            $payment = Payment::where('order_id', $orderId)->first();

            if (!$payment) {
                Log::warning('Payment not found for Duitku callback', [
                    'order_id' => $orderId,
                    'callback_data' => $callbackData
                ]);
                return [
                    'success' => false,
                    'message' => 'Payment not found'
                ];
            }

            // Update payment status based on callback
            $statusCode = $callbackData['resultCode'] ?? null;
            $transactionStatus = $this->mapDuitkuStatus($statusCode);

            $payment->update([
                'transaction_id' => $callbackData['reference'] ?? null,
                'transaction_status' => $transactionStatus,
                'status' => $transactionStatus === 'paid' ? 'completed' : 'failed',
                'paid_at' => $transactionStatus === 'paid' ? now() : null,
                'metadata' => array_merge($payment->metadata ?? [], [
                    'duitku_callback' => $callbackData,
                    'callback_received_at' => now()->toISOString()
                ])
            ]);

            Log::info('Duitku payment status updated', [
                'order_id' => $orderId,
                'status' => $transactionStatus,
                'payment_id' => $payment->id
            ]);

            return [
                'success' => true,
                'message' => 'Payment status updated',
                'payment' => $payment
            ];

        } catch (Exception $e) {
            Log::error('Duitku callback handling error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'callback_data' => $callbackData ?? null
            ]);

            return [
                'success' => false,
                'message' => 'Callback handling error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get available payment methods
     */
    public function getPaymentMethods($amount)
    {
        try {
            $signature = $this->generatePaymentMethodSignature($amount);

            $payload = [
                'merchantcode' => $this->merchantCode,
                'amount' => $amount,
                'signature' => $signature
            ];

            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($this->baseUrl . '/paymentmethod/getpaymentmethod', $payload);

            if ($response->successful()) {
                $result = $response->json();

                return [
                    'success' => true,
                    'data' => $result['paymentFee'] ?? [],
                ];
            } else {
                Log::error('Failed to get Duitku payment methods', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                return [
                    'success' => false,
                    'message' => 'Failed to get payment methods',
                    'data' => []
                ];
            }
        } catch (Exception $e) {
            Log::error('Duitku payment methods error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Payment methods error: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }

    /**
     * Generate signature for transaction request
     */
    private function generateSignature($orderId, $amount)
    {
        $string = $this->merchantCode . $orderId . $amount . $this->apiKey;
        return md5($string);
    }

    /**
     * Generate signature for status check
     */
    private function generateStatusSignature($orderId)
    {
        $string = $this->merchantCode . $orderId . $this->apiKey;
        return md5($string);
    }

    /**
     * Generate signature for payment methods
     */
    private function generatePaymentMethodSignature($amount)
    {
        $string = $this->merchantCode . $amount . $this->apiKey;
        return md5($string);
    }

    /**
     * Verify callback signature
     */
    private function verifyCallbackSignature($orderId, $amount, $signature)
    {
        $expectedSignature = md5($this->merchantCode . $amount . $orderId . $this->apiKey);
        return hash_equals($expectedSignature, $signature);
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
     * Format amount for Duitku (remove decimal places)
     */
    private function formatAmount($amount)
    {
        return (int) ($amount * 100); // Convert to smallest currency unit
    }
}
