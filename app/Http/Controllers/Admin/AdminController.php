<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Payment;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin'); // We'll create this middleware
    }

    public function dashboard()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'new_users_today' => User::whereDate('created_at', today())->count(),
                'new_users_this_month' => User::whereMonth('created_at', now()->month)->count(),
                'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
                'revenue_today' => Payment::where('status', 'completed')
                    ->whereDate('created_at', today())
                    ->sum('amount'),
                'revenue_this_month' => Payment::where('status', 'completed')
                    ->whereMonth('created_at', now()->month)
                    ->sum('amount'),
                'pending_payments' => Payment::where('status', 'pending')->count(),
                'failed_payments' => Payment::where('status', 'failed')->count(),
                'total_courses' => Course::count(),
                'active_users' => User::where('last_login_at', '>=', now()->subDays(30))->count(),
            ];

            // Recent activities
            $recent_payments = Payment::with(['user', 'course'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            $recent_users = User::orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Revenue chart data for the last 30 days
            $revenue_chart = Payment::where('status', 'completed')
                ->where('created_at', '>=', now()->subDays(30))
                ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Payment methods breakdown
            $payment_methods = Payment::where('status', 'completed')
                ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('payment_method')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'recent_payments' => $recent_payments,
                    'recent_users' => $recent_users,
                    'revenue_chart' => $revenue_chart,
                    'payment_methods' => $payment_methods
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function users(Request $request)
    {
        try {
            $query = User::query();

            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('phone', 'LIKE', "%{$search}%");
                });
            }

            // Filter by target
            if ($request->has('target') && $request->target !== 'all') {
                $query->where('target', $request->target);
            }

            // Filter by registration date
            if ($request->has('date_from') && $request->has('date_to')) {
                $query->whereBetween('created_at', [
                    Carbon::parse($request->date_from)->startOfDay(),
                    Carbon::parse($request->date_to)->endOfDay()
                ]);
            }

            $users = $query->withCount(['payments', 'courseProgress'])
                ->with(['payments' => function($q) {
                    $q->where('status', 'completed');
                }])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load users data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
