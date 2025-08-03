<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'phone' => 'required|string|min:8|max:15|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'birth_date' => 'required|date|before:-17 years|after:-35 years',
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
                'phone.min' => 'Nomor HP minimal 8 digit.',
                'phone.max' => 'Nomor HP maksimal 15 digit.',
                'phone.unique' => 'Nomor HP sudah terdaftar.',
                'password.required' => 'Password wajib diisi.',
                'password.min' => 'Password minimal 8 karakter.',
                'password.confirmed' => 'Konfirmasi password tidak cocok.',
                'birth_date.required' => 'Tanggal lahir wajib diisi.',
                'birth_date.date' => 'Format tanggal lahir tidak valid.',
                'birth_date.before' => 'Umur minimal 17 tahun.',
                'birth_date.after' => 'Umur maksimal 35 tahun.',
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
                'birth_date' => $request->birth_date,
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
        $request->validate([
            'email' => 'required|email'
        ]);

        $email = $request->input('email');
        $exists = User::where('email', $email)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    }

    public function checkPhone(Request $request)
    {
        $request->validate([
            'phone' => 'required|string'
        ]);

        $phone = $request->input('phone');
        $exists = User::where('phone', $phone)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    }
}
