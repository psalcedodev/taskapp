<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShopItem extends Model
{
  use HasFactory;
  protected $fillable = [
    'user_id',
    'name',
    'description',
    'image_path',
    'token_cost',
    'stock',
    'needs_approval',
    'is_limited_time',
    'available_from',
    'available_until',
    'is_active',
  ];
  protected function casts(): array
  {
    return [
      'needs_approval' => 'boolean',
      'is_limited_time' => 'boolean',
      'is_active' => 'boolean',
      'available_from' => 'datetime',
      'available_until' => 'datetime',
    ];
  }
  public function parent(): BelongsTo
  {
    return $this->belongsTo(User::class, 'user_id');
  }
  public function purchases(): HasMany
  {
    return $this->hasMany(Purchase::class);
  }
  public function scopeActive(Builder $query): Builder
  {
    return $query->where('is_active', true);
  }
  public function scopeAvailable(Builder $query, Carbon $now = null): Builder
  {
    $now = $now ?? now();
    return $query->where('is_active', true)->where(function (Builder $q) use ($now) {
      $q->where('is_limited_time', false)->orWhere(function (Builder $q2) use ($now) {
        $q2
          ->where('is_limited_time', true)
          ->where(fn(Builder $q3) => $q3->whereNull('available_from')->orWhere('available_from', '<=', $now))
          ->where(fn(Builder $q4) => $q4->whereNull('available_until')->orWhere('available_until', '>=', $now));
      });
    });
  }
}
