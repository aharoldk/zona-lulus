<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Models\TestAttempt;
use App\Models\CourseProgress;
use Carbon\Carbon;

class ProfileController extends Controller
{
    public function getProfile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'birth_date' => $user->birth_date,
                'settings' => $user->settings ?? [
                    'notifications' => [
                        'email' => [
                            'course_updates' => true,
                            'test_reminders' => true,
                            'achievements' => true
                        ],
                        'push' => [
                            'study_reminders' => true
                        ]
                    ]
                ],
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'last_login_at' => $user->last_login_at ?? $user->created_at,
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'min:10', 'max:15', Rule::unique('users')->ignore($user->id)],
            'birth_date' => ['nullable', 'date', 'before:-17 years', 'after:-35 years'],
            'settings' => ['nullable', 'array'],
            'settings.notifications' => ['nullable', 'array'],
            'settings.notifications.email' => ['nullable', 'array'],
            'settings.notifications.push' => ['nullable', 'array'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.string' => 'Nama harus berupa teks.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'phone.min' => 'Nomor HP minimal 10 digit.',
            'phone.max' => 'Nomor HP maksimal 15 digit.',
            'phone.unique' => 'Nomor HP sudah digunakan pengguna lain.',
            'birth_date.date' => 'Format tanggal lahir tidak valid.',
            'birth_date.before' => 'Umur minimal 17 tahun.',
            'birth_date.after' => 'Umur maksimal 35 tahun.',
            'education.in' => 'Pilihan pendidikan tidak valid.',
        ]);

        $user->update($validated);

        return response()->json([
            'data' => $user->fresh(),
            'message' => 'Profil berhasil diperbarui!'
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'new_password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json(['message' => 'Password berhasil diubah!']);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return response()->json([
            'data' => [
                'avatar_url' => asset('storage/' . $path)
            ],
            'message' => 'Avatar berhasil diperbarui!'
        ]);
    }

    public function updateSettings(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'notifications' => ['nullable', 'array'],
            'notifications.email' => ['nullable', 'array'],
            'notifications.email.course_updates' => ['nullable', 'boolean'],
            'notifications.email.test_reminders' => ['nullable', 'boolean'],
            'notifications.email.achievements' => ['nullable', 'boolean'],
            'notifications.push' => ['nullable', 'array'],
            'notifications.push.study_reminders' => ['nullable', 'boolean'],
        ]);

        $user->update(['settings' => $validated]);

        return response()->json(['message' => 'Pengaturan berhasil diperbarui!']);
    }

    public function getProfileStats(Request $request)
    {
        $user = $request->user();

        // Get course progress stats
        $coursesCompleted = CourseProgress::where('user_id', $user->id)
            ->where('completion_percentage', 100)
            ->count();

        // Get test attempts stats
        $testsTaken = TestAttempt::where('user_id', $user->id)->count();

        // Calculate study hours (mock calculation - you might want to implement actual tracking)
        $studyHours = TestAttempt::where('user_id', $user->id)
            ->sum('time_taken') / 3600; // Convert seconds to hours

        // Calculate streak days (mock calculation)
        $streakDays = $this->calculateStreakDays($user->id);

        // Calculate level and experience (mock gamification system)
        $totalExp = ($coursesCompleted * 100) + ($testsTaken * 50);
        $level = floor($totalExp / 500) + 1;
        $currentLevelExp = $totalExp % 500;
        $nextLevelExp = 500;

        return response()->json([
            'data' => [
                'courses_completed' => $coursesCompleted,
                'tests_taken' => $testsTaken,
                'study_hours' => round($studyHours, 1),
                'achievements' => $coursesCompleted + floor($testsTaken / 5), // Mock achievements
                'streak_days' => $streakDays,
                'level' => $level,
                'experience' => $currentLevelExp,
                'next_level_exp' => $nextLevelExp,
                'total_experience' => $totalExp
            ]
        ]);
    }

    public function getActivityHistory(Request $request)
    {
        $user = $request->user();

        // Get recent test attempts
        $recentTests = TestAttempt::where('user_id', $user->id)
            ->with('test')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($attempt) {
                return [
                    'type' => 'test_completed',
                    'title' => 'Menyelesaikan ' . $attempt->test->title,
                    'description' => 'Skor: ' . $attempt->score . '/100',
                    'created_at' => $attempt->created_at,
                ];
            });

        // Get recent course progress
        $recentProgress = CourseProgress::where('user_id', $user->id)
            ->with('course')
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($progress) {
                return [
                    'type' => 'course_progress',
                    'title' => 'Progress ' . $progress->course->title,
                    'description' => 'Progress: ' . $progress->completion_percentage . '%',
                    'created_at' => $progress->updated_at,
                ];
            });

        // Combine and sort activities
        $activities = $recentTests->concat($recentProgress)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return response()->json(['data' => $activities]);
    }

    public function getAchievements(Request $request)
    {
        $user = $request->user();

        // Mock achievements data - implement your actual achievement system
        $achievements = [
            [
                'id' => 1,
                'title' => 'First Test',
                'description' => 'Menyelesaikan test pertama',
                'icon' => '🎯',
                'earned_at' => $user->created_at,
                'type' => 'bronze'
            ],
            [
                'id' => 2,
                'title' => 'Konsisten Belajar',
                'description' => 'Belajar 7 hari berturut-turut',
                'icon' => '🔥',
                'earned_at' => Carbon::now()->subDays(3),
                'type' => 'silver'
            ]
        ];

        return response()->json(['data' => $achievements]);
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        // Delete avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Delete user data
        $user->delete();

        return response()->json(['message' => 'Akun berhasil dihapus']);
    }

    private function calculateStreakDays($userId)
    {
        // Mock calculation - implement actual streak tracking
        $lastActivity = TestAttempt::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$lastActivity) {
            return 0;
        }

        $daysSinceLastActivity = Carbon::now()->diffInDays($lastActivity->created_at);

        // Simple mock: if last activity was within 24 hours, return random streak
        return $daysSinceLastActivity <= 1 ? rand(1, 30) : 0;
    }
}
