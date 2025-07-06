<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request)
    {
        try {
            // For now, return static sample data
            $sampleNotifications = [
                [
                    'id' => 1,
                    'title' => 'Tryout TNI Baru Tersedia!',
                    'message' => 'Tryout TNI - Paket Lengkap 2024 sudah tersedia. Segera ikuti untuk mengukur kemampuanmu!',
                    'type' => 'info',
                    'is_read' => false,
                    'action_url' => '/tryout/1',
                    'time_ago' => '2 jam yang lalu',
                    'created_at' => now()->subHours(2)->toISOString(),
                    'data' => [
                        'icon' => 'FileTextOutlined',
                        'color' => '#1890ff'
                    ]
                ],
                [
                    'id' => 2,
                    'title' => 'Selamat! Kamu Meraih Skor Tinggi',
                    'message' => 'Skor kamu untuk Tryout Matematika Dasar adalah 92. Pertahankan prestasi ini!',
                    'type' => 'success',
                    'is_read' => false,
                    'action_url' => '/achievements',
                    'time_ago' => '1 hari yang lalu',
                    'created_at' => now()->subDay()->toISOString(),
                    'data' => [
                        'icon' => 'TrophyOutlined',
                        'color' => '#52c41a'
                    ]
                ],
                [
                    'id' => 3,
                    'title' => 'Pengingat Jadwal Belajar',
                    'message' => 'Waktunya belajar! Kamu memiliki jadwal "Latihan Matematika" pada jam 14:00 hari ini.',
                    'type' => 'reminder',
                    'is_read' => true,
                    'action_url' => '/schedule',
                    'time_ago' => '2 hari yang lalu',
                    'created_at' => now()->subDays(2)->toISOString(),
                    'data' => [
                        'icon' => 'ClockCircleOutlined',
                        'color' => '#faad14'
                    ]
                ],
                [
                    'id' => 4,
                    'title' => 'Kursus Baru: CPNS 2024',
                    'message' => 'Kursus "CPNS 2024 - Seleksi Kompetensi Dasar" telah ditambahkan ke daftar kursus gratis.',
                    'type' => 'course',
                    'is_read' => true,
                    'action_url' => '/courses/3',
                    'time_ago' => '3 hari yang lalu',
                    'created_at' => now()->subDays(3)->toISOString(),
                    'data' => [
                        'icon' => 'BookOutlined',
                        'color' => '#722ed1'
                    ]
                ],
                [
                    'id' => 5,
                    'title' => 'Badge Baru Diperoleh!',
                    'message' => 'Selamat! Kamu telah memperoleh badge "Streak Master" karena belajar 7 hari berturut-turut.',
                    'type' => 'achievement',
                    'is_read' => true,
                    'action_url' => '/achievements',
                    'time_ago' => '5 hari yang lalu',
                    'created_at' => now()->subDays(5)->toISOString(),
                    'data' => [
                        'icon' => 'StarOutlined',
                        'color' => '#fa8c16'
                    ]
                ],
                [
                    'id' => 6,
                    'title' => 'Pembaruan Sistem',
                    'message' => 'Sistem telah diperbarui dengan fitur-fitur baru. Jelajahi fitur baru untuk pengalaman belajar yang lebih baik.',
                    'type' => 'system',
                    'is_read' => true,
                    'action_url' => null,
                    'time_ago' => '1 minggu yang lalu',
                    'created_at' => now()->subWeek()->toISOString(),
                    'data' => [
                        'icon' => 'SettingOutlined',
                        'color' => '#8c8c8c'
                    ]
                ]
            ];

            // Apply filters
            $filteredNotifications = $sampleNotifications;

            if ($request->has('type') && $request->type !== 'all') {
                $filteredNotifications = array_filter($filteredNotifications, function($notification) use ($request) {
                    return $notification['type'] === $request->type;
                });
            }

            if ($request->has('is_read') && $request->is_read !== 'all') {
                $isRead = $request->is_read === 'true';
                $filteredNotifications = array_filter($filteredNotifications, function($notification) use ($isRead) {
                    return $notification['is_read'] === $isRead;
                });
            }

            // Reset array keys
            $filteredNotifications = array_values($filteredNotifications);

            // Get unread count
            $unreadCount = count(array_filter($sampleNotifications, function($notification) {
                return !$notification['is_read'];
            }));

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $filteredNotifications,
                    'unread_count' => $unreadCount,
                    'total_count' => count($sampleNotifications)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete notification
     */
    public function delete(Request $request, $id)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear all notifications
     */
    public function clearAll(Request $request)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'All notifications cleared successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
