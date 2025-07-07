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
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'phone' => 'required|string|min:10|max:15|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'date_of_birth' => 'required|date|before:-17 years|after:-35 years',
                'education' => 'nullable|in:sma,d3,s1,s2',
                'newsletter' => 'boolean'
            ], [
                'name.required' => 'Nama lengkap wajib diisi.',
                'name.string' => 'Nama harus berupa teks.',
                'name.max' => 'Nama maksimal 255 karakter.',
                'email.required' => 'Email wajib diisi.',
                'email.email' => 'Format email tidak valid.',
                'email.unique' => 'Email sudah terdaftar.',
                'phone.required' => 'Nomor HP wajib diisi.',
                'phone.min' => 'Nomor HP minimal 10 digit.',
                'phone.max' => 'Nomor HP maksimal 15 digit.',
                'phone.unique' => 'Nomor HP sudah terdaftar.',
                'password.required' => 'Password wajib diisi.',
                'password.min' => 'Password minimal 8 karakter.',
                'password.confirmed' => 'Konfirmasi password tidak cocok.',
                'date_of_birth.required' => 'Tanggal lahir wajib diisi.',
                'date_of_birth.date' => 'Format tanggal lahir tidak valid.',
                'date_of_birth.before' => 'Umur minimal 17 tahun.',
                'date_of_birth.after' => 'Umur maksimal 35 tahun.',
                'education.in' => 'Pilihan pendidikan tidak valid.',
                'newsletter.boolean' => 'Pilihan newsletter tidak valid.'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'birth_date' => $request->date_of_birth,
                'education' => $request->education
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
                'message' => 'Pendaftaran berhasil! Selamat datang di Zona Lulus.'
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
