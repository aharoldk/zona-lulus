<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tests', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->enum('category', ['tni', 'polri', 'kedinasan']);
            $table->integer('time_limit')->comment('In minutes');
            $table->integer('attempts_allowed')->default(1);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_free')->default(false);
            $table->decimal('price', 10, 2)->nullable();
            $table->boolean('show_result')->default(true);
            $table->boolean('randomize_questions')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tests');
    }
};
