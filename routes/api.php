<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\TryoutController;
use App\Http\Controllers\QuestionBankController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ProfileController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/questions/{id}', [QuestionController::class, 'getQuestions']);

    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/my-courses', [CourseController::class, 'myCourses']);
    Route::get('/courses/{id}', [CourseController::class, 'show']);

    // Tryout routes
    Route::get('/tryouts', [TryoutController::class, 'index']);
    Route::get('/tryouts/my-attempts', [TryoutController::class, 'getUserAttempts']);
    Route::post('/tryouts/{id}/start', [TryoutController::class, 'startTest']);
    Route::post('/tryouts/attempts/{id}/submit', [TryoutController::class, 'submitTest']);

    // Question Bank routes
    Route::get('/question-bank', [QuestionBankController::class, 'index']);
    Route::get('/question-bank/stats', [QuestionBankController::class, 'getStats']);

    // Achievement routes
    Route::get('/achievements/badges', [AchievementController::class, 'getBadges']);
    Route::get('/achievements/leaderboard', [AchievementController::class, 'getLeaderboard']);
    Route::get('/achievements/certificates', [AchievementController::class, 'getCertificates']);

    // Schedule routes
    Route::get('/schedule', [ScheduleController::class, 'getSchedule']);
    Route::get('/schedule/today', [ScheduleController::class, 'getTodaySchedule']);
    Route::get('/schedule/upcoming-exams', [ScheduleController::class, 'getUpcomingExams']);
    Route::post('/schedule', [ScheduleController::class, 'addSchedule']);

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::put('/profile/settings', [ProfileController::class, 'updateSettings']);
});
