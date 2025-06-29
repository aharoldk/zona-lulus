<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('education')->nullable();
            $table->text('address')->nullable();
            $table->rememberToken();
            $table->timestamps();
            
            // PostgreSQL specific indexes
            $table->rawIndex("to_tsvector('english', name)", 'users_name_search');
            $table->rawIndex("to_tsvector('english', email)", 'users_email_search');
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
