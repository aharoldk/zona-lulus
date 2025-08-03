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
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\CoinController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::post('/check-phone', [AuthController::class, 'checkPhone']);

// Midtrans webhook (no authentication required)
Route::post('/midtrans/webhook', [MidtransWebhookController::class, 'handleWebhook']);
Route::post('/midtrans/test-webhook', [MidtransWebhookController::class, 'testWebhook']);

// Payment finish redirect (no authentication required)
Route::get('/payments/{payment}/finish', [PaymentController::class, 'finish'])->name('payment.finish');

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

    // Module purchase routes
    Route::post('/modules/{module}/purchase', [PaymentController::class, 'purchaseModule']);

    // Course purchase routes
    Route::post('/courses/{course}/purchase', [PaymentController::class, 'purchaseCourse']);

    // Test/Tryout purchase routes
    Route::post('/tests/{test}/purchase', [PaymentController::class, 'purchaseTest']);

    // Coin routes
    Route::prefix('coins')->group(function () {
        Route::get('/balance', [CoinController::class, 'getBalance']);
        Route::get('/packages', [CoinController::class, 'getCoinPackages']);
        Route::post('/purchase', [CoinController::class, 'purchaseCoins']);
        Route::post('/spend', [CoinController::class, 'spendCoins']);
        Route::get('/transactions', [CoinController::class, 'getTransactionHistory']);
    });
});

// Admin routes
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Admin\AdminController::class, 'dashboard']);
    Route::get('/users', [App\Http\Controllers\Admin\AdminController::class, 'users']);

    // Payment management routes
    Route::get('/payments', [App\Http\Controllers\Admin\PaymentController::class, 'index']);
    Route::get('/payments/{id}', [App\Http\Controllers\Admin\PaymentController::class, 'show']);
    Route::put('/payments/{id}/status', [App\Http\Controllers\Admin\PaymentController::class, 'updateStatus']);
    Route::post('/payments/{id}/refund', [App\Http\Controllers\Admin\PaymentController::class, 'refund']);
    Route::get('/payments/analytics', [App\Http\Controllers\Admin\PaymentController::class, 'analytics']);
});
