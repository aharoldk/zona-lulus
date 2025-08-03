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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('gender', ['male', 'female'])->nullable()->after('birth_date');
            $table->string('location')->nullable()->after('gender');
            $table->text('bio')->nullable()->after('location');
            $table->string('avatar')->nullable()->after('bio');
            $table->json('settings')->nullable()->after('avatar');
            $table->timestamp('last_login_at')->nullable()->after('settings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'gender',
                'location',
                'bio',
                'avatar',
                'settings',
                'last_login_at'
            ]);
        });
    }
};
