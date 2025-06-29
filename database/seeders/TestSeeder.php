<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tests')->insert([
            [
                'id' => 1,
                'title' => 'Tryout TNI - Paket Lengkap',
                'slug' => 'tryout-tni-paket-lengkap',
                'description' => 'Tes simulasi untuk persiapan seleksi TNI dengan soal-soal terbaru',
                'category' => 'tni',
                'time_limit' => 120, // 2 hours in minutes
                'attempts_allowed' => 3,
                'is_active' => true,
                'is_free' => true,
                'price' => null,
                'show_result' => true,
                'randomize_questions' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
