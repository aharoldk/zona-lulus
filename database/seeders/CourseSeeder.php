<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                'title' => 'Persiapan TNI - Akademi Militer',
                'slug' => 'persiapan-tni-akademi-militer',
                'description' => 'Program lengkap untuk persiapan masuk TNI Akademi Militer dengan materi terlengkap dan simulasi tes yang komprehensif.',
                'thumbnail' => '/images/courses/course-tni.jpg',
                'category' => 'tni',
                'is_free' => false,
                'price' => 750000.00,
                'duration_days' => 180,
                'order' => 1,
                'is_active' => true,
                'metadata' => json_encode([
                    'instructor' => 'Mayor Budi Santoso',
                    'rating' => 4.8,
                    'level' => 'Menengah',
                    'modules' => 24,
                    'tests' => 12,
                    'features' => [
                        'Video pembelajaran HD',
                        'Bank soal 1000+ pertanyaan',
                        'Simulasi tes berbasis CAT',
                        'Konsultasi dengan instruktur',
                        'Sertifikat digital'
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Persiapan POLRI - Akademi Kepolisian',
                'slug' => 'persiapan-polri-akademi-kepolisian',
                'description' => 'Kursus komprehensif untuk persiapan masuk POLRI dengan simulasi tes terlengkap dan materi terkini.',
                'thumbnail' => '/images/courses/course-polri.jpg',
                'category' => 'polri',
                'is_free' => false,
                'price' => 700000.00,
                'duration_days' => 150,
                'order' => 2,
                'is_active' => true,
                'metadata' => json_encode([
                    'instructor' => 'Komisaris Andi Wijaya',
                    'rating' => 4.7,
                    'level' => 'Menengah',
                    'modules' => 20,
                    'tests' => 10,
                    'features' => [
                        'Materi psikotes terlengkap',
                        'Simulasi wawancara',
                        'Tips kesehatan jasmani',
                        'Bank soal akademik',
                        'Mentoring personal'
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'CPNS 2024 - Seleksi Kompetensi Dasar',
                'slug' => 'cpns-2024-seleksi-kompetensi-dasar',
                'description' => 'Persiapan lengkap untuk tes CPNS dengan fokus pada SKD dan materi terkini sesuai regulasi terbaru.',
                'thumbnail' => '/images/courses/course-cpns.jpg',
                'category' => 'kedinasan',
                'is_free' => true,
                'price' => null,
                'duration_days' => 120,
                'order' => 3,
                'is_active' => true,
                'metadata' => json_encode([
                    'instructor' => 'Dr. Sari Melati',
                    'rating' => 4.7,
                    'level' => 'Pemula',
                    'modules' => 18,
                    'tests' => 8,
                    'features' => [
                        'Gratis akses selamanya',
                        'TWK, TIU, TKP lengkap',
                        'Pembahasan detail',
                        'Update regulasi terbaru',
                        'Community support'
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Persiapan BUMN - Tes Masuk Perusahaan',
                'slug' => 'persiapan-bumn-tes-masuk-perusahaan',
                'description' => 'Program khusus untuk persiapan tes masuk BUMN dengan fokus pada kompetensi teknis dan manajerial.',
                'thumbnail' => '/images/courses/course-bumn.jpg',
                'category' => 'kedinasan',
                'is_free' => false,
                'price' => 450000.00,
                'duration_days' => 90,
                'order' => 4,
                'is_active' => true,
                'metadata' => json_encode([
                    'instructor' => 'Prof. Ahmad Kurniawan',
                    'rating' => 4.6,
                    'level' => 'Menengah',
                    'modules' => 15,
                    'tests' => 6,
                    'features' => [
                        'Studi kasus BUMN',
                        'Analisis laporan keuangan',
                        'Tes kepemimpinan',
                        'Presentasi bisnis',
                        'Networking session'
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Matematika Dasar - TNI/POLRI',
                'slug' => 'matematika-dasar-tni-polri',
                'description' => 'Penguatan fundamental matematika yang sering keluar dalam tes TNI dan POLRI.',
                'thumbnail' => '/images/courses/course-math.jpg',
                'category' => 'tni',
                'is_free' => true,
                'price' => null,
                'duration_days' => 60,
                'order' => 5,
                'is_active' => true,
                'metadata' => json_encode([
                    'instructor' => 'Drs. Bambang Sutrisno',
                    'rating' => 4.5,
                    'level' => 'Pemula',
                    'modules' => 12,
                    'tests' => 5,
                    'features' => [
                        'Dasar-dasar aljabar',
                        'Geometri praktis',
                        'Statistika sederhana',
                        'Latihan soal harian',
                        'Video animasi konsep'
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Bahasa Indonesia - Tata Bahasa & Literasi',
                'slug' => 'bahasa-indonesia-tata-bahasa-literasi',
                'description' => 'Penguasaan bahasa Indonesia yang baik dan benar sesuai standar tes kedinasan.',
                'thumbnail' => '/images/courses/course-indo.jpg',
                'category' => 'kedinasan',
                'is_free' => true,
                'price' => null,
                'duration_days' => 45,
                'order' => 6,
                'is_active' => true,
                'metadata' => json_encode([
                    'instructor' => 'Dra. Sri Wahyuni, M.Pd',
                    'rating' => 4.8,
                    'level' => 'Pemula',
                    'modules' => 10,
                    'tests' => 4,
                    'features' => [
                        'PUEBI terbaru',
                        'Sinonim & antonim',
                        'Analisis wacana',
                        'Pengayaan kosakata',
                        'Tes pemahaman bacaan'
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'CPNS 2025 - Tes Kompetensi Dasar',
                'slug' => 'cpns-2025-tes-kompetensi-dasar',
                'description' => 'Persiapan lengkap untuk tes CPNS 2025 dengan fokus pada Tes Kompetensi Dasar (TKD) dan Tes Kompetensi Bidang.',
                'thumbnail' => '/images/courses/course-cpns.jpg',
                'category' => 'kedinasan',
                'is_free' => true,
                'price' => 0.00,
                'duration_days' => 90,
                'order' => 3,
                'is_active' => true,
                'metadata' => json_encode([
                    'instructor' => 'Dr. Sari Indrawati',
                    'rating' => 4.6,
                    'level' => 'Pemula',
                    'modules' => 15,
                    'tests' => 8,
                    'features' => [
                        'Materi TWK, TIU, TKP',
                        'Simulasi CAT BKN',
                        'Analisis hasil tes',
                        'Tips dan trik',
                        'Update kebijakan terbaru'
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'TNI AU - Persiapan Khusus Penerbang',
                'slug' => 'tni-au-persiapan-khusus-penerbang',
                'description' => 'Program khusus untuk calon penerbang TNI AU dengan materi spesialisasi dan tes kesehatan penerbangan.',
                'thumbnail' => '/images/courses/course-tni-au.jpg',
                'category' => 'tni',
                'is_free' => false,
                'price' => 1200000.00,
                'duration_days' => 240,
                'order' => 4,
                'is_active' => true,
                'metadata' => json_encode([
                    'instructor' => 'Kolonel Pilot Heri Susanto',
                    'rating' => 4.9,
                    'level' => 'Lanjutan',
                    'modules' => 30,
                    'tests' => 15,
                    'features' => [
                        'Tes kesehatan penerbangan',
                        'Simulasi flight test',
                        'Materi aerodinamika',
                        'Tes psikologi aviasi',
                        'Konseling karir'
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'POLRI - Bintara & Tamtama',
                'slug' => 'polri-bintara-tamtama',
                'description' => 'Persiapan khusus untuk pendaftaran Bintara dan Tamtama POLRI dengan materi yang disesuaikan.',
                'thumbnail' => '/images/courses/course-polri-bt.jpg',
                'category' => 'polri',
                'is_free' => false,
                'price' => 500000.00,
                'duration_days' => 120,
                'order' => 5,
                'is_active' => true,
                'metadata' => json_encode([
                    'instructor' => 'Ajun Komisaris Dewi Kartika',
                    'rating' => 4.5,
                    'level' => 'Pemula',
                    'modules' => 18,
                    'tests' => 9,
                    'features' => [
                        'Tes akademik dasar',
                        'Latihan fisik panduan',
                        'Tes kepribadian',
                        'Simulasi wawancara',
                        'Tips sukses rekrutmen'
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'TNI AL - Akademi Angkatan Laut',
                'slug' => 'tni-al-akademi-angkatan-laut',
                'description' => 'Program persiapan masuk TNI AL dengan materi khusus maritim dan navigasi.',
                'thumbnail' => '/images/courses/course-tni-al.jpg',
                'category' => 'tni',
                'is_free' => false,
                'price' => 800000.00,
                'duration_days' => 200,
                'order' => 6,
                'is_active' => true,
                'metadata' => json_encode([
                    'instructor' => 'Kolonel Laut Agus Setiawan',
                    'rating' => 4.7,
                    'level' => 'Menengah',
                    'modules' => 25,
                    'tests' => 12,
                    'features' => [
                        'Materi navigasi maritim',
                        'Tes renang dan diving',
                        'Simulasi operasi laut',
                        'Tes akademik khusus',
                        'Bimbingan karir maritim'
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('courses')->insert($courses);

        // Create sample modules for each course
        $this->createSampleModules();
    }

    private function createSampleModules()
    {
        $courses = DB::table('courses')->get();

        foreach ($courses as $course) {
            $moduleCount = json_decode($course->metadata)->modules ?? 5;

            for ($i = 1; $i <= min($moduleCount, 5); $i++) {
                DB::table('modules')->insert([
                    'course_id' => $course->id,
                    'title' => "Modul {$i} - " . $this->getModuleTitle($course->category, $i),
                    'description' => $this->getModuleDescription($course->category, $i),
                    'order' => $i,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function getModuleTitle($category, $moduleNumber)
    {
        $modules = [
            'tni' => [
                1 => 'Pengetahuan Umum TNI',
                2 => 'Matematika Dasar',
                3 => 'Bahasa Indonesia',
                4 => 'Tes Psikologi',
                5 => 'Kesehatan Jasmani'
            ],
            'polri' => [
                1 => 'Pengetahuan Umum Kepolisian',
                2 => 'Akademik Dasar',
                3 => 'Psikotes dan Kepribadian',
                4 => 'Wawasan Kebangsaan',
                5 => 'Etika Profesi'
            ],
            'kedinasan' => [
                1 => 'Tes Wawasan Kebangsaan (TWK)',
                2 => 'Tes Intelegensi Umum (TIU)',
                3 => 'Tes Karakteristik Pribadi (TKP)',
                4 => 'Tes Kompetensi Bidang',
                5 => 'Simulasi CAT'
            ]
        ];

        return $modules[$category][$moduleNumber] ?? "Modul {$moduleNumber}";
    }

    private function getModuleDescription($category, $moduleNumber)
    {
        $descriptions = [
            'tni' => [
                1 => 'Materi dasar tentang sejarah, struktur, dan nilai-nilai TNI',
                2 => 'Matematika dasar yang sering muncul dalam tes TNI',
                3 => 'Kemampuan berbahasa Indonesia yang baik dan benar',
                4 => 'Tes psikologi untuk mengukur kepribadian dan mental',
                5 => 'Persiapan tes kesehatan dan kebugaran jasmani'
            ],
            'polri' => [
                1 => 'Pengetahuan dasar tentang tugas dan fungsi Polri',
                2 => 'Materi akademik dasar untuk tes masuk Polri',
                3 => 'Persiapan psikotes dan tes kepribadian',
                4 => 'Wawasan kebangsaan dan kenegaraan',
                5 => 'Etika dan moral profesi kepolisian'
            ],
            'kedinasan' => [
                1 => 'Materi wawasan kebangsaan sesuai kisi-kisi terbaru',
                2 => 'Tes intelegensi umum dengan berbagai tipe soal',
                3 => 'Tes karakteristik pribadi dan situasional',
                4 => 'Materi sesuai bidang jabatan yang dilamar',
                5 => 'Latihan simulasi Computer Assisted Test'
            ]
        ];

        return $descriptions[$category][$moduleNumber] ?? "Deskripsi modul {$moduleNumber}";
    }
}
