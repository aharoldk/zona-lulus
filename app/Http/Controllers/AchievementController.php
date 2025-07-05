<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\TestAttempt;
use App\Models\CourseProgress;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AchievementController extends Controller
{
    public function getBadges()
    {
        try {
            $userId = Auth::id();
            $user = User::find($userId);

            // Define available badges with their criteria
            $availableBadges = [
                [
                    'id' => 1,
                    'name' => 'First Step',
                    'description' => 'Menyelesaikan kursus pertama',
                    'icon' => 'star',
                    'color' => '#52c41a',
                    'rarity' => 'common',
                    'criteria' => 'complete_first_course'
                ],
                [
                    'id' => 2,
                    'name' => 'Streak Master',
                    'description' => 'Belajar selama 7 hari berturut-turut',
                    'icon' => 'fire',
                    'color' => '#fa8c16',
                    'rarity' => 'rare',
                    'criteria' => 'seven_day_streak'
                ],
                [
                    'id' => 3,
                    'name' => 'Quiz Champion',
                    'description' => 'Mendapat skor 100% dalam 5 quiz',
                    'icon' => 'trophy',
                    'color' => '#1890ff',
                    'rarity' => 'epic',
                    'criteria' => 'perfect_score_five_times'
                ],
                [
                    'id' => 4,
                    'name' => 'Knowledge King',
                    'description' => 'Menyelesaikan 10 kursus',
                    'icon' => 'crown',
                    'color' => '#722ed1',
                    'rarity' => 'legendary',
                    'criteria' => 'complete_ten_courses'
                ]
            ];

            // Check each badge criteria and add earned status
            $badges = collect($availableBadges)->map(function ($badge) use ($userId) {
                $earned = $this->checkBadgeCriteria($badge['criteria'], $userId);
                $badge['earned'] = $earned['earned'];

                if ($earned['earned']) {
                    $badge['earnedDate'] = $earned['date'];
                } else {
                    $badge['progress'] = $earned['progress'];
                    $badge['target'] = $earned['target'];
                }

                return $badge;
            });

            return response()->json([
                'success' => true,
                'data' => $badges
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch badges'
            ], 500);
        }
    }

    public function getLeaderboard()
    {
        try {
            $userId = Auth::id();

            // Get top users based on total test scores
            $leaderboard = User::select('id', 'name')
                ->withCount(['testAttempts as total_attempts'])
                ->withAvg(['testAttempts as average_score' => function($query) {
                    $query->where('status', 'completed');
                }], 'score')
                ->having('total_attempts', '>', 0)
                ->orderByDesc('average_score')
                ->take(10)
                ->get()
                ->map(function ($user, $index) use ($userId) {
                    return [
                        'rank' => $index + 1,
                        'name' => $user->name,
                        'points' => round($user->average_score ?? 0),
                        'avatar' => strtoupper(substr($user->name, 0, 1)),
                        'isCurrentUser' => $user->id === $userId
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $leaderboard
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch leaderboard'
            ], 500);
        }
    }

    public function getCertificates()
    {
        try {
            $userId = Auth::id();

            // Get certificates based on completed courses with high scores
            $certificates = CourseProgress::where('user_id', $userId)
                ->where('status', 'completed')
                ->where('score', '>=', 80) // Minimum score for certificate
                ->with('course')
                ->get()
                ->map(function ($progress) {
                    return [
                        'id' => $progress->id,
                        'title' => 'Sertifikat Penyelesaian - ' . $progress->course->title,
                        'issuedDate' => $progress->completed_at->format('d F Y'),
                        'score' => round($progress->score),
                        'status' => 'issued'
                    ];
                });

            // Add pending certificates for ongoing courses
            $pendingCertificates = CourseProgress::where('user_id', $userId)
                ->where('status', 'in_progress')
                ->with('course')
                ->get()
                ->map(function ($progress) {
                    return [
                        'id' => 'pending_' . $progress->id,
                        'title' => 'Sertifikat Penyelesaian - ' . $progress->course->title,
                        'issuedDate' => 'Dalam Progress',
                        'score' => 0,
                        'status' => 'pending'
                    ];
                });

            $allCertificates = $certificates->merge($pendingCertificates);

            return response()->json([
                'success' => true,
                'data' => $allCertificates
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch certificates'
            ], 500);
        }
    }

    private function checkBadgeCriteria($criteria, $userId)
    {
        switch ($criteria) {
            case 'complete_first_course':
                $completed = CourseProgress::where('user_id', $userId)
                    ->where('status', 'completed')
                    ->count();
                return [
                    'earned' => $completed >= 1,
                    'date' => $completed >= 1 ? CourseProgress::where('user_id', $userId)->where('status', 'completed')->first()->completed_at->format('d F Y') : null,
                    'progress' => $completed,
                    'target' => 1
                ];

            case 'seven_day_streak':
                // This would require a login streak tracking system
                // For now, return false
                return [
                    'earned' => false,
                    'date' => null,
                    'progress' => 0,
                    'target' => 7
                ];

            case 'perfect_score_five_times':
                $perfectScores = TestAttempt::where('user_id', $userId)
                    ->where('score', 100)
                    ->count();
                return [
                    'earned' => $perfectScores >= 5,
                    'date' => $perfectScores >= 5 ? TestAttempt::where('user_id', $userId)->where('score', 100)->latest()->first()->created_at->format('d F Y') : null,
                    'progress' => $perfectScores,
                    'target' => 5
                ];

            case 'complete_ten_courses':
                $completed = CourseProgress::where('user_id', $userId)
                    ->where('status', 'completed')
                    ->count();
                return [
                    'earned' => $completed >= 10,
                    'date' => $completed >= 10 ? CourseProgress::where('user_id', $userId)->where('status', 'completed')->orderBy('completed_at', 'desc')->first()->completed_at->format('d F Y') : null,
                    'progress' => $completed,
                    'target' => 10
                ];

            default:
                return [
                    'earned' => false,
                    'date' => null,
                    'progress' => 0,
                    'target' => 1
                ];
        }
    }
}
