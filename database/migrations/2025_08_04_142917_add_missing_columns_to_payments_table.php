<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('payments', function (Blueprint $table) {
            // Check if columns exist before adding them to avoid duplicate column errors

            if (!Schema::hasColumn('payments', 'invoice_number')) {
                $table->string('invoice_number')->nullable()->after('user_id');
            }

            if (!Schema::hasColumn('payments', 'order_id')) {
                $table->string('order_id')->nullable()->after('invoice_number');
            }

            if (!Schema::hasColumn('payments', 'transaction_id')) {
                $table->string('transaction_id')->nullable()->after('payment_reference');
            }

            // Skip transaction_status since it already exists

            if (!Schema::hasColumn('payments', 'payment_channel')) {
                $table->string('payment_channel')->nullable()->after('transaction_status');
            }

            if (!Schema::hasColumn('payments', 'description')) {
                $table->text('description')->nullable()->after('currency');
            }

            if (!Schema::hasColumn('payments', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('description');
            }

            if (!Schema::hasColumn('payments', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('paid_at');
            }

            if (!Schema::hasColumn('payments', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('expires_at');
            }

            if (!Schema::hasColumn('payments', 'refund_amount')) {
                $table->decimal('refund_amount', 10, 2)->nullable()->after('admin_notes');
            }

            if (!Schema::hasColumn('payments', 'refund_reason')) {
                $table->text('refund_reason')->nullable()->after('refund_amount');
            }

            if (!Schema::hasColumn('payments', 'refund_processed_by')) {
                $table->foreignId('refund_processed_by')->nullable()->constrained('users')->after('refund_reason');
            }

            if (!Schema::hasColumn('payments', 'refund_processed_at')) {
                $table->timestamp('refund_processed_at')->nullable()->after('refund_processed_by');
            }

            if (!Schema::hasColumn('payments', 'status_updated_by')) {
                $table->foreignId('status_updated_by')->nullable()->constrained('users')->after('refund_processed_at');
            }

            if (!Schema::hasColumn('payments', 'status_updated_at')) {
                $table->timestamp('status_updated_at')->nullable()->after('status_updated_by');
            }

            if (!Schema::hasColumn('payments', 'deleted_at')) {
                $table->softDeletes()->after('updated_at');
            }
        });

        // Add indexes only if they don't exist
        $indexes = DB::select("SELECT indexname FROM pg_indexes WHERE tablename = 'payments'");
        $existingIndexes = collect($indexes)->pluck('indexname')->toArray();

        Schema::table('payments', function (Blueprint $table) use ($existingIndexes) {
            if (!in_array('payments_order_id_index', $existingIndexes) && Schema::hasColumn('payments', 'order_id')) {
                $table->index('order_id');
            }

            if (!in_array('payments_transaction_id_index', $existingIndexes) && Schema::hasColumn('payments', 'transaction_id')) {
                $table->index('transaction_id');
            }

            if (!in_array('payments_status_index', $existingIndexes)) {
                $table->index('status');
            }

            if (!in_array('payments_transaction_status_index', $existingIndexes)) {
                $table->index('transaction_status');
            }
        });
    }

    public function down()
    {
        Schema::table('payments', function (Blueprint $table) {
            // Only drop columns/indexes that exist
            $columns = Schema::getColumnListing('payments');

            if (in_array('deleted_at', $columns)) {
                $table->dropSoftDeletes();
            }

            // Drop indexes if they exist
            $indexes = DB::select("SELECT indexname FROM pg_indexes WHERE tablename = 'payments'");
            $existingIndexes = collect($indexes)->pluck('indexname')->toArray();

            if (in_array('payments_status_updated_at_index', $existingIndexes)) {
                $table->dropIndex(['status_updated_at']);
            }
            if (in_array('payments_transaction_status_index', $existingIndexes)) {
                $table->dropIndex(['transaction_status']);
            }
            if (in_array('payments_status_index', $existingIndexes)) {
                $table->dropIndex(['status']);
            }
            if (in_array('payments_transaction_id_index', $existingIndexes)) {
                $table->dropIndex(['transaction_id']);
            }
            if (in_array('payments_order_id_index', $existingIndexes)) {
                $table->dropIndex(['order_id']);
            }

            // Drop foreign keys if they exist
            if (in_array('status_updated_by', $columns)) {
                $table->dropForeign(['status_updated_by']);
            }
            if (in_array('refund_processed_by', $columns)) {
                $table->dropForeign(['refund_processed_by']);
            }

            // Drop columns if they exist
            $columnsToRemove = [
                'invoice_number',
                'order_id',
                'transaction_id',
                'payment_channel',
                'description',
                'paid_at',
                'expires_at',
                'admin_notes',
                'refund_amount',
                'refund_reason',
                'refund_processed_by',
                'refund_processed_at',
                'status_updated_by',
                'status_updated_at'
            ];

            $existingColumns = array_intersect($columnsToRemove, $columns);
            if (!empty($existingColumns)) {
                $table->dropColumn($existingColumns);
            }
        });
    }
};
