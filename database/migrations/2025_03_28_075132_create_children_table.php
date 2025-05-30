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
    Schema::create('children', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->comment('Parent User ID')->constrained('users')->onDelete('cascade');
      $table->string('name');
      $table->string('pin_hash')->comment('Hashed PIN for shop access');
      $table->integer('token_balance')->default(0);
      $table->string('avatar')->nullable()->comment('Path or identifier for avatar image');
      $table->string('color')->nullable();
      $table->timestamps();
      $table->index('user_id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('children');
  }
};
