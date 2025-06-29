<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    /**
     * Get questions for a specific test
     */
    public function getQuestions(Request $request, $id)
    {
        try {
            $questions = DB::table('questions')
                ->where('test_id', $id)
                ->select('id', 'question_text as question', 'options', 'correct_answer', 'category')
                ->get();

            // Decode JSON options for each question
            $questions = $questions->map(function ($question) {
                $question->options = json_decode($question->options, true);
                return $question;
            });

            return response()->json([
                'success' => true,
                'data' => $questions,
                'count' => $questions->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch questions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
