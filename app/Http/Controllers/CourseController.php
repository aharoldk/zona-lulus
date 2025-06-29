<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    /**
     * Get all courses with pagination and filtering
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('courses')->where('is_active', true);

            // Apply category filter
            if ($request->has('category') && $request->category !== 'all') {
                $query->where('category', $request->category);
            }

            // Apply search filter
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'ILIKE', '%' . $request->search . '%')
                      ->orWhere('description', 'ILIKE', '%' . $request->search . '%');
                });
            }

            // Get courses with pagination
            $courses = $query->orderBy('order', 'asc')
                           ->orderBy('created_at', 'desc')
                           ->paginate(12);

            // Add additional computed fields
            $courses->getCollection()->transform(function ($course) {
                // Get module count
                $course->modules_count = DB::table('modules')
                    ->where('course_id', $course->id)
                    ->count();

                // Get test count
                $course->tests_count = DB::table('tests')
                    ->join('modules', 'tests.course_id', '=', 'modules.course_id')
                    ->where('modules.course_id', $course->id)
                    ->count();

                // Get enrolled students count
                $course->students_count = DB::table('course_progress')
                    ->where('course_id', $course->id)
                    ->distinct('user_id')
                    ->count();

                // Decode metadata
                $course->metadata = json_decode($course->metadata, true);

                return $course;
            });

            return response()->json([
                'success' => true,
                'data' => $courses
            ]);
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
            $userId = $request->user()->id;

            $courses = DB::table('courses')
                ->join('course_progress', 'courses.id', '=', 'course_progress.course_id')
                ->where('course_progress.user_id', $userId)
                ->where('courses.is_active', true)
                ->select('courses.*', 'course_progress.progress_percentage', 'course_progress.completed_at')
                ->orderBy('course_progress.updated_at', 'desc')
                ->get();

            // Add additional computed fields
            $courses = $courses->map(function ($course) {
                $course->modules_count = DB::table('modules')
                    ->where('course_id', $course->id)
                    ->count();

                $course->metadata = json_decode($course->metadata, true);

                return $course;
            });

            return response()->json([
                'success' => true,
                'data' => $courses
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
     * Get a specific course by ID
     */
    public function show($id)
    {
        try {
            $course = DB::table('courses')
                ->where('id', $id)
                ->where('is_active', true)
                ->first();

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }

            // Get modules with lessons
            $modules = DB::table('modules')
                ->where('course_id', $id)
                ->orderBy('order', 'asc')
                ->get();

            $modules = $modules->map(function ($module) {
                $module->lessons = DB::table('lessons')
                    ->where('module_id', $module->id)
                    ->orderBy('order', 'asc')
                    ->get();
                return $module;
            });

            // Get tests
            $tests = DB::table('tests')
                ->where('course_id', $id)
                ->orderBy('order', 'asc')
                ->get();

            $course->modules = $modules;
            $course->tests = $tests;
            $course->metadata = json_decode($course->metadata, true);

            return response()->json([
                'success' => true,
                'data' => $course
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch course',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enroll user in a course
     */
    public function enroll(Request $request, $id)
    {
        try {
            $userId = $request->user()->id;

            // Check if course exists
            $course = DB::table('courses')
                ->where('id', $id)
                ->where('is_active', true)
                ->first();

            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }

            // Check if already enrolled
            $existing = DB::table('course_progress')
                ->where('user_id', $userId)
                ->where('course_id', $id)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Already enrolled in this course'
                ], 400);
            }

            // Enroll user
            DB::table('course_progress')->insert([
                'user_id' => $userId,
                'course_id' => $id,
                'progress_percentage' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Successfully enrolled in course'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to enroll in course',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
