<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Support\Facades\Auth;
use App\Models\Payment;
use App\Models\Question;

class TryoutController extends Controller
{
    /**
     * Get all tests/tryouts with filtering
     */
    public function index(Request $request)
    {
        try {
            $query = Test::where('is_active', true);

            if ($request->has('category') && $request->category !== 'all') {
                $query->where('category', strtolower($request->category));
            }

            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = strtolower($request->search);
                $query->where(function($q) use ($searchTerm) {
                    $q->whereRaw('LOWER(title) LIKE ?', ['%' . $searchTerm . '%'])
                      ->orWhereRaw('LOWER(description) LIKE ?', ['%' . $searchTerm . '%']);
                });
            }

            $tests = $query->orderBy('created_at', 'desc')->get();

            // Transform the data to match frontend expectations
            $transformedTests = $tests->map(function($test) {
                return [
                    'id' => $test->id,
                    'code' => $test->code,
                    'title' => $test->title,
                    'description' => $test->description,
                    'category' => $test->category,
                    'time_limit' => $test->time_limit,
                    'attempts_allowed' => $test->attempts_allowed ?? 1,
                    'price' => $test->price ?? 0,
                    'is_active' => $test->is_active,
                    'is_free' => ($test->price ?? 0) == 0,
                    'show_result' => $test->show_result ?? true,
                    'randomize_questions' => $test->randomize_questions ?? false,
                    'isAccessibleBy' => $this->checkUserAccess($test),
                    'created_at' => $test->created_at,
                    'updated_at' => $test->updated_at
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedTests,
                'tryouts' => $transformedTests // For backward compatibility
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
     * Check if user has access to the test
     */
    private function checkUserAccess($test)
    {
        $user = Auth::user();

        // Free tests are always accessible to authenticated users
        if ($test->price == 0) {
            return true;
        }

        // Check if user has active payment for this test
//        $hasActivePayment = $this->hasActivePayment($user, $test);
//
//        if ($hasActivePayment) {
//            return true;
//        }

        return false;
    }

    /**
     * Check if user has active payment for the test
     */
    private function hasActivePayment($user, $test)
    {
        return Payment::where('user_id', $user->id)
            ->where('test_id', $test->id)
            ->where('status', 'completed')
            ->exists();
    }

    /**
     * Check direct payment records as fallback
     */
    private function checkDirectPayment($user, $test)
    {
        // Check if there's a completed payment for this test
        $payment = Payment::where('user_id', $user->id)
            ->where('test_id', $test->id)
            ->where('status', 'completed')
            ->first();

        if (!$payment) {
            return false;
        }

        // Additional checks can be added here:
        // - Check if payment is not refunded
        // - Check if access hasn't expired
        // - Check if payment amount matches current test price

        return true;
    }

    /**
     * Get user access status for the test
     */
    private function getUserAccessStatus($test)
    {
        if (!Auth::check()) {
            return $test->price == 0 ? 'active' : 'locked';
        }

        $user = Auth::user();

        // Free tests are always active
        if ($test->price == 0) {
            return 'active';
        }

        // Check payment status
        $payment = Payment::where('user_id', $user->id)
            ->where('test_id', $test->id)
            ->latest()
            ->first();

        if (!$payment) {
            return 'not_purchased';
        }

        switch ($payment->status) {
            case 'completed':
                return 'active';
            case 'pending':
                return 'pending';
            case 'failed':
                return 'payment_failed';
            case 'refunded':
                return 'refunded';
            default:
                return 'locked';
        }
    }

    /**
     * Get user's test attempts history
     */
    public function getUserAttempts(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $user = Auth::user();

            $query = TestAttempt::with('test')
                ->where('user_id', $user->id);

            // Apply filters if provided
            if ($request->has('category') && $request->category !== 'all') {
                $query->whereHas('test', function($q) use ($request) {
                    $q->where('category', strtolower($request->category));
                });
            }

            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $attempts = $query->orderBy('created_at', 'desc')->get();

            // Transform the data
            $transformedAttempts = $attempts->map(function($attempt) {
                return [
                    'id' => $attempt->id,
                    'test_id' => $attempt->test_id,
                    'test_title' => $attempt->test->title ?? 'Unknown Test',
                    'category' => $attempt->test->category ?? 'unknown',
                    'score' => $attempt->score ?? 0,
                    'time_taken' => $attempt->time_taken ?? 0,
                    'status' => $attempt->status,
                    'rank' => $attempt->rank ?? null,
                    'date_formatted' => $attempt->created_at->format('d F Y'),
                    'created_at' => $attempt->created_at,
                    'started_at' => $attempt->started_at,
                    'completed_at' => $attempt->completed_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedAttempts
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
     * Start a test attempt
     */
    public function startTest(Request $request, $id)
    {
        try {
            // Return a sample test start response
            $testSession = [
                'attempt_id' => rand(1000, 9999),
                'test_id' => (int)$id,
                'started_at' => now()->toISOString(),
                'time_limit' => 120,
                'questions_count' => 100,
                'message' => 'Test session started successfully'
            ];

            return response()->json([
                'success' => true,
                'data' => $testSession
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
     * Submit test answers
     */
    public function submitTest(Request $request, $attemptId)
    {
        try {
            $request->validate([
                'tryout_id' => 'required|integer',
                'answers' => 'required|array',
                'time_used' => 'required|integer',
                'completed_at' => 'required|date'
            ]);

            $user = auth()->user();
            $testId = $request->tryout_id;
            $userAnswers = $request->answers;
            $timeUsed = $request->time_used;
            $completedAt = $request->completed_at;

            // Find or create the test attempt
            $testAttempt = TestAttempt::where('user_id', $user->id)
                ->where('test_id', $testId)
                ->where('id', $attemptId)
                ->first();

            if (!$testAttempt) {
                // Create new attempt if not found
                $testAttempt = TestAttempt::create([
                    'user_id' => $user->id,
                    'test_id' => $testId,
                    'status' => 'in_progress',
                    'started_at' => now(),
                ]);
            }

            // Get all questions for this test
            $questions = Question::where('test_id', $testId)->get();

            if ($questions->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No questions found for this test'
                ], 404);
            }

            // Calculate score
            $totalQuestions = $questions->count();
            $correctAnswers = 0;
            $totalPoints = 0;
            $earnedPoints = 0;
            $detailedResults = [];

            foreach ($questions as $index => $question) {
                $userAnswer = $userAnswers[$index] ?? null;
                $isCorrect = $userAnswer === $question->correct_answer;

                if ($isCorrect) {
                    $correctAnswers++;
                    $earnedPoints += $question->points ?? 1;
                }

                $totalPoints += $question->points ?? 1;

                // Store detailed result for each question
                $detailedResults[] = [
                    'question_id' => $question->id,
                    'user_answer' => $userAnswer,
                    'correct_answer' => $question->correct_answer,
                    'is_correct' => $isCorrect,
                    'points' => $isCorrect ? ($question->points ?? 1) : 0
                ];
            }

            // Calculate percentage score
            $percentageScore = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0;

            // Update test attempt with results
            $testAttempt->update([
                'score' => $percentageScore,
                'status' => 'completed',
                'completed_at' => $completedAt,
                'time_taken' => $timeUsed,
                'answers' => $userAnswers
            ]);

            // Calculate rank (position among all attempts for this test)
            $rank = TestAttempt::where('test_id', $testId)
                ->where('score', '>', $percentageScore)
                ->where('status', 'completed')
                ->count() + 1;

            // Prepare response data
            $result = [
                'attempt_id' => $testAttempt->id,
                'score' => $percentageScore,
                'total_questions' => $totalQuestions,
                'correct_answers' => $correctAnswers,
                'wrong_answers' => $totalQuestions - $correctAnswers,
                'time_taken' => $timeUsed,
                'total_points' => $totalPoints,
                'earned_points' => $earnedPoints,
                'rank' => $rank,
                'percentage' => $percentageScore,
                'status' => 'completed',
                'completed_at' => $testAttempt->completed_at,
                'detailed_results' => $detailedResults,
                'message' => 'Test submitted successfully'
            ];

            // Update user's coin balance (optional - reward for completing test)
            $coinReward = $this->calculateCoinReward($percentageScore);
            if ($coinReward > 0) {
                $user->increment('coins', $coinReward);
                $result['coin_reward'] = $coinReward;
            }

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error submitting test: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'attempt_id' => $attemptId,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit test',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Calculate coin reward based on score
     */
    private function calculateCoinReward($score)
    {
        if ($score >= 90) {
            return 100; // Excellent performance
        } elseif ($score >= 80) {
            return 75;  // Good performance
        } elseif ($score >= 70) {
            return 50;  // Decent performance
        } elseif ($score >= 60) {
            return 25;  // Passing score
        }

        return 10; // Participation reward
    }
}
