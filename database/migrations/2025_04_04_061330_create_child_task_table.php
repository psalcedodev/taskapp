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
    Schema::create('child_task', function (Blueprint $table) {
      $table->foreignId('child_id')->constrained()->onDelete('cascade');
      $table->foreignId('task_id')->constrained()->onDelete('cascade');
      $table->unsignedInteger('token_reward')->default(0);
      $table->timestamps();
      $table->primary(['child_id', 'task_id']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('child_task');
  }
};
