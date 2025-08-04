<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Exception;

// Include the Duitku PHP SDK
require_once base_path('vendor/duitkupg/duitku-php/Duitku.php');

class DuitkuService
{
    private $merchantCode;
    private $apiKey;
    private $environment;
    private $config;

    public function __construct()
    {
        $this->merchantCode = config('services.duitku.merchant_code');
        $this->apiKey = config('services.duitku.api_key');
        $this->environment = config('services.duitku.environment', 'sandbox');

        // Create Duitku Config object
        $this->config = new \Duitku\Config(
            $this->apiKey,
            $this->merchantCode,
            $this->environment === 'sandbox', // isSandboxMode
            true, // isSanitizedMode
            true  // duitkuLogs
        );
    }

    /**
     * Create payment transaction using official Duitku SDK
     */
    public function createTransaction($paymentData)
    {
        try {
            $orderId = $paymentData['order_id'];
            $amount = $paymentData['amount'];
            $paymentMethod = $paymentData['payment_method'];
            $customerDetails = $paymentData['customer_details'];
            $itemDetails = $paymentData['item_details'];

            // Prepare customer detail for Duitku format
            $customerDetail = [
                'firstName' => $customerDetails['first_name'] ?? $customerDetails['name'],
                'lastName' => $customerDetails['last_name'] ?? '',
                'email' => $customerDetails['email'],
                'phoneNumber' => $customerDetails['phone'],
                'billingAddress' => [
                    'firstName' => $customerDetails['first_name'] ?? $customerDetails['name'],
                    'lastName' => $customerDetails['last_name'] ?? '',
                    'address' => $customerDetails['address'] ?? '',
                    'city' => $customerDetails['city'] ?? '',
                    'postalCode' => $customerDetails['postal_code'] ?? '',
                    'phone' => $customerDetails['phone'],
                    'countryCode' => 'ID'
                ],
                'shippingAddress' => [
                    'firstName' => $customerDetails['first_name'] ?? $customerDetails['name'],
                    'lastName' => $customerDetails['last_name'] ?? '',
                    'address' => $customerDetails['address'] ?? '',
                    'city' => $customerDetails['city'] ?? '',
                    'postalCode' => $customerDetails['postal_code'] ?? '',
                    'phone' => $customerDetails['phone'],
                    'countryCode' => 'ID'
                ]
            ];

            // Item details
            $itemDetail = [
                [
                    'name' => $itemDetails['name'],
                    'price' => $amount,
                    'quantity' => 1
                ]
            ];

            // Prepare payload for Duitku API
            $params = [
                'paymentAmount' => $amount,
                'paymentMethod' => $paymentMethod,
                'merchantOrderId' => $orderId,
                'productDetails' => $itemDetails['name'],
                'additionalParam' => '',
                'merchantUserInfo' => '',
                'customerVaName' => $customerDetails['name'],
                'email' => $customerDetails['email'],
                'phoneNumber' => $customerDetails['phone'],
                'itemDetails' => $itemDetail,
                'customerDetail' => $customerDetail,
                'callbackUrl' => config('services.duitku.callback_url'),
                'returnUrl' => config('services.duitku.return_url'),
                'expiryPeriod' => 1440 // 24 hours in minutes
            ];

            // Create transaction using Duitku API
            $response = \Duitku\Api::createInvoice($params, $this->config);

            // Parse JSON response
            $responseData = json_decode($response, true);

            if ($responseData && isset($responseData['statusCode'])) {
                if ($responseData['statusCode'] === '00') {
                    return [
                        'success' => true,
                        'data' => $responseData,
                        'payment_url' => $responseData['paymentUrl'] ?? null,
                        'reference' => $responseData['reference'] ?? null,
                        'va_number' => $responseData['vaNumber'] ?? null,
                    ];
                } else {
                    Log::error('Duitku transaction creation failed', [
                        'response' => $responseData
                    ]);

                    return [
                        'success' => false,
                        'message' => $responseData['statusMessage'] ?? 'Transaction creation failed',
                        'data' => $responseData
                    ];
                }
            } else {
                Log::error('Duitku API returned invalid response', [
                    'response' => $response
                ]);

                return [
                    'success' => false,
                    'message' => 'Invalid response from payment gateway',
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
     * Check transaction status using official Duitku SDK
     */
    public function checkTransactionStatus($orderId)
    {
        try {
            $response = \Duitku\Api::transactionStatus($orderId, $this->config);

            // Parse JSON response
            $responseData = json_decode($response, true);

            if ($responseData) {
                return [
                    'success' => true,
                    'data' => $responseData,
                    'status' => $responseData['statusCode'] ?? null,
                    'amount' => $responseData['amount'] ?? null,
                ];
            } else {
                Log::error('Duitku status check failed', [
                    'order_id' => $orderId,
                    'response' => $response
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

            // Verify signature manually since SDK doesn't have validateSignature method
            $expectedSignature = md5($this->merchantCode . $orderId . $amount . $this->apiKey);

            if ($signature !== $expectedSignature) {
                Log::warning('Invalid Duitku callback signature', [
                    'expected' => $expectedSignature,
                    'received' => $signature,
                    'callback_data' => $callbackData
                ]);
                return [
                    'success' => false,
                    'message' => 'Invalid signature'
                ];
            }

            // Find payment record
            $payment = Payment::where('order_id', $orderId)->first();

            if (!$payment) {
                Log::warning('Payment not found for callback', [
                    'order_id' => $orderId,
                    'callback_data' => $callbackData
                ]);

                return [
                    'success' => false,
                    'message' => 'Payment not found'
                ];
            }

            // Update payment status based on callback
            $statusCode = $callbackData['statusCode'] ?? null;

            if ($statusCode === '00') {
                $payment->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'payment_reference' => $callbackData['reference'] ?? null,
                    'callback_data' => json_encode($callbackData)
                ]);

                Log::info('Payment confirmed via Duitku callback', [
                    'order_id' => $orderId,
                    'amount' => $amount
                ]);
            } else {
                $payment->update([
                    'status' => 'failed',
                    'callback_data' => json_encode($callbackData)
                ]);

                Log::info('Payment failed via Duitku callback', [
                    'order_id' => $orderId,
                    'status_code' => $statusCode
                ]);
            }

            return [
                'success' => true,
                'payment' => $payment,
                'status' => $statusCode
            ];

        } catch (Exception $e) {
            Log::error('Duitku callback handling error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'callback_data' => $callbackData ?? null
            ]);

            return [
                'success' => false,
                'message' => 'Callback handling error: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get available payment methods from Duitku
     */
    public function getPaymentMethods($amount = 10000)
    {
        try {
            $response = \Duitku\Api::getPaymentMethod($amount, $this->config);

            // Parse JSON response
            $responseData = json_decode($response, true);

            if ($responseData && isset($responseData['paymentFee'])) {
                return [
                    'success' => true,
                    'data' => $responseData['paymentFee']
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to get payment methods',
                'data' => null
            ];
        } catch (Exception $e) {
            Log::error('Error getting payment methods: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Error getting payment methods: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }
}
