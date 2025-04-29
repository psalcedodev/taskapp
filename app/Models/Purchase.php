<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Builder;
// use App\Enums\PurchaseStatus; // If using native PHP Enum

class Purchase extends Model
{
  use HasFactory;
  protected $fillable = ['child_id', 'shop_item_id', 'token_cost_at_purchase', 'status', 'requested_at', 'processed_at', 'parent_notes', 'quantity'];
  protected function casts(): array
  {
    return ['requested_at' => 'datetime', 'processed_at' => 'datetime' /*'status' => PurchaseStatus::class */];
  }
  public function child(): BelongsTo
  {
    return $this->belongsTo(Child::class);
  }
  public function shopItem(): BelongsTo
  {
    return $this->belongsTo(ShopItem::class);
  }
  public function tokenTransactions(): MorphMany
  {
    return $this->morphMany(TokenTransaction::class, 'related');
  }
  public function scopeStatus(Builder $query, string $status): Builder
  {
    return $query->where('status', $status);
  }
  public function scopePendingApproval(Builder $query): Builder
  {
    return $query->where('status', 'pending_approval');
  }
}
