<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_id')->constrained()->cascadeOnDelete();
            $table->text('question_text');
            $table->enum('question_type', ['multiple_choice', 'true_false', 'essay']);
            $table->jsonb('options')->nullable();
            $table->string('correct_answer');
            $table->text('explanation')->nullable();
            $table->integer('points')->default(1);
            $table->timestamps();
            
            // GIN index for JSONB column
            $table->index('options', null, 'gin');
        });
    }

    public function down()
    {
        Schema::dropIfExists('questions');
    }
};
