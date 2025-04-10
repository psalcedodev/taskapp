<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('task_assignments', function (Blueprint $table) {
      $table->id();
      $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
      $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
      $table->date('assigned_date');
      $table->dateTime('due_date')->nullable();
      $table->unsignedInteger('assigned_token_amount')->default(0)->comment('Mainly for challenges, quests=0 (unless tiny reward added later)');
      $table->enum('status', ['pending', 'completed', 'pending_approval', 'approved', 'rejected'])->default('pending');
      $table->timestamp('completed_at')->nullable();
      $table->timestamp('approved_at')->nullable();
      $table->text('notes')->nullable();
      $table->uuid('collaborative_instance_id')->nullable();
      $table->timestamps();

      // Indexes
      $table->index('child_id');
      $table->index('task_id');
      $table->index('assigned_date');
      $table->index('status');
      $table->index('collaborative_instance_id');
      $table->unique(['task_id', 'child_id', 'assigned_date', 'collaborative_instance_id'], 'task_child_date_collab_unique');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('task_assignments');
  }
};
