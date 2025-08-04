<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Test;
use App\Models\Question;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all tests from database
        $tests = Test::all();

        foreach ($tests as $test) {
            $this->createQuestionsForTest($test);
        }
    }

    private function createQuestionsForTest($test)
    {
        $questionCount = $this->getQuestionCountByCode($test->code);
        $questions = $this->getQuestionsByCategory($test->category, $test->code, $questionCount);

        foreach ($questions as $questionData) {
            Question::updateOrCreate(
                [
                    'test_id' => $test->id,
                    'question_text' => $questionData['question_text']
                ],
                $questionData
            );
        }
    }

    private function getQuestionCountByCode($code)
    {
        // Different question counts based on test code
        $questionCounts = [
            'TNI-AD-001' => 100,
            'TNI-AU-001' => 120,
            'TNI-AL-001' => 110,
            'TNI-FREE-001' => 50,
            'POLRI-AK-001' => 120,
            'POLRI-PTU-001' => 100,
            'POLRI-TAM-001' => 80,
            'POLRI-FREE-001' => 40,
            'CPNS-SKD-001' => 110,
            'STAN-PREM-001' => 150,
            'STIS-STAT-001' => 100,
            'IPDN-PEMDA-001' => 120,
            'KED-FREE-001' => 60,
            'KED-TIU-001' => 80,
            'STIN-INTEL-001' => 200
        ];

        return $questionCounts[$code] ?? 50;
    }

    private function getQuestionsByCategory($category, $code, $count)
    {
        switch ($category) {
            case 'tni':
                return $this->getTNIQuestions($code, $count);
            case 'polri':
                return $this->getPOLRIQuestions($code, $count);
            case 'kedinasan':
                return $this->getKedinaanQuestions($code, $count);
            default:
                return [];
        }
    }

    private function getTNIQuestions($code, $count)
    {
        $baseQuestions = [
            [
                'question_text' => 'Pancasila sebagai dasar negara Indonesia disahkan pada tanggal?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => '17 Agustus 1945',
                    'B' => '18 Agustus 1945',
                    'C' => '1 Juni 1945',
                    'D' => '22 Juni 1945'
                ],
                'correct_answer' => 'B',
                'explanation' => 'Pancasila disahkan sebagai dasar negara pada tanggal 18 Agustus 1945.',
                'points' => 1
            ],
            [
                'question_text' => 'Berapa hasil dari 15 × 8 + 25?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => '125',
                    'B' => '145',
                    'C' => '135',
                    'D' => '155'
                ],
                'correct_answer' => 'B',
                'explanation' => '15 × 8 = 120, kemudian 120 + 25 = 145',
                'points' => 1
            ],
            [
                'question_text' => 'Siapakah Panglima TNI yang pertama?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'Jenderal Soedirman',
                    'B' => 'Jenderal A.H. Nasution',
                    'C' => 'Jenderal T.B. Simatupang',
                    'D' => 'Jenderal Oerip Soemohardjo'
                ],
                'correct_answer' => 'A',
                'explanation' => 'Jenderal Soedirman adalah Panglima Besar TNI yang pertama.',
                'points' => 1
            ],
            [
                'question_text' => 'Apa kepanjangan dari TNI?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'Tentara Nasional Indonesia',
                    'B' => 'Tentara Negara Indonesia',
                    'C' => 'Tentara Nusantara Indonesia',
                    'D' => 'Tentara Negeri Indonesia'
                ],
                'correct_answer' => 'A',
                'explanation' => 'TNI adalah singkatan dari Tentara Nasional Indonesia.',
                'points' => 1
            ],
            [
                'question_text' => 'Jika x + 5 = 12, maka nilai x adalah?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => '5',
                    'B' => '6',
                    'C' => '7',
                    'D' => '8'
                ],
                'correct_answer' => 'C',
                'explanation' => 'x + 5 = 12, maka x = 12 - 5 = 7',
                'points' => 1
            ],
            [
                'question_text' => 'Hari kemerdekaan Indonesia diperingati setiap tanggal?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => '17 Agustus',
                    'B' => '1 Oktober',
                    'C' => '28 Oktober',
                    'D' => '10 November'
                ],
                'correct_answer' => 'A',
                'explanation' => 'Indonesia merdeka pada tanggal 17 Agustus 1945.',
                'points' => 1
            ]
        ];

        return $this->generateQuestionsFromBase($baseQuestions, $count);
    }

    private function getPOLRIQuestions($code, $count)
    {
        $baseQuestions = [
            [
                'question_text' => 'POLRI adalah singkatan dari?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'Polisi Republik Indonesia',
                    'B' => 'Polisi Rakyat Indonesia',
                    'C' => 'Polisi Negara Republik Indonesia',
                    'D' => 'Polisi Nasional Republik Indonesia'
                ],
                'correct_answer' => 'A',
                'explanation' => 'POLRI adalah singkatan dari Polisi Republik Indonesia.',
                'points' => 1
            ],
            [
                'question_text' => 'Tugas utama POLRI adalah?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'Memelihara kamtibmas',
                    'B' => 'Menegakkan hukum',
                    'C' => 'Melindungi, mengayomi, dan melayani masyarakat',
                    'D' => 'Semua benar'
                ],
                'correct_answer' => 'D',
                'explanation' => 'Semua pilihan merupakan tugas utama POLRI.',
                'points' => 1
            ],
            [
                'question_text' => 'Tribrata POLRI terdiri dari?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'Rastra, Yaksa, Hasta',
                    'B' => 'Tri Brata, Catur Prasetya, Sapta Marga',
                    'C' => 'Melindungi, Mengayomi, Melayani',
                    'D' => 'Tega, Tuntas, Tabah'
                ],
                'correct_answer' => 'A',
                'explanation' => 'Tribrata POLRI adalah Rastra (mengayomi), Yaksa (melayani), dan Hasta (melindungi).',
                'points' => 1
            ],
            [
                'question_text' => 'Berapa hasil dari 25% dari 200?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => '25',
                    'B' => '50',
                    'C' => '75',
                    'D' => '100'
                ],
                'correct_answer' => 'B',
                'explanation' => '25% dari 200 = 25/100 × 200 = 50',
                'points' => 1
            ],
            [
                'question_text' => 'UUD 1945 terdiri dari berapa pasal?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => '37 pasal',
                    'B' => '45 pasal',
                    'C' => '73 pasal',
                    'D' => '37 pasal (sebelum amandemen)'
                ],
                'correct_answer' => 'D',
                'explanation' => 'UUD 1945 sebelum amandemen terdiri dari 37 pasal, setelah amandemen menjadi 73 pasal.',
                'points' => 1
            ]
        ];

        return $this->generateQuestionsFromBase($baseQuestions, $count);
    }

    private function getKedinaanQuestions($code, $count)
    {
        $baseQuestions = [
            [
                'question_text' => 'CPNS adalah singkatan dari?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'Calon Pegawai Negeri Sipil',
                    'B' => 'Calon Pegawai Nasional Sipil',
                    'C' => 'Calon Pekerja Negeri Sipil',
                    'D' => 'Calon Personel Negeri Sipil'
                ],
                'correct_answer' => 'A',
                'explanation' => 'CPNS adalah Calon Pegawai Negeri Sipil.',
                'points' => 1
            ],
            [
                'question_text' => 'Tes Wawasan Kebangsaan (TWK) bertujuan untuk menilai?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'Kemampuan akademik',
                    'B' => 'Penguasaan pengetahuan dan kemampuan mengimplementasikan nilai-nilai 4 pilar kebangsaan',
                    'C' => 'Kemampuan numerik',
                    'D' => 'Kemampuan verbal'
                ],
                'correct_answer' => 'B',
                'explanation' => 'TWK menilai penguasaan pengetahuan tentang 4 pilar kebangsaan Indonesia.',
                'points' => 1
            ],
            [
                'question_text' => 'Empat pilar kebangsaan Indonesia adalah?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika',
                    'B' => 'Pancasila, UUD 1945, Demokrasi, HAM',
                    'C' => 'Pancasila, Demokrasi, NKRI, Bhinneka Tunggal Ika',
                    'D' => 'UUD 1945, NKRI, Demokrasi, HAM'
                ],
                'correct_answer' => 'A',
                'explanation' => 'Empat pilar kebangsaan: Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika.',
                'points' => 1
            ],
            [
                'question_text' => 'Jika 2x + 3 = 11, maka x = ?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => '3',
                    'B' => '4',
                    'C' => '5',
                    'D' => '6'
                ],
                'correct_answer' => 'B',
                'explanation' => '2x + 3 = 11, maka 2x = 8, sehingga x = 4',
                'points' => 1
            ],
            [
                'question_text' => 'STAN adalah singkatan dari?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => 'Sekolah Tinggi Akuntansi Negara',
                    'B' => 'Sekolah Tinggi Administrasi Negara',
                    'C' => 'Sekolah Tinggi Akuntansi Nasional',
                    'D' => 'Sekolah Tinggi Administrasi Nasional'
                ],
                'correct_answer' => 'A',
                'explanation' => 'STAN adalah Sekolah Tinggi Akuntansi Negara.',
                'points' => 1
            ],
            [
                'question_text' => 'Berapa hasil dari √144?',
                'question_type' => 'multiple_choice',
                'options' => [
                    'A' => '10',
                    'B' => '11',
                    'C' => '12',
                    'D' => '13'
                ],
                'correct_answer' => 'C',
                'explanation' => '√144 = 12 karena 12 × 12 = 144',
                'points' => 1
            ]
        ];

        return $this->generateQuestionsFromBase($baseQuestions, $count);
    }

    private function generateQuestionsFromBase($baseQuestions, $targetCount)
    {
        $questions = [];
        $baseCount = count($baseQuestions);

        // Add base questions first
        $questions = array_merge($questions, $baseQuestions);

        // Generate additional questions by modifying base questions
        while (count($questions) < $targetCount) {
            foreach ($baseQuestions as $baseQuestion) {
                if (count($questions) >= $targetCount) break;

                $modifiedQuestion = $this->modifyQuestion($baseQuestion, count($questions) + 1);
                $questions[] = $modifiedQuestion;
            }
        }

        return array_slice($questions, 0, $targetCount);
    }

    private function modifyQuestion($baseQuestion, $number)
    {
        // Simple modification: add question number variation
        $modified = $baseQuestion;

        // Add variation to question text
        if (strpos($baseQuestion['question_text'], 'Berapa hasil dari') !== false) {
            // Modify math questions
            $variations = [
                'Berapa hasil dari 20 × 5 + 15?' => ['A' => '115', 'B' => '125', 'C' => '135', 'D' => '145'],
                'Berapa hasil dari 18 + 7 × 3?' => ['A' => '39', 'B' => '75', 'C' => '54', 'D' => '21'],
                'Berapa hasil dari 50 - 8 × 4?' => ['A' => '18', 'B' => '168', 'C' => '42', 'D' => '32'],
            ];

            $randomVar = array_rand($variations);
            $modified['question_text'] = $randomVar;
            $modified['options'] = $variations[$randomVar];
            $modified['correct_answer'] = 'A'; // Simplified for seeding
        } else {
            // For non-math questions, add variation prefix
            $modified['question_text'] = "Soal " . $number . ": " . $baseQuestion['question_text'];
        }

        return $modified;
    }
}
