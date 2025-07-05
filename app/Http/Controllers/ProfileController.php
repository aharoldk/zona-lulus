<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

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
                    'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at->format('d F Y'),
                    'settings' => [
                        'two_factor_enabled' => $user->two_factor_enabled ?? false,
                        'login_alerts' => $user->login_alerts ?? true,
                        'email_notifications' => [
                            'course_updates' => $user->email_course_updates ?? true,
                            'study_reminders' => $user->email_study_reminders ?? true,
                            'tryout_results' => $user->email_tryout_results ?? true,
                        ],
                        'push_notifications' => [
                            'deadline_reminders' => $user->push_deadline_reminders ?? true,
                            'achievements' => $user->push_achievements ?? false,
                        ]
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile data'
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
                'target' => 'nullable|in:tni,polri,cpns,bumn'
            ]);

            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $user->fresh()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile'
            ], 500);
        }
    }

    public function updatePassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required',
                'new_password' => ['required', 'confirmed', Password::min(6)],
            ]);

            $user = Auth::user();

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
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update password'
            ], 500);
        }
    }

    public function updateAvatar(Request $request)
    {
        try {
            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048'
            ]);

            $user = Auth::user();

            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::delete($user->avatar);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');

            $user->update(['avatar' => $path]);

            return response()->json([
                'success' => true,
                'message' => 'Avatar updated successfully',
                'data' => [
                    'avatar_url' => Storage::url($path)
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update avatar'
            ], 500);
        }
    }

    public function updateSettings(Request $request)
    {
        try {
            $validated = $request->validate([
                'two_factor_enabled' => 'boolean',
                'login_alerts' => 'boolean',
                'email_course_updates' => 'boolean',
                'email_study_reminders' => 'boolean',
                'email_tryout_results' => 'boolean',
                'push_deadline_reminders' => 'boolean',
                'push_achievements' => 'boolean',
            ]);

            $user = Auth::user();
            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings'
            ], 500);
        }
    }
}
