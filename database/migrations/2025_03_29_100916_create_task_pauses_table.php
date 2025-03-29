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
        Schema::create('task_pauses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->comment('Parent User ID')->constrained('users')->onDelete('cascade');
            $table->foreignId('task_id')->nullable()->constrained('tasks')->onDelete('cascade');
            $table->foreignId('child_id')->nullable()->constrained('children')->onDelete('cascade');
            $table->date('pause_start_date');
            $table->date('pause_end_date');
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('task_id');
            $table->index('child_id');
            $table->index(['pause_start_date', 'pause_end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_pauses');
    }
};
