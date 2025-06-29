<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            [
                'test_id' => 1,
                'question_text' => 'Jika 2x + 3 = 11, maka nilai x adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => '2'],
                    ['key' => 'B', 'text' => '4'],
                    ['key' => 'C', 'text' => '5'],
                    ['key' => 'D', 'text' => '6']
                ]),
                'correct_answer' => 'B',
                'category' => 'Matematika',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Siapa presiden pertama Indonesia?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'Soekarno'],
                    ['key' => 'B', 'text' => 'Soeharto'],
                    ['key' => 'C', 'text' => 'B.J. Habibie'],
                    ['key' => 'D', 'text' => 'Megawati']
                ]),
                'correct_answer' => 'A',
                'category' => 'Sejarah',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Kata yang memiliki makna berlawanan dengan "gelap" adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'Suram'],
                    ['key' => 'B', 'text' => 'Terang'],
                    ['key' => 'C', 'text' => 'Remang'],
                    ['key' => 'D', 'text' => 'Kabur']
                ]),
                'correct_answer' => 'B',
                'category' => 'Bahasa Indonesia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Hasil dari 15 × 8 ÷ 4 adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => '20'],
                    ['key' => 'B', 'text' => '30'],
                    ['key' => 'C', 'text' => '40'],
                    ['key' => 'D', 'text' => '60']
                ]),
                'correct_answer' => 'B',
                'category' => 'Matematika',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Pancasila pertama kali dikumandangkan pada tanggal?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => '17 Agustus 1945'],
                    ['key' => 'B', 'text' => '1 Juni 1945'],
                    ['key' => 'C', 'text' => '18 Agustus 1945'],
                    ['key' => 'D', 'text' => '22 Juni 1945']
                ]),
                'correct_answer' => 'B',
                'category' => 'Sejarah',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Sinonim dari kata "cerdas" adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'Bodoh'],
                    ['key' => 'B', 'text' => 'Pintar'],
                    ['key' => 'C', 'text' => 'Malas'],
                    ['key' => 'D', 'text' => 'Lambat']
                ]),
                'correct_answer' => 'B',
                'category' => 'Bahasa Indonesia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Ibukota provinsi Jawa Barat adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'Jakarta'],
                    ['key' => 'B', 'text' => 'Semarang'],
                    ['key' => 'C', 'text' => 'Bandung'],
                    ['key' => 'D', 'text' => 'Surabaya']
                ]),
                'correct_answer' => 'C',
                'category' => 'Pengetahuan Umum',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Jika sebuah segitiga memiliki alas 10 cm dan tinggi 6 cm, maka luasnya adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => '30 cm²'],
                    ['key' => 'B', 'text' => '60 cm²'],
                    ['key' => 'C', 'text' => '16 cm²'],
                    ['key' => 'D', 'text' => '40 cm²']
                ]),
                'correct_answer' => 'A',
                'category' => 'Matematika',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Organisasi pemuda yang didirikan oleh Soekarno adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'Budi Utomo'],
                    ['key' => 'B', 'text' => 'Jong Java'],
                    ['key' => 'C', 'text' => 'Perhimpunan Indonesia'],
                    ['key' => 'D', 'text' => 'Sarekat Islam']
                ]),
                'correct_answer' => 'C',
                'category' => 'Sejarah',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Kalimat yang menggunakan kata baku adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'Dia merubah keputusannya'],
                    ['key' => 'B', 'text' => 'Dia mengubah keputusannya'],
                    ['key' => 'C', 'text' => 'Dia ngerubah keputusannya'],
                    ['key' => 'D', 'text' => 'Dia rubah keputusannya']
                ]),
                'correct_answer' => 'B',
                'category' => 'Bahasa Indonesia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Planet yang terdekat dengan matahari adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'Venus'],
                    ['key' => 'B', 'text' => 'Mars'],
                    ['key' => 'C', 'text' => 'Merkurius'],
                    ['key' => 'D', 'text' => 'Bumi']
                ]),
                'correct_answer' => 'C',
                'category' => 'Pengetahuan Umum',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Akar dari 144 adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => '11'],
                    ['key' => 'B', 'text' => '12'],
                    ['key' => 'C', 'text' => '13'],
                    ['key' => 'D', 'text' => '14']
                ]),
                'correct_answer' => 'B',
                'category' => 'Matematika',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Proklamasi kemerdekaan Indonesia dibacakan di?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'Jalan Pegangsaan Timur 56'],
                    ['key' => 'B', 'text' => 'Jalan Merdeka 17'],
                    ['key' => 'C', 'text' => 'Istana Merdeka'],
                    ['key' => 'D', 'text' => 'Monas']
                ]),
                'correct_answer' => 'A',
                'category' => 'Sejarah',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Antonim dari kata "rajin" adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'Tekun'],
                    ['key' => 'B', 'text' => 'Giat'],
                    ['key' => 'C', 'text' => 'Malas'],
                    ['key' => 'D', 'text' => 'Cepat']
                ]),
                'correct_answer' => 'C',
                'category' => 'Bahasa Indonesia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Laut yang terletak di sebelah utara Indonesia adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'Laut Jawa'],
                    ['key' => 'B', 'text' => 'Laut Cina Selatan'],
                    ['key' => 'C', 'text' => 'Laut Banda'],
                    ['key' => 'D', 'text' => 'Laut Arafura']
                ]),
                'correct_answer' => 'B',
                'category' => 'Pengetahuan Umum',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Hasil dari 7² - 3² adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => '40'],
                    ['key' => 'B', 'text' => '30'],
                    ['key' => 'C', 'text' => '16'],
                    ['key' => 'D', 'text' => '20']
                ]),
                'correct_answer' => 'A',
                'category' => 'Matematika',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Perang Diponegoro terjadi pada tahun?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => '1825-1830'],
                    ['key' => 'B', 'text' => '1820-1825'],
                    ['key' => 'C', 'text' => '1830-1835'],
                    ['key' => 'D', 'text' => '1815-1820']
                ]),
                'correct_answer' => 'A',
                'category' => 'Sejarah',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Kata yang termasuk kata benda adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'Berlari'],
                    ['key' => 'B', 'text' => 'Indah'],
                    ['key' => 'C', 'text' => 'Rumah'],
                    ['key' => 'D', 'text' => 'Dengan']
                ]),
                'correct_answer' => 'C',
                'category' => 'Bahasa Indonesia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Negara dengan jumlah penduduk terbanyak di dunia adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'India'],
                    ['key' => 'B', 'text' => 'Amerika Serikat'],
                    ['key' => 'C', 'text' => 'Indonesia'],
                    ['key' => 'D', 'text' => 'China']
                ]),
                'correct_answer' => 'D',
                'category' => 'Pengetahuan Umum',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'test_id' => 1,
                'question_text' => 'Persamaan garis yang melalui titik (0,3) dan bergradien 2 adalah?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    ['key' => 'A', 'text' => 'y = 2x + 3'],
                    ['key' => 'B', 'text' => 'y = 3x + 2'],
                    ['key' => 'C', 'text' => 'y = x + 5'],
                    ['key' => 'D', 'text' => 'y = 2x - 3']
                ]),
                'correct_answer' => 'A',
                'category' => 'Matematika',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('questions')->insert($questions);
    }
}
