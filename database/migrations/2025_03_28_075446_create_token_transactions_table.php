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
    Schema::create('token_transactions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
      $table->integer('amount');
      // UPDATED types for this simplified model
      $table->enum('type', ['challenge_completion', 'routine_completion', 'purchase', 'revert', 'manual_adjustment', 'streak_bonus']);
      $table->nullableMorphs('related');
      $table->string('description')->nullable();
      $table->timestamp('timestamp')->useCurrent();
      $table->index('child_id');
      $table->index('type');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('token_transactions');
  }
};
