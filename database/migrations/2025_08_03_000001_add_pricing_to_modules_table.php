<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->default(0)->after('description');
            $table->boolean('is_free')->default(true)->after('price');
            $table->integer('coin_cost')->default(0)->after('is_free');
        });
    }

    public function down()
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn(['price', 'is_free', 'coin_cost']);
        });
    }
};
