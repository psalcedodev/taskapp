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
        Schema::create('shop_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->comment('Parent User ID')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->unsignedInteger('token_cost');
            $table->boolean('needs_approval')->default(false);
            $table->boolean('is_limited_time')->default(false);
            $table->dateTime('available_from')->nullable();
            $table->dateTime('available_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('user_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_items');
    }
};
