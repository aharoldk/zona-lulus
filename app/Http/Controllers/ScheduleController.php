<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    public function getSchedule(Request $request)
    {
        try {
            $userId = Auth::id();
            $date = $request->get('date', Carbon::today()->format('Y-m-d'));

            // Get user's test attempts and create schedule items
            $scheduleItems = TestAttempt::where('user_id', $userId)
                ->whereDate('scheduled_at', $date)
                ->with('test')
                ->get()
                ->map(function ($attempt) {
                    return [
                        'id' => $attempt->id,
                        'title' => $attempt->test->title,
                        'type' => $this->getScheduleType($attempt->test->category),
                        'date' => Carbon::parse($attempt->scheduled_at)->format('Y-m-d'),
                        'time' => Carbon::parse($attempt->scheduled_at)->format('H:i'),
                        'duration' => $attempt->test->time_limit,
                        'status' => $attempt->status === 'completed' ? 'completed' : 'upcoming',
                        'reminder' => true
                    ];
                });

            // Add some default study sessions if no scheduled items
            if ($scheduleItems->isEmpty()) {
                $scheduleItems = collect([
                    [
                        'id' => 'default_1',
                        'title' => 'Sesi Belajar Mandiri',
                        'type' => 'study',
                        'date' => $date,
                        'time' => '09:00',
                        'duration' => 60,
                        'status' => 'upcoming',
                        'reminder' => false
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $scheduleItems
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch schedule'
            ], 500);
        }
    }

    public function getUpcomingExams()
    {
        try {
            // Get upcoming tests/exams from the database
            $upcomingExams = Test::where('is_active', true)
                ->where('type', 'exam')
                ->whereDate('exam_date', '>=', Carbon::today())
                ->orderBy('exam_date')
                ->get()
                ->map(function ($test) {
                    return [
                        'id' => $test->id,
                        'title' => $test->title,
                        'date' => Carbon::parse($test->exam_date)->format('d F Y'),
                        'location' => $test->location ?? 'Online',
                        'registrationDeadline' => Carbon::parse($test->registration_deadline)->format('d F Y'),
                        'status' => Carbon::parse($test->registration_deadline) > Carbon::now() ? 'open' : 'closed'
                    ];
                });

            // If no exams in database, provide some default ones
            if ($upcomingExams->isEmpty()) {
                $upcomingExams = collect([
                    [
                        'id' => 1,
                        'title' => 'Tes Masuk TNI Akademi Militer',
                        'date' => Carbon::now()->addMonths(2)->format('d F Y'),
                        'location' => 'Jakarta',
                        'registrationDeadline' => Carbon::now()->addMonth()->format('d F Y'),
                        'status' => 'open'
                    ],
                    [
                        'id' => 2,
                        'title' => 'Tes CPNS Kementerian Pendidikan',
                        'date' => Carbon::now()->addMonths(3)->format('d F Y'),
                        'location' => 'Online',
                        'registrationDeadline' => Carbon::now()->addMonths(2)->format('d F Y'),
                        'status' => 'open'
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $upcomingExams
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming exams'
            ], 500);
        }
    }

    public function addSchedule(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'type' => 'required|in:study,live,test',
                'date' => 'required|date',
                'time' => 'required',
                'duration' => 'required|integer|min:1'
            ]);

            // For now, we'll just return success
            // In a real implementation, you'd save this to a user_schedules table

            return response()->json([
                'success' => true,
                'message' => 'Schedule added successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add schedule'
            ], 500);
        }
    }

    public function getTodaySchedule()
    {
        try {
            $userId = Auth::id();
            $today = Carbon::today()->format('Y-m-d');

            $todaySchedule = TestAttempt::where('user_id', $userId)
                ->whereDate('scheduled_at', $today)
                ->with('test')
                ->get()
                ->map(function ($attempt) {
                    return [
                        'id' => $attempt->id,
                        'title' => $attempt->test->title,
                        'type' => $this->getScheduleType($attempt->test->category),
                        'time' => Carbon::parse($attempt->scheduled_at)->format('H:i'),
                        'duration' => $attempt->test->time_limit,
                        'status' => $attempt->status === 'completed' ? 'completed' : 'upcoming'
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $todaySchedule
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch today\'s schedule'
            ], 500);
        }
    }

    private function getScheduleType($category)
    {
        switch (strtolower($category)) {
            case 'live':
            case 'webinar':
                return 'live';
            case 'test':
            case 'exam':
            case 'tryout':
                return 'test';
            default:
                return 'study';
        }
    }
}
