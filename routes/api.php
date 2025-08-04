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
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\StudyController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\DuitkuPaymentController;
use App\Http\Controllers\CoinController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::post('/check-phone', [AuthController::class, 'checkPhone']);

Route::post('/duitku/callback', [DuitkuPaymentController::class, 'callback']);
Route::get('/duitku/return', [DuitkuPaymentController::class, 'return']);

// Duitku Payment Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/payment/duitku/methods', [DuitkuPaymentController::class, 'getPaymentMethods']);
    Route::post('/payment/duitku/create', [DuitkuPaymentController::class, 'createPayment']);
    Route::get('/payment/duitku/{payment}/status', [DuitkuPaymentController::class, 'checkStatus']);
    Route::post('/payment/duitku/inquiry', [DuitkuPaymentController::class, 'inquiryPayment']);
});

// Payment finish redirect (no authentication required)
Route::get('/payments/{payment}/finish', [PaymentController::class, 'finish'])->name('payment.finish');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/questions/{id}', [QuestionController::class, 'getQuestions']);

    Route::get('/tryouts', [TryoutController::class, 'index']);
    Route::get('/tryouts/my-attempts', [TryoutController::class, 'getUserAttempts']);
    Route::post('/tryouts/{id}/start', [TryoutController::class, 'startTest']);
    Route::post('/tryouts/attempts/{id}/submit', [TryoutController::class, 'submitTest']);

    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/my-courses', [CourseController::class, 'myCourses']);
    Route::get('/courses/{id}', [CourseController::class, 'show']);

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
    Route::get('/profile/stats', [ProfileController::class, 'getProfileStats']);
    Route::get('/profile/activity', [ProfileController::class, 'getActivityHistory']);
    Route::get('/profile/achievements', [ProfileController::class, 'getAchievements']);
    Route::delete('/profile', [ProfileController::class, 'deleteAccount']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/stats', [NotificationController::class, 'stats']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications/bulk-delete', [NotificationController::class, 'bulkDelete']);
    Route::delete('/notifications/clear-all', [NotificationController::class, 'clearAll']);
    Route::post('/notifications', [NotificationController::class, 'store']);

    // Study Tracker routes
    Route::get('/study/stats', [StudyController::class, 'getStats']);
    Route::get('/study/recent-activity', [StudyController::class, 'getRecentActivity']);
    Route::post('/study/log-session', [StudyController::class, 'logSession']);

    // Analytics route
    Route::get('/analytics', [AnalyticsController::class, 'index']);

    // Payment routes (authenticated)
    Route::prefix('payments')->group(function () {
        Route::get('/history', [PaymentController::class, 'history']);
        Route::get('/stats', [PaymentController::class, 'stats']);
        Route::get('/{payment}/status', [PaymentController::class, 'getPaymentStatus']);
        Route::post('/{payment}/cancel', [PaymentController::class, 'cancel']);
    });

    // Duitku Payment routes
    Route::prefix('duitku')->group(function () {
        Route::get('/payment-methods', [DuitkuPaymentController::class, 'getPaymentMethods']);
        Route::post('/modules/{module}/purchase', [DuitkuPaymentController::class, 'purchaseModule']);
        Route::post('/courses/{course}/purchase', [DuitkuPaymentController::class, 'purchaseCourse']);
        Route::post('/tryouts/{test}/purchase', [DuitkuPaymentController::class, 'purchaseTryout']);
        Route::get('/payments/{payment}/status', [DuitkuPaymentController::class, 'checkStatus']);
    });

    // Coin routes
    Route::prefix('coins')->group(function () {
        Route::get('/packages', [CoinController::class, 'getPackages']);
        Route::post('/purchase', [CoinController::class, 'purchase']);
        Route::get('/balance', [CoinController::class, 'getBalance']);
        Route::get('/transactions', [CoinController::class, 'getTransactionHistory']);
    });
});
