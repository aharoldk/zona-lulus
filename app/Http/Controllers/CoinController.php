<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CoinController extends Controller
{
    public function getBalance()
    {
        $user = Auth::user();
        return response()->json([
            'coins' => $user->coins,
            'transactions' => $user->coinTransactions()
                ->latest()
                ->take(10)
                ->get()
        ]);
    }

    public function purchaseCoins(Request $request)
    {
        $request->validate([
            'package' => 'required|string|in:small,medium,large,premium',
            'payment_method' => 'required|string|in:credit_card,bank_transfer,e_wallet'
        ]);

        $packages = [
            'small' => ['coins' => 100, 'price' => 50000],
            'medium' => ['coins' => 250, 'price' => 120000],
            'large' => ['coins' => 500, 'price' => 230000],
            'premium' => ['coins' => 1000, 'price' => 450000]
        ];

        $package = $packages[$request->package];
        $user = Auth::user();

        try {
            DB::beginTransaction();

            // Create payment record
            $payment = $user->payments()->create([
                'amount' => $package['price'],
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'metadata' => [
                    'type' => 'coin_purchase',
                    'package' => $request->package,
                    'coins' => $package['coins']
                ]
            ]);

            // For demo purposes, we'll simulate successful payment
            // In production, integrate with actual payment gateway
            $payment->update(['status' => 'completed']);

            // Add coins to user account
            $user->addCoins(
                $package['coins'],
                "Purchase {$request->package} coin package",
                ['payment_id' => $payment->id, 'package' => $request->package]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Coins purchased successfully',
                'coins_added' => $package['coins'],
                'new_balance' => $user->fresh()->coins,
                'payment_id' => $payment->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to purchase coins: ' . $e->getMessage()
            ], 500);
        }
    }

    public function spendCoins(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
            'description' => 'required|string',
            'metadata' => 'nullable|array'
        ]);

        $user = Auth::user();

        try {
            $transaction = $user->spendCoins(
                $request->amount,
                $request->description,
                $request->metadata ?? []
            );

            return response()->json([
                'success' => true,
                'message' => 'Coins spent successfully',
                'coins_spent' => $request->amount,
                'new_balance' => $user->fresh()->coins,
                'transaction_id' => $transaction->id
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getTransactionHistory(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);

        $transactions = $user->coinTransactions()
            ->latest()
            ->paginate($perPage);

        return response()->json($transactions);
    }

    public function getCoinPackages()
    {
        return response()->json([
            'packages' => [
                [
                    'id' => 'small',
                    'name' => 'Paket Kecil',
                    'coins' => 100,
                    'price' => 50000,
                    'bonus' => 0,
                    'popular' => false
                ],
                [
                    'id' => 'medium',
                    'name' => 'Paket Sedang',
                    'coins' => 250,
                    'price' => 120000,
                    'bonus' => 20,
                    'popular' => true
                ],
                [
                    'id' => 'large',
                    'name' => 'Paket Besar',
                    'coins' => 500,
                    'price' => 230000,
                    'bonus' => 50,
                    'popular' => false
                ],
                [
                    'id' => 'premium',
                    'name' => 'Paket Premium',
                    'coins' => 1000,
                    'price' => 450000,
                    'bonus' => 100,
                    'popular' => false
                ]
            ]
        ]);
    }
}
