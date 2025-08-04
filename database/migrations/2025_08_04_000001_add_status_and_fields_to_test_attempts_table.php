<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('test_attempts', function (Blueprint $table) {
            // Add missing columns that are referenced in the TestAttempt model
            $table->string('status')->default('in_progress')->after('test_id');
            $table->timestamp('scheduled_at')->nullable()->after('completed_at');
            $table->integer('time_taken')->nullable()->after('time_spent'); // Rename time_spent to time_taken for consistency
        });

        // Rename time_spent to time_taken for consistency with the model
        Schema::table('test_attempts', function (Blueprint $table) {
            $table->dropColumn('time_spent');
        });
    }

    public function down()
    {
        Schema::table('test_attempts', function (Blueprint $table) {
            $table->dropColumn(['status', 'scheduled_at', 'time_taken']);
            $table->integer('time_spent')->nullable()->comment('In seconds');
        });
    }
};
