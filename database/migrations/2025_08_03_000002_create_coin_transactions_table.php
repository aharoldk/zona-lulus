<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('coin_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['purchase', 'spend', 'refund']);
            $table->integer('amount'); // positive for purchase/refund, negative for spend
            $table->integer('balance_after');
            $table->string('description');
            $table->json('metadata')->nullable(); // store additional data like payment_id, test_id, etc.
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('coin_transactions');
    }
};
