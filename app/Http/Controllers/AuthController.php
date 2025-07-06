<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|regex:/^[a-zA-Z\s]+$/',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|min:10|max:15|unique:users|regex:/^[0-9]+$/',
            'password' => ['required', 'confirmed', Rules\Password::min(8)
                ->mixedCase()
                ->numbers()
                ->symbols()],
            'birth_date' => 'required|date|before:' . now()->subYears(16)->format('Y-m-d'),
            'address' => 'required|string|min:10|max:500',
            'target' => 'required|in:tni,polri,cpns,bumn,lainnya',
            'education' => 'required|in:sma,d3,s1,s2',
            'experience_level' => 'required|in:beginner,intermediate,experienced',
            'study_time' => 'nullable|in:1,3,5,7',
            'newsletter' => 'boolean'
        ]);

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'birth_date' => $request->birth_date,
                'address' => $request->address,
                'target' => $request->target,
                'education' => $request->education,
                'experience_level' => $request->experience_level,
                'study_time' => $request->study_time,
                'newsletter_subscription' => $request->newsletter ?? true,
                'registration_completed_at' => now(),
            ]);

            // Create welcome notification
            $user->notifications()->create([
                'title' => 'Selamat datang di Zona Lulus!',
                'message' => 'Terima kasih telah bergabung. Mulai perjalanan belajar Anda sekarang!',
                'type' => 'success',
                'priority' => 'high'
            ]);

            // Send welcome email (if email service is configured)
            // Mail::to($user->email)->send(new WelcomeEmail($user));

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
                'message' => 'Registration successful'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function checkEmail(Request $request)
    {
        $email = $request->query('email');
        $exists = User::where('email', $email)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    }

    public function checkPhone(Request $request)
    {
        $phone = $request->query('phone');
        $exists = User::where('phone', $phone)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    }
}
