<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\Test;
use Illuminate\Support\Facades\Auth;

class QuestionBankController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Test::with(['questions'])
                ->where('is_active', true)
                ->where('type', 'practice'); // Assuming practice type for question bank

            // Filter by subject if provided
            if ($request->has('subject') && $request->subject !== 'all') {
                $query->where('category', $request->subject);
            }

            // Filter by difficulty if provided
            if ($request->has('difficulty') && $request->difficulty !== 'all') {
                $query->where('difficulty', $request->difficulty);
            }

            // Search by title if provided
            if ($request->has('search') && !empty($request->search)) {
                $query->where('title', 'LIKE', '%' . $request->search . '%');
            }

            $questionSets = $query->get()->map(function ($test) {
                return [
                    'id' => $test->id,
                    'title' => $test->title,
                    'subject' => $test->category,
                    'difficulty' => $test->difficulty,
                    'questions' => $test->questions->count(),
                    'completed' => $this->getUserProgress($test->id),
                    'timeEstimate' => $test->time_limit,
                    'category' => $test->category,
                    'description' => $test->description
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $questionSets
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch question sets'
            ], 500);
        }
    }

    public function getStats()
    {
        try {
            $userId = Auth::id();
            $totalSets = Test::where('type', 'practice')->where('is_active', true)->count();
            $completedSets = $this->getCompletedSetsCount($userId);
            $totalQuestions = Question::whereHas('test', function($query) {
                $query->where('type', 'practice')->where('is_active', true);
            })->count();
            $answeredQuestions = $this->getAnsweredQuestionsCount($userId);

            return response()->json([
                'success' => true,
                'data' => [
                    'totalSets' => $totalSets,
                    'completedSets' => $completedSets,
                    'totalQuestions' => $totalQuestions,
                    'answeredQuestions' => $answeredQuestions
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch stats'
            ], 500);
        }
    }

    private function getUserProgress($testId)
    {
        $userId = Auth::id();
        // This would need a user_progress table or similar to track individual question progress
        // For now, return 0 - you can implement this based on your progress tracking system
        return 0;
    }

    private function getCompletedSetsCount($userId)
    {
        // Implement based on your progress tracking system
        return 0;
    }

    private function getAnsweredQuestionsCount($userId)
    {
        // Implement based on your progress tracking system
        return 0;
    }
}
