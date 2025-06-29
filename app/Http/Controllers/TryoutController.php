<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TryoutController extends Controller
{
    /**
     * Get all tests/tryouts with filtering
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('tests')->where('is_active', true);

            // Apply category filter
            if ($request->has('category') && $request->category !== 'all') {
                $query->where('category', $request->category);
            }

            // Apply search filter
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'ILIKE', '%' . $request->search . '%')
                      ->orWhere('description', 'ILIKE', '%' . $request->search . '%');
                });
            }

            $tests = $query->orderBy('created_at', 'desc')->get();

            // Add additional computed fields
            $tests = $tests->map(function ($test) {
                // Get question count
                $test->questions_count = DB::table('questions')
                    ->where('test_id', $test->id)
                    ->count();

                // Get participant count from test attempts
                $test->participants_count = DB::table('test_attempts')
                    ->where('test_id', $test->id)
                    ->distinct('user_id')
                    ->count();

                // Calculate average score
                $avgScore = DB::table('test_attempts')
                    ->where('test_id', $test->id)
                    ->where('is_completed', true)
                    ->avg('score');

                $test->average_score = $avgScore ? round($avgScore, 1) : 0;

                // Format price
                $test->price_formatted = $test->is_free ? 'Gratis' : 'Premium';

                // Get difficulty level (you might want to add this to tests table)
                $test->difficulty = $this->calculateDifficulty($test->average_score);

                return $test;
            });

            return response()->json([
                'success' => true,
                'data' => $tests
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's test attempts history
     */
    public function getUserAttempts(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $attempts = DB::table('test_attempts')
                ->join('tests', 'test_attempts.test_id', '=', 'tests.id')
                ->where('test_attempts.user_id', $userId)
                ->where('test_attempts.is_completed', true)
                ->select(
                    'test_attempts.*',
                    'tests.title as test_title',
                    'tests.category'
                )
                ->orderBy('test_attempts.completed_at', 'desc')
                ->get();

            // Add ranking for each attempt
            $attempts = $attempts->map(function ($attempt) {
                // Calculate user's rank for this test
                $rank = DB::table('test_attempts')
                    ->where('test_id', $attempt->test_id)
                    ->where('is_completed', true)
                    ->where('score', '>', $attempt->score)
                    ->count() + 1;

                $attempt->rank = $rank;
                $attempt->status = 'completed';
                $attempt->date_formatted = \Carbon\Carbon::parse($attempt->completed_at)->diffForHumans();

                return $attempt;
            });

            return response()->json([
                'success' => true,
                'data' => $attempts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user attempts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start a new test attempt
     */
    public function startTest(Request $request, $testId)
    {
        try {
            $userId = $request->user()->id;

            // Check if test exists and is active
            $test = DB::table('tests')
                ->where('id', $testId)
                ->where('is_active', true)
                ->first();

            if (!$test) {
                return response()->json([
                    'success' => false,
                    'message' => 'Test not found or inactive'
                ], 404);
            }

            // Check attempts limit
            $userAttempts = DB::table('test_attempts')
                ->where('test_id', $testId)
                ->where('user_id', $userId)
                ->count();

            if ($userAttempts >= $test->attempts_allowed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maximum attempts reached for this test'
                ], 400);
            }

            // Create new test attempt
            $attemptId = DB::table('test_attempts')->insertGetId([
                'user_id' => $userId,
                'test_id' => $testId,
                'started_at' => now(),
                'is_completed' => false,
                'score' => 0,
                'total_questions' => 0,
                'correct_answers' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'attempt_id' => $attemptId,
                    'test' => $test
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start test',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit test answers and calculate score
     */
    public function submitTest(Request $request, $attemptId)
    {
        try {
            $request->validate([
                'answers' => 'required|array',
                'time_taken' => 'required|integer'
            ]);

            $userId = $request->user()->id;
            $answers = $request->answers;
            $timeTaken = $request->time_taken;

            // Get the test attempt
            $attempt = DB::table('test_attempts')
                ->where('id', $attemptId)
                ->where('user_id', $userId)
                ->where('is_completed', false)
                ->first();

            if (!$attempt) {
                return response()->json([
                    'success' => false,
                    'message' => 'Test attempt not found or already completed'
                ], 404);
            }

            // Get questions for this test
            $questions = DB::table('questions')
                ->where('test_id', $attempt->test_id)
                ->get();

            $totalQuestions = $questions->count();
            $correctAnswers = 0;

            // Calculate score
            foreach ($questions as $question) {
                $userAnswer = $answers[$question->id] ?? null;
                if ($userAnswer && $userAnswer === $question->correct_answer) {
                    $correctAnswers++;
                }
            }

            $score = $totalQuestions > 0 ? round(($correctAnswers / $totalQuestions) * 100, 2) : 0;

            // Update test attempt
            DB::table('test_attempts')
                ->where('id', $attemptId)
                ->update([
                    'is_completed' => true,
                    'completed_at' => now(),
                    'score' => $score,
                    'total_questions' => $totalQuestions,
                    'correct_answers' => $correctAnswers,
                    'time_taken' => $timeTaken,
                    'answers' => json_encode($answers),
                    'updated_at' => now()
                ]);

            // Calculate rank
            $rank = DB::table('test_attempts')
                ->where('test_id', $attempt->test_id)
                ->where('is_completed', true)
                ->where('score', '>', $score)
                ->count() + 1;

            return response()->json([
                'success' => true,
                'data' => [
                    'score' => $score,
                    'correct_answers' => $correctAnswers,
                    'total_questions' => $totalQuestions,
                    'time_taken' => $timeTaken,
                    'rank' => $rank,
                    'percentage' => $score
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit test',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate difficulty based on average score
     */
    private function calculateDifficulty($averageScore)
    {
        if ($averageScore >= 80) return 'Mudah';
        if ($averageScore >= 60) return 'Menengah';
        return 'Sulit';
    }
}
