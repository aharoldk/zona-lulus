<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('module_access', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->enum('access_type', ['purchased', 'free', 'trial']);
            $table->timestamp('granted_at');
            $table->timestamp('expires_at')->nullable();
            $table->json('metadata')->nullable(); // store payment_id, coin_transaction_id, etc.
            $table->timestamps();

            $table->unique(['user_id', 'module_id']);
            $table->index(['user_id', 'access_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('module_access');
    }
};
