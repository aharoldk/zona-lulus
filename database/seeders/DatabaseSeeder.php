<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test Mailinator',
            'email' => 'test@mailinator.com',
            'password' => bcrypt('P@ssw0rd123'),
            'phone' => '081234567891',
        ]);

        // Call the seeders in proper order
        $this->call([
            TestSeeder::class,
            QuestionSeeder::class,
            CourseSeeder::class,
        ]);
    }
}
