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
        Schema::table('payments', function (Blueprint $table) {
            // Add course relationship
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();

            // Enhanced payment tracking fields
            $table->string('invoice_number')->unique()->after('user_id');
            $table->string('payment_channel')->nullable()->after('payment_method');
            $table->text('description')->nullable();

            // Xendit integration fields
            $table->string('xendit_invoice_id')->nullable()->unique();
            $table->string('xendit_payment_id')->nullable();
            $table->string('xendit_refund_id')->nullable();

            // Payment lifecycle timestamps
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            // Admin management fields
            $table->text('admin_notes')->nullable();
            $table->foreignId('status_updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('status_updated_at')->nullable();

            // Refund management
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->text('refund_reason')->nullable();
            $table->foreignId('refund_processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('refund_processed_at')->nullable();

            // Add new status options
            $table->dropColumn('status');
        });

        // Recreate status column with enhanced options
        Schema::table('payments', function (Blueprint $table) {
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled', 'refunded', 'expired'])
                  ->default('pending')
                  ->after('currency');
        });

        // Add indexes for better performance
        Schema::table('payments', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'status']);
            $table->index(['course_id', 'status']);
            $table->index('xendit_invoice_id');
            $table->index('invoice_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Remove indexes
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['course_id', 'status']);
            $table->dropIndex(['xendit_invoice_id']);
            $table->dropIndex(['invoice_number']);

            // Remove added columns
            $table->dropForeign(['course_id']);
            $table->dropColumn([
                'course_id',
                'invoice_number',
                'payment_channel',
                'description',
                'xendit_invoice_id',
                'xendit_payment_id',
                'xendit_refund_id',
                'paid_at',
                'expires_at',
                'admin_notes',
                'status_updated_by',
                'status_updated_at',
                'refund_amount',
                'refund_reason',
                'refund_processed_by',
                'refund_processed_at'
            ]);

            // Restore original status enum
            $table->dropColumn('status');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])
                  ->default('pending')
                  ->after('currency');
        });
    }
};
