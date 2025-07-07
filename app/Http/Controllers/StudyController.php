<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\StudySession;
use Carbon\Carbon;

class StudyController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();

        $totalHours = $user->studySessions()->sum('duration_minutes') / 60;
        $completedMaterials = $user->studySessions()->distinct('material_name')->count();

        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        $weeklyMinutes = $user->studySessions()->whereBetween('date', [$startOfWeek, $endOfWeek])->sum('duration_minutes');
        $weeklyTarget = $user->weekly_study_goal ?? 10 * 60; // Default to 10 hours
        $weeklyProgress = $weeklyTarget > 0 ? ($weeklyMinutes / $weeklyTarget) * 100 : 0;

        $totalDays = $user->created_at->diffInDays(Carbon::now()) + 1;
        $dailyAverage = ($totalHours * 60) / $totalDays;

        return response()->json([
            'data' => [
                'total_study_hours' => round($totalHours, 2),
                'completed_materials' => $completedMaterials,
                'daily_average_minutes' => round($dailyAverage, 2),
                'weekly_progress' => round($weeklyProgress, 2),
            ]
        ]);
    }

    public function getRecentActivity(Request $request)
    {
        $user = $request->user();
        $recentActivity = $user->studySessions()->latest()->take(5)->get();
        return response()->json(['data' => $recentActivity]);
    }

    public function logSession(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'material_name' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1',
            'date' => 'required|date',
            'category' => 'required|string|max:255',
        ]);

        $session = $user->studySessions()->create($validated);

        return response()->json(['data' => $session, 'message' => 'Sesi belajar berhasil dicatat'], 201);
    }
}

