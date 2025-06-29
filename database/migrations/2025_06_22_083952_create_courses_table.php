<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('thumbnail');
            $table->enum('category', ['tni', 'polri', 'kedinasan']);
            $table->boolean('is_free')->default(false);
            $table->decimal('price', 10, 2)->nullable();
            $table->integer('duration_days')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->jsonb('metadata')->nullable();
            $table->timestamps();
            
            // Full-text search index
            $table->rawIndex("to_tsvector('english', title || ' ' || description)", 'courses_search');
        });
    }

    public function down()
    {
        Schema::dropIfExists('courses');
    }
};
