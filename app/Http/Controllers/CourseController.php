<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\CourseProgress;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    /**
     * Get all courses with pagination and filtering
     */
    public function index(Request $request)
    {
        try {
            // First, let's return static data to test if the endpoint works
            // We'll replace this with database queries once we confirm the endpoint is working
            $sampleCourses = [
                [
                    'id' => 1,
                    'title' => 'Persiapan TNI - Akademi Militer',
                    'description' => 'Program lengkap untuk persiapan masuk TNI Akademi Militer dengan materi terlengkap dan simulasi tes yang komprehensif.',
                    'category' => 'TNI',
                    'level' => 'Menengah',
                    'price' => 750000,
                    'price_formatted' => 'Rp 750.000',
                    'is_free' => false,
                    'duration_hours' => 180,
                    'thumbnail' => '/images/courses/course-tni.jpg',
                    'modules_count' => 24,
                    'tests_count' => 12,
                    'students_count' => 1250,
                    'metadata' => [
                        'instructor' => 'Mayor Budi Santoso',
                        'rating' => 4.8,
                        'level' => 'Menengah'
                    ],
                    'created_at' => '2024-01-15T00:00:00.000Z',
                    'updated_at' => '2024-01-15T00:00:00.000Z'
                ],
                [
                    'id' => 2,
                    'title' => 'Persiapan POLRI - Akademi Kepolisian',
                    'description' => 'Kursus komprehensif untuk persiapan masuk POLRI dengan simulasi tes terlengkap dan materi terkini.',
                    'category' => 'POLRI',
                    'level' => 'Menengah',
                    'price' => 700000,
                    'price_formatted' => 'Rp 700.000',
                    'is_free' => false,
                    'duration_hours' => 150,
                    'thumbnail' => '/images/courses/course-polri.jpg',
                    'modules_count' => 20,
                    'tests_count' => 10,
                    'students_count' => 980,
                    'metadata' => [
                        'instructor' => 'Komisaris Andi Wijaya',
                        'rating' => 4.7,
                        'level' => 'Menengah'
                    ],
                    'created_at' => '2024-01-15T00:00:00.000Z',
                    'updated_at' => '2024-01-15T00:00:00.000Z'
                ],
                [
                    'id' => 3,
                    'title' => 'CPNS 2024 - Seleksi Kompetensi Dasar',
                    'description' => 'Persiapan lengkap untuk tes CPNS dengan fokus pada SKD dan materi terkini sesuai regulasi terbaru.',
                    'category' => 'CPNS',
                    'level' => 'Pemula',
                    'price' => 0,
                    'price_formatted' => 'Gratis',
                    'is_free' => true,
                    'duration_hours' => 120,
                    'thumbnail' => '/images/courses/course-cpns.jpg',
                    'modules_count' => 18,
                    'tests_count' => 8,
                    'students_count' => 2340,
                    'metadata' => [
                        'instructor' => 'Dr. Sari Melati',
                        'rating' => 4.7,
                        'level' => 'Pemula'
                    ],
                    'created_at' => '2024-01-15T00:00:00.000Z',
                    'updated_at' => '2024-01-15T00:00:00.000Z'
                ]
            ];

            // Apply basic filtering to the sample data
            $filteredCourses = $sampleCourses;

            // Apply category filter
            if ($request->has('category') && $request->category !== 'all') {
                $filteredCourses = array_filter($filteredCourses, function($course) use ($request) {
                    return strtolower($course['category']) === strtolower($request->category);
                });
            }

            // Apply search filter
            if ($request->has('search') && !empty($request->search)) {
                $search = strtolower($request->search);
                $filteredCourses = array_filter($filteredCourses, function($course) use ($search) {
                    return strpos(strtolower($course['title']), $search) !== false ||
                           strpos(strtolower($course['description']), $search) !== false;
                });
            }

            // Reset array keys and paginate
            $filteredCourses = array_values($filteredCourses);
            $perPage = $request->get('per_page', 12);
            $page = $request->get('page', 1);
            $offset = ($page - 1) * $perPage;
            $paginatedCourses = array_slice($filteredCourses, $offset, $perPage);

            // Create pagination structure
            $pagination = [
                'current_page' => (int)$page,
                'data' => $paginatedCourses,
                'from' => $offset + 1,
                'last_page' => ceil(count($filteredCourses) / $perPage),
                'per_page' => (int)$perPage,
                'to' => min($offset + $perPage, count($filteredCourses)),
                'total' => count($filteredCourses)
            ];

            return response()->json([
                'success' => true,
                'data' => $pagination
            ]);

            // TODO: Replace above static data with database queries once we fix database issues
            /*
            $query = Course::with(['modules', 'tests'])
                ->where('is_active', true);

            // Apply category filter
            if ($request->has('category') && $request->category !== 'all') {
                $query->where('category', $request->category);
            }

            // Apply search filter
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'LIKE', '%' . $request->search . '%')
                      ->orWhere('description', 'LIKE', '%' . $request->search . '%');
                });
            }

            // Get courses with pagination
            $perPage = $request->get('per_page', 12);
            $courses = $query->orderBy('order', 'asc')
                           ->orderBy('created_at', 'desc')
                           ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $courses
            ]);
            */

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch courses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's enrolled courses
     */
    public function myCourses(Request $request)
    {
        try {
            // Return static data for now
            $sampleMyCourses = [
                [
                    'id' => 1,
                    'title' => 'Persiapan TNI - Akademi Militer',
                    'description' => 'Program lengkap untuk persiapan masuk TNI Akademi Militer',
                    'category' => 'TNI',
                    'level' => 'Menengah',
                    'price_formatted' => 'Rp 750.000',
                    'is_free' => false,
                    'duration_hours' => 180,
                    'thumbnail' => '/images/courses/course-tni.jpg',
                    'modules_count' => 24,
                    'progress_percentage' => 65,
                    'completed_at' => null,
                    'metadata' => [
                        'instructor' => 'Mayor Budi Santoso',
                        'rating' => 4.8
                    ]
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $sampleMyCourses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user courses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific course with details
     */
    public function show($id)
    {
        try {
            // Return static data for the requested course
            $sampleCourse = [
                'id' => (int)$id,
                'title' => 'Persiapan TNI - Akademi Militer',
                'description' => 'Program lengkap untuk persiapan masuk TNI Akademi Militer dengan materi terlengkap dan simulasi tes yang komprehensif.',
                'category' => 'TNI',
                'level' => 'Menengah',
                'price_formatted' => 'Rp 750.000',
                'is_free' => false,
                'duration_hours' => 180,
                'thumbnail' => '/images/courses/course-tni.jpg',
                'modules' => [
                    [
                        'id' => 1,
                        'title' => 'Matematika Dasar',
                        'lessons' => [
                            ['id' => 1, 'title' => 'Aljabar Linear'],
                            ['id' => 2, 'title' => 'Geometri']
                        ]
                    ]
                ],
                'tests' => [
                    [
                        'id' => 1,
                        'title' => 'Tes Matematika Dasar'
                    ]
                ],
                'students_count' => 1250,
                'metadata' => [
                    'instructor' => 'Mayor Budi Santoso',
                    'rating' => 4.8,
                    'level' => 'Menengah'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $sampleCourse
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}
