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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->comment('Parent User ID')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->unsignedInteger('token_amount')->default(0)->comment('Tokens awarded ONLY for type=challenge'); // Applies to Challenges
            $table->enum('type', ['quest', 'challenge'])->default('quest')->comment('Quest=Routine/Habit, Challenge=Extra Earning Task'); // UPDATED TYPE
            $table->boolean('needs_approval')->default(false);
            $table->boolean('is_collaborative')->default(false);
            $table->boolean('is_mandatory')->default(false);
            $table->enum('recurrence_type', ['none', 'daily', 'weekly', 'monthly', 'custom'])->default('none');
            $table->json('recurrence_days')->nullable();
            $table->date('start_date')->nullable();
            $table->date('recurrence_ends_on')->nullable();
            $table->time('available_from_time')->nullable();
            $table->time('available_to_time')->nullable();
            $table->time('completion_window_start')->nullable();
            $table->time('completion_window_end')->nullable();
            $table->unsignedInteger('suggested_duration_minutes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('type');
            $table->index('is_active');
            $table->index('is_mandatory');
            $table->index('recurrence_type');
            $table->index('start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
