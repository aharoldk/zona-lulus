<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Carbon\Carbon;

class ProfileController extends Controller
{
    public function getProfile()
    {
        try {
            $user = Auth::user();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'birth_date' => $user->birth_date,
                    'address' => $user->address,
                    'education' => $user->education,
                    'target' => $user->target,
                    'bio' => $user->bio,
                    'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                    'email_verified_at' => $user->email_verified_at,
                    'verified' => !is_null($user->email_verified_at),
                    'created_at' => $user->created_at,
                    'last_login' => $user->last_login_at,
                    'profile_completion' => $this->calculateProfileCompletion($user),
                    'settings' => $this->getUserSettings($user)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'birth_date' => 'nullable|date',
                'address' => 'nullable|string|max:500',
                'education' => 'nullable|in:sma,d3,s1,s2,s3',
                'target' => 'nullable|in:tni,polri,cpns,bumn,lainnya',
                'bio' => 'nullable|string|max:300'
            ]);

            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updatePassword(Request $request)
    {
        try {
            $user = Auth::user();

            $validated = $request->validate([
                'current_password' => 'required',
                'new_password' => ['required', 'confirmed', Password::min(6)],
            ]);

            // Verify current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 422);
            }

            $user->update([
                'password' => Hash::make($validated['new_password'])
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateAvatar(Request $request)
    {
        try {
            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $user = Auth::user();

            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::delete($user->avatar);
            }

            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');

            $user->update([
                'avatar' => $avatarPath
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Avatar updated successfully',
                'data' => [
                    'avatar_url' => Storage::url($avatarPath)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update avatar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateSettings(Request $request)
    {
        try {
            $user = Auth::user();
            $category = $request->input('category');
            $key = $request->input('key');
            $value = $request->input('value');

            // Validate the setting category and key
            $allowedSettings = [
                'notifications' => ['email', 'push', 'sms', 'study_reminders', 'achievement_alerts', 'weekly_reports'],
                'privacy' => ['profile_visibility', 'show_progress', 'show_achievements', 'allow_messages'],
                'preferences' => ['language', 'timezone', 'theme', 'auto_save', 'sound_effects']
            ];

            if (!isset($allowedSettings[$category]) || !in_array($key, $allowedSettings[$category])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid setting'
                ], 422);
            }

            // Store settings in user_settings table or user model
            $settingKey = $category . '_' . $key;
            $user->update([$settingKey => $value]);

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProfileStats()
    {
        try {
            $user = Auth::user();

            // Calculate various statistics
            $stats = [
                'total_study_hours' => $this->getTotalStudyHours($user),
                'courses_completed' => $this->getCompletedCourses($user),
                'tests_completed' => $this->getCompletedTests($user),
                'average_score' => $this->getAverageScore($user),
                'current_streak' => $this->getCurrentStreak($user),
                'total_points' => $this->getTotalPoints($user),
                'rank' => $this->getUserRank($user),
                'completion_percentage' => $this->calculateProfileCompletion($user)
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getActivityHistory()
    {
        try {
            $user = Auth::user();

            // Fetch recent activities from various tables
            $activities = collect();

            // Add test completions
            $testActivities = DB::table('test_attempts')
                ->where('user_id', $user->id)
                ->where('completed_at', '>', Carbon::now()->subDays(30))
                ->orderBy('completed_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($attempt) {
                    return [
                        'id' => 'test_' . $attempt->id,
                        'type' => 'test_completed',
                        'title' => 'Completed Test',
                        'description' => 'Score: ' . $attempt->score . '/' . $attempt->total_questions,
                        'timestamp' => $attempt->completed_at,
                        'icon' => 'BookOutlined',
                        'color' => $attempt->score >= 80 ? '#52c41a' : '#faad14'
                    ];
                });

            $activities = $activities->merge($testActivities);

            // Add course progress
            $courseActivities = DB::table('course_progress')
                ->where('user_id', $user->id)
                ->where('updated_at', '>', Carbon::now()->subDays(30))
                ->orderBy('updated_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($progress) {
                    return [
                        'id' => 'course_' . $progress->id,
                        'type' => 'course_progress',
                        'title' => 'Course Progress Updated',
                        'description' => 'Progress: ' . $progress->progress_percentage . '%',
                        'timestamp' => $progress->updated_at,
                        'icon' => 'BookOutlined',
                        'color' => '#1890ff'
                    ];
                });

            $activities = $activities->merge($courseActivities);

            // Sort by timestamp and return latest 15
            $sortedActivities = $activities->sortByDesc('timestamp')->take(15)->values();

            return response()->json([
                'success' => true,
                'data' => $sortedActivities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAchievements()
    {
        try {
            $user = Auth::user();

            $achievements = [
                [
                    'id' => 1,
                    'name' => 'First Steps',
                    'description' => 'Complete your first test',
                    'icon' => '🎯',
                    'earned' => $this->getCompletedTests($user) > 0,
                    'earned_date' => $this->getFirstTestDate($user),
                    'progress' => min(100, $this->getCompletedTests($user) * 100)
                ],
                [
                    'id' => 2,
                    'name' => 'Study Streak',
                    'description' => 'Study for 7 consecutive days',
                    'icon' => '🔥',
                    'earned' => $this->getCurrentStreak($user) >= 7,
                    'earned_date' => $this->getStreakAchievementDate($user),
                    'progress' => min(100, ($this->getCurrentStreak($user) / 7) * 100)
                ],
                [
                    'id' => 3,
                    'name' => 'High Scorer',
                    'description' => 'Score above 90% in any test',
                    'icon' => '⭐',
                    'earned' => $this->hasHighScore($user),
                    'earned_date' => $this->getHighScoreDate($user),
                    'progress' => $this->getHighestScore($user)
                ],
                [
                    'id' => 4,
                    'name' => 'Course Master',
                    'description' => 'Complete 10 courses',
                    'icon' => '📚',
                    'earned' => $this->getCompletedCourses($user) >= 10,
                    'earned_date' => $this->getCourseCompletionDate($user),
                    'progress' => min(100, ($this->getCompletedCourses($user) / 10) * 100)
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $achievements
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch achievements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteAccount()
    {
        try {
            $user = Auth::user();

            // Delete user's avatar
            if ($user->avatar) {
                Storage::delete($user->avatar);
            }

            // Delete related data
            DB::transaction(function () use ($user) {
                $user->testAttempts()->delete();
                $user->courseProgress()->delete();
                $user->notifications()->delete();
                $user->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete account',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Helper methods
    private function calculateProfileCompletion($user)
    {
        $fields = ['name', 'email', 'phone', 'birth_date', 'address', 'education', 'target'];
        $completed = 0;

        foreach ($fields as $field) {
            if (!empty($user->$field)) {
                $completed++;
            }
        }

        return round(($completed / count($fields)) * 100);
    }

    private function getUserSettings($user)
    {
        return [
            'notifications' => [
                'email' => $user->notifications_email ?? true,
                'push' => $user->notifications_push ?? true,
                'sms' => $user->notifications_sms ?? false,
                'study_reminders' => $user->notifications_study_reminders ?? true,
                'achievement_alerts' => $user->notifications_achievement_alerts ?? true,
                'weekly_reports' => $user->notifications_weekly_reports ?? true
            ],
            'privacy' => [
                'profile_visibility' => $user->privacy_profile_visibility ?? 'public',
                'show_progress' => $user->privacy_show_progress ?? true,
                'show_achievements' => $user->privacy_show_achievements ?? true,
                'allow_messages' => $user->privacy_allow_messages ?? true
            ],
            'preferences' => [
                'language' => $user->preferences_language ?? 'id',
                'timezone' => $user->preferences_timezone ?? 'Asia/Jakarta',
                'theme' => $user->preferences_theme ?? 'light',
                'auto_save' => $user->preferences_auto_save ?? true,
                'sound_effects' => $user->preferences_sound_effects ?? true
            ]
        ];
    }

    private function getTotalStudyHours($user)
    {
        // Mock data - implement actual calculation
        return 245;
    }

    private function getCompletedCourses($user)
    {
        return DB::table('course_progress')
            ->where('user_id', $user->id)
            ->where('progress_percentage', 100)
            ->count();
    }

    private function getCompletedTests($user)
    {
        return DB::table('test_attempts')
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();
    }

    private function getAverageScore($user)
    {
        $avgScore = DB::table('test_attempts')
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->avg('score');

        return round($avgScore, 1) ?? 0;
    }

    private function getCurrentStreak($user)
    {
        // Mock data - implement actual streak calculation
        return 12;
    }

    private function getTotalPoints($user)
    {
        // Mock data - implement actual points calculation
        return 1540;
    }

    private function getUserRank($user)
    {
        // Mock data - implement actual ranking
        return 15;
    }

    private function getFirstTestDate($user)
    {
        $firstTest = DB::table('test_attempts')
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->orderBy('completed_at')
            ->first();

        return $firstTest ? Carbon::parse($firstTest->completed_at)->format('Y-m-d') : null;
    }

    private function getStreakAchievementDate($user)
    {
        // Mock implementation
        return $this->getCurrentStreak($user) >= 7 ? '2025-06-28' : null;
    }

    private function hasHighScore($user)
    {
        return DB::table('test_attempts')
            ->where('user_id', $user->id)
            ->where('score', '>=', 90)
            ->exists();
    }

    private function getHighScoreDate($user)
    {
        $highScore = DB::table('test_attempts')
            ->where('user_id', $user->id)
            ->where('score', '>=', 90)
            ->orderBy('completed_at')
            ->first();

        return $highScore ? Carbon::parse($highScore->completed_at)->format('Y-m-d') : null;
    }

    private function getHighestScore($user)
    {
        return DB::table('test_attempts')
            ->where('user_id', $user->id)
            ->max('score') ?? 0;
    }

    private function getCourseCompletionDate($user)
    {
        if ($this->getCompletedCourses($user) >= 10) {
            $tenthCourse = DB::table('course_progress')
                ->where('user_id', $user->id)
                ->where('progress_percentage', 100)
                ->orderBy('updated_at')
                ->skip(9)
                ->first();

            return $tenthCourse ? Carbon::parse($tenthCourse->updated_at)->format('Y-m-d') : null;
        }

        return null;
    }
}
