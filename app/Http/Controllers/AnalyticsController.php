<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\TestAttempt;
use App\Models\Test;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'date_range' => 'nullable|array|size:2',
            'date_range.*' => 'nullable|date',
            'target' => 'nullable|string',
        ]);

        $query = User::query();

        if (isset($filters['target']) && $filters['target'] !== 'all') {
            $query->where('target', $filters['target']);
        }

        $users = $query->get();
        $userIds = $users->pluck('id');

        $testAttemptsQuery = TestAttempt::whereIn('user_id', $userIds);

        if (isset($filters['date_range']) && $filters['date_range'][0] && $filters['date_range'][1]) {
            $startDate = Carbon::parse($filters['date_range'][0])->startOfDay();
            $endDate = Carbon::parse($filters['date_range'][1])->endOfDay();
            $testAttemptsQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        $testAttempts = $testAttemptsQuery->get();

        // KPIs
        $totalUsers = $users->count();
        $totalTryoutsCompleted = $testAttempts->count();
        $avgStudyTime = $users->avg('study_time_per_week'); // Assuming this field exists
        $tryoutPassRate = $testAttempts->where('score', '>=', 75)->count() / ($totalTryoutsCompleted ?: 1) * 100;

        // Performance Over Time
        $performanceOverTime = $testAttempts->groupBy(function ($attempt) {
            return $attempt->created_at->format('Y-m-d');
        })->map(function ($dayAttempts) {
            return [
                'date' => $dayAttempts->first()->created_at->format('Y-m-d'),
                'score' => $dayAttempts->avg('score'),
                'study_time' => $dayAttempts->sum('duration_minutes') / 60, // Example
            ];
        })->values();

        // Tryout Comparison (Example with latest 5 tryouts)
        $latestTryouts = Test::latest()->take(5)->get();
        $tryoutComparison = $latestTryouts->map(function ($tryout) use ($userIds) {
            $userAttempts = TestAttempt::where('test_id', $tryout->id)->whereIn('user_id', $userIds);
            $averageScore = TestAttempt::where('test_id', $tryout->id)->avg('score');
            return [
                'name' => $tryout->name,
                'user_score' => $userAttempts->avg('score'),
                'average_score' => $averageScore,
            ];
        });

        // Category Performance
        $categoryPerformance = [
            ['name' => 'SKD', 'score' => 78],
            ['name' => 'TPA', 'score' => 85],
            ['name' => 'Psikologi', 'score' => 72],
        ];

        return response()->json([
            'data' => [
                'kpi' => [
                    'total_users' => $totalUsers,
                    'total_tryouts_completed' => $totalTryoutsCompleted,
                    'avg_study_time' => $avgStudyTime,
                    'tryout_pass_rate' => $tryoutPassRate,
                ],
                'performance_over_time' => $performanceOverTime,
                'tryout_comparison' => $tryoutComparison,
                'category_performance' => $categoryPerformance,
            ]
        ]);
    }
}

