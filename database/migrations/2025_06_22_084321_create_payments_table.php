<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('payment_method');
            $table->string('payment_reference')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('IDR');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded']);
            $table->jsonb('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
