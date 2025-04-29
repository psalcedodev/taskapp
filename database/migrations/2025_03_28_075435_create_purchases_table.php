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
    Schema::create('purchases', function (Blueprint $table) {
      $table->id();
      $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
      $table->foreignId('shop_item_id')->constrained('shop_items')->onDelete('cascade'); // Consider restrict
      $table->unsignedInteger('token_cost_at_purchase');
      $table->enum('status', ['pending_approval', 'approved', 'rejected', 'reverted']);
      $table->timestamp('requested_at')->useCurrent();
      $table->timestamp('processed_at')->nullable();
      $table->text('parent_notes')->nullable();
      $table->timestamps();
      $table->unsignedInteger('quantity')->default(1);
      $table->index('child_id');
      $table->index('shop_item_id');
      $table->index('status');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('purchases');
  }
};
