<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\TryoutController;

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
});
