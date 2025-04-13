<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
class Child extends Model
{
  /** @use HasFactory<\Database\Factories\ChildFactory> */
  use HasFactory;

  protected $fillable = ['user_id', 'name', 'pin_hash', 'token_balance', 'avatar', 'color'];
  protected $hidden = ['pin_hash'];

  // Relationships
  public function parent(): BelongsTo
  {
    return $this->belongsTo(User::class, 'user_id');
  }
  public function taskAssignments(): HasMany
  {
    return $this->hasMany(TaskAssignment::class);
  }
  public function purchases(): HasMany
  {
    return $this->hasMany(Purchase::class);
  }
  public function tokenTransactions(): HasMany
  {
    return $this->hasMany(TokenTransaction::class);
  }
  public function taskPauses(): HasMany
  {
    return $this->hasMany(TaskPause::class);
  }
  public function streaks(): HasMany
  {
    return $this->hasMany(Streak::class);
  }

  public function tasks(): BelongsToMany
  {
    return $this->belongsToMany(Task::class)
      ->withPivot('token_reward') // Make the extra pivot column accessible
      ->withTimestamps(); // If your pivot table has timestamps
  }

  // Token management methods
  public function addTokens(int $amount, string $type, ?Model $related = null, ?string $description = null): bool
  {
    if ($amount <= 0) {
      return false;
    }
    return DB::transaction(function () use ($amount, $type, $related, $description) {
      $this->increment('token_balance', $amount);
      $this->tokenTransactions()->create(
        array_filter([
          'amount' => $amount,
          'type' => $type,
          'description' => $description,
          'timestamp' => now(),
          'related_id' => optional($related)->getKey(),
          'related_type' => optional($related)->getMorphClass(),
        ]),
      );
      return true;
    });
  }

  public function deductTokens(int $amount, string $type, ?Model $related = null, ?string $description = null, bool $checkBalance = true): bool
  {
    if ($amount <= 0) {
      return false;
    }
    if ($checkBalance && $this->token_balance < $amount) {
      return false;
    }
    return DB::transaction(function () use ($amount, $type, $related, $description) {
      $this->decrement('token_balance', $amount);
      $this->tokenTransactions()->create(
        array_filter([
          'amount' => -$amount,
          'type' => $type,
          'description' => $description,
          'timestamp' => now(),
          'related_id' => optional($related)->getKey(),
          'related_type' => optional($related)->getMorphClass(),
        ]),
      );
      return true;
    });
  }
}
