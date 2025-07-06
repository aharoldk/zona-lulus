<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user with advanced filtering
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $query = Notification::where('user_id', $user->id ?? 1);

            // Apply filters
            if ($request->has('is_read')) {
                $query->where('is_read', $request->boolean('is_read'));
            }

            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            if ($request->has('priority') && $request->priority !== 'all') {
                $query->where('priority', $request->priority);
            }

            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('message', 'LIKE', "%{$searchTerm}%");
                });
            }

            if ($request->has('date_from') && $request->has('date_to')) {
                $query->whereBetween('created_at', [
                    Carbon::parse($request->date_from)->startOfDay(),
                    Carbon::parse($request->date_to)->endOfDay()
                ]);
            }

            // Get notifications with pagination
            $notifications = $query->orderBy('created_at', 'desc')
                                 ->limit(50)
                                 ->get();

            // Get counts
            $unreadCount = Notification::where('user_id', $user->id ?? 1)
                                     ->where('is_read', false)
                                     ->count();

            $totalCount = Notification::where('user_id', $user->id ?? 1)->count();

            // If no real notifications exist, return sample data for demo
            if ($notifications->isEmpty()) {
                $sampleNotifications = $this->getSampleNotifications();
                return response()->json([
                    'success' => true,
                    'data' => [
                        'notifications' => $sampleNotifications,
                        'unread_count' => 3,
                        'total_count' => count($sampleNotifications)
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notifications,
                    'unread_count' => $unreadCount,
                    'total_count' => $totalCount
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
     * Get notification statistics
     */
    public function stats()
    {
        try {
            $user = Auth::user();
            $userId = $user->id ?? 1;

            $stats = [
                'total' => Notification::where('user_id', $userId)->count(),
                'unread' => Notification::where('user_id', $userId)->where('is_read', false)->count(),
                'high_priority' => Notification::where('user_id', $userId)->where('priority', 'high')->count(),
                'today' => Notification::where('user_id', $userId)
                                     ->whereDate('created_at', today())
                                     ->count(),
                'this_week' => Notification::where('user_id', $userId)
                                         ->whereBetween('created_at', [
                                             Carbon::now()->startOfWeek(),
                                             Carbon::now()->endOfWeek()
                                         ])
                                         ->count(),
                'by_type' => Notification::where('user_id', $userId)
                                       ->select('type', DB::raw('count(*) as count'))
                                       ->groupBy('type')
                                       ->get()
                                       ->pluck('count', 'type'),
                'by_priority' => Notification::where('user_id', $userId)
                                           ->select('priority', DB::raw('count(*) as count'))
                                           ->groupBy('priority')
                                           ->get()
                                           ->pluck('count', 'priority')
            ];

            // Return sample stats if no real data
            if ($stats['total'] == 0) {
                $stats = [
                    'total' => 8,
                    'unread' => 3,
                    'high_priority' => 2,
                    'today' => 2,
                    'this_week' => 5,
                    'by_type' => [
                        'course' => 2,
                        'test' => 3,
                        'achievement' => 2,
                        'reminder' => 1
                    ],
                    'by_priority' => [
                        'high' => 2,
                        'medium' => 4,
                        'low' => 2
                    ]
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notification stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead($id)
    {
        try {
            $user = Auth::user();
            $notification = Notification::where('user_id', $user->id ?? 1)
                                      ->where('id', $id)
                                      ->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

            $notification->update(['is_read' => true, 'read_at' => now()]);

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
    public function markAllAsRead()
    {
        try {
            $user = Auth::user();

            Notification::where('user_id', $user->id ?? 1)
                       ->where('is_read', false)
                       ->update([
                           'is_read' => true,
                           'read_at' => now()
                       ]);

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
     * Delete a specific notification
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $notification = Notification::where('user_id', $user->id ?? 1)
                                      ->where('id', $id)
                                      ->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

            $notification->delete();

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
     * Bulk delete notifications
     */
    public function bulkDelete(Request $request)
    {
        try {
            $request->validate([
                'notification_ids' => 'required|array',
                'notification_ids.*' => 'integer'
            ]);

            $user = Auth::user();
            $deletedCount = Notification::where('user_id', $user->id ?? 1)
                                      ->whereIn('id', $request->notification_ids)
                                      ->delete();

            return response()->json([
                'success' => true,
                'message' => "{$deletedCount} notifications deleted successfully",
                'deleted_count' => $deletedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear all notifications
     */
    public function clearAll()
    {
        try {
            $user = Auth::user();
            $deletedCount = Notification::where('user_id', $user->id ?? 1)->delete();

            return response()->json([
                'success' => true,
                'message' => 'All notifications cleared successfully',
                'deleted_count' => $deletedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new notification (for admin/system use)
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'type' => 'required|in:course,test,achievement,reminder,system,social,warning,success,error',
                'priority' => 'required|in:high,medium,low',
                'user_id' => 'required|integer',
                'action_url' => 'nullable|string'
            ]);

            $notification = Notification::create([
                'user_id' => $request->user_id,
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type,
                'priority' => $request->priority,
                'action_url' => $request->action_url,
                'is_read' => false
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notification created successfully',
                'data' => $notification
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sample notifications for demo purposes
     */
    private function getSampleNotifications()
    {
        return [
            [
                'id' => 1,
                'title' => 'Tryout TNI Baru Tersedia!',
                'message' => 'Tryout TNI - Paket Lengkap 2024 sudah tersedia. Segera ikuti untuk mengukur kemampuanmu dalam menghadapi seleksi TNI!',
                'type' => 'test',
                'priority' => 'high',
                'is_read' => false,
                'action_url' => '/tryout/tni',
                'created_at' => now()->subHours(2)->toISOString(),
                'read_at' => null
            ],
            [
                'id' => 2,
                'title' => 'Selamat! Kamu Meraih Skor Tinggi',
                'message' => 'Skor kamu untuk Tryout Matematika Dasar adalah 92/100. Pertahankan prestasi ini dan lanjutkan ke materi berikutnya!',
                'type' => 'achievement',
                'priority' => 'medium',
                'is_read' => false,
                'action_url' => '/achievements',
                'created_at' => now()->subDay()->toISOString(),
                'read_at' => null
            ],
            [
                'id' => 3,
                'title' => 'Pengingat Jadwal Belajar',
                'message' => 'Waktunya belajar! Kamu memiliki jadwal "Latihan Matematika Lanjutan" pada jam 14:00 hari ini. Jangan sampai terlewat!',
                'type' => 'reminder',
                'priority' => 'medium',
                'is_read' => false,
                'action_url' => '/schedule',
                'created_at' => now()->subHours(6)->toISOString(),
                'read_at' => null
            ],
            [
                'id' => 4,
                'title' => 'Kursus Baru: Bahasa Indonesia CPNS',
                'message' => 'Kursus baru "Bahasa Indonesia untuk CPNS" telah ditambahkan ke perpustakaan belajarmu. Mulai belajar sekarang!',
                'type' => 'course',
                'priority' => 'low',
                'is_read' => true,
                'action_url' => '/courses/bahasa-indonesia-cpns',
                'created_at' => now()->subDays(2)->toISOString(),
                'read_at' => now()->subDay()->toISOString()
            ],
            [
                'id' => 5,
                'title' => 'Badge Baru Diperoleh!',
                'message' => 'Selamat! Kamu telah memperoleh badge "Konsisten Belajar" karena telah belajar selama 7 hari berturut-turut.',
                'type' => 'achievement',
                'priority' => 'high',
                'is_read' => true,
                'action_url' => '/achievements/badges',
                'created_at' => now()->subDays(3)->toISOString(),
                'read_at' => now()->subDays(2)->toISOString()
            ],
            [
                'id' => 6,
                'title' => 'Pembaruan Sistem',
                'message' => 'Sistem telah diperbarui dengan fitur-fitur baru untuk meningkatkan pengalaman belajarmu. Lihat apa saja yang baru!',
                'type' => 'system',
                'priority' => 'low',
                'is_read' => true,
                'action_url' => '/changelog',
                'created_at' => now()->subDays(5)->toISOString(),
                'read_at' => now()->subDays(4)->toISOString()
            ],
            [
                'id' => 7,
                'title' => 'Reminder: Ujian Simulasi Besok',
                'message' => 'Jangan lupa! Ujian simulasi CPNS akan dimulai besok pukul 09:00. Pastikan kamu sudah siap dan review materi terakhir kali.',
                'type' => 'reminder',
                'priority' => 'high',
                'is_read' => false,
                'action_url' => '/tests/simulation-cpns',
                'created_at' => now()->subHours(12)->toISOString(),
                'read_at' => null
            ],
            [
                'id' => 8,
                'title' => 'Progress Mingguan',
                'message' => 'Laporan progress belajar minggu ini: 45 jam belajar, 12 tes diselesaikan, dan 3 badge baru. Pertahankan semangat!',
                'type' => 'success',
                'priority' => 'medium',
                'is_read' => true,
                'action_url' => '/reports/weekly',
                'created_at' => now()->subDays(1)->toISOString(),
                'read_at' => now()->subHours(8)->toISOString()
            ]
        ];
    }
}
