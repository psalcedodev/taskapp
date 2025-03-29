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
        Schema::create('streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->enum('type', ['daily_quest', 'weekly_quest'])->comment('Type of streak being tracked');
            $table->unsignedInteger('current_streak_count')->default(0);
            $table->unsignedInteger('longest_streak_count')->default(0);
            $table->date('last_streak_date')->nullable()->comment('The last date this streak was successfully updated');
            $table->timestamps();

            $table->unique(['child_id', 'type']);
            $table->index('last_streak_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('streaks');
    }
};
