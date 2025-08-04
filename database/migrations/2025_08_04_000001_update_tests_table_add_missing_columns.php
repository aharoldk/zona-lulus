<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->string('code')->unique()->after('id');
            $table->datetime('exam_date')->nullable()->after('randomize_questions');
            $table->datetime('registration_deadline')->nullable()->after('exam_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->dropColumn([
                'code',
                'exam_date',
                'registration_deadline',
            ]);
        });
    }
};
