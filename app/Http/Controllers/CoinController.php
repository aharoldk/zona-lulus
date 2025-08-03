<?php

namespace App\Http\Controllers;

use App\Models\CoinPackage;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CoinController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Get available coin packages
     */
    public function getPackages()
    {
        try {
            $packages = CoinPackage::active()->ordered()->get();

            return response()->json([
                'success' => true,
                'data' => $packages->map(function ($package) {
                    return [
                        'id' => $package->id,
                        'name' => $package->name,
                        'description' => $package->description,
                        'coins' => $package->coins,
                        'bonus' => $package->bonus,
                        'price' => $package->price,
                        'total_coins' => $package->total_coins,
                        'popular' => $package->popular
                    ];
                })
            ]);
        } catch (\Exception $e) {
            Log::error('Get coin packages error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil paket koin'
            ], 500);
        }
    }

    /**
     * Create coin purchase
     */
    public function purchase(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'package_id' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak valid',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $packageId = $request->package_id;
            $coinPackage = CoinPackage::where('id', $packageId)
                ->where('active', true)
                ->first();

            if (!$coinPackage) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paket tidak ditemukan atau tidak aktif'
                ], 404);
            }

            $package = [
                'coins' => $coinPackage->coins,
                'price' => $coinPackage->price,
                'bonus' => $coinPackage->bonus
            ];

            // Check if Midtrans is configured
            if (!$this->midtransService->isConfigured()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Layanan pembayaran belum dikonfigurasi'
                ], 500);
            }

            // Create payment record
            $payment = $this->midtransService->createCoinPayment(
                $user,
                $package['coins'],
                $package['price'],
                $package
            );

            // Create Snap token
            $snapToken = $this->midtransService->createCoinSnapToken($payment);

            if (!$snapToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membuat token pembayaran'
                ], 500);
            }

            Log::info('Coin purchase initiated', [
                'user_id' => $user->id,
                'payment_id' => $payment->id,
                'package_id' => $packageId,
                'coins' => $package['coins'],
                'price' => $package['price']
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_id' => $payment->id,
                    'snap_token' => $snapToken,
                    'order_id' => $payment->midtrans_order_id,
                    'amount' => $payment->amount,
                    'coins' => $package['coins'],
                    'bonus_coins' => $package['bonus'],
                    'total_coins' => $package['coins'] + $package['bonus']
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Coin purchase error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses pembelian'
            ], 500);
        }
    }

    /**
     * Get user's coin transaction history
     */
    public function getTransactionHistory()
    {
        try {
            $user = Auth::user();

            $transactions = $user->coinTransactions()
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);

        } catch (\Exception $e) {
            Log::error('Get transaction history error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil riwayat transaksi'
            ], 500);
        }
    }

    /**
     * Get current user's coin balance
     */
    public function getBalance()
    {
        try {
            $user = Auth::user();

            return response()->json([
                'success' => true,
                'data' => [
                    'balance' => $user->coins ?? 0,
                    'user_name' => $user->name
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get coin balance error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil saldo koin'
            ], 500);
        }
    }
}
