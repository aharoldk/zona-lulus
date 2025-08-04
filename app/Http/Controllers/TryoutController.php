<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Support\Facades\Auth;
use App\Models\Payment;

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
            // Return a sample test submission response
            $result = [
                'attempt_id' => (int)$attemptId,
                'score' => rand(60, 95),
                'total_questions' => 100,
                'correct_answers' => rand(60, 95),
                'time_taken' => rand(80, 120),
                'rank' => rand(100, 500),
                'message' => 'Test submitted successfully'
            ];

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit test',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
