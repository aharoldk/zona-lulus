<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('midtrans_transaction_id')->nullable()->after('id');
            $table->string('midtrans_order_id')->nullable()->after('midtrans_transaction_id');
            $table->string('payment_type')->nullable()->after('payment_method');
            $table->json('midtrans_response')->nullable()->after('metadata');
            $table->timestamp('paid_at')->nullable()->after('midtrans_response');
            $table->string('fraud_status')->nullable()->after('paid_at');
            $table->string('transaction_status')->nullable()->after('fraud_status');

            $table->index('midtrans_transaction_id');
            $table->index('midtrans_order_id');
        });
    }

    public function down()
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['midtrans_transaction_id']);
            $table->dropIndex(['midtrans_order_id']);
            $table->dropColumn([
                'midtrans_transaction_id',
                'midtrans_order_id',
                'payment_type',
                'midtrans_response',
                'paid_at',
                'fraud_status',
                'transaction_status'
            ]);
        });
    }
};
