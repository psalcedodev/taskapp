<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
  /** @use HasFactory<\Database\Factories\TaskFactory> */
  use HasFactory;

  protected $fillable = [
    'user_id',
    'title',
    'description',
    'image_path',
    'type', // 'quest' or 'challenge'
    'needs_approval',
    'is_collaborative',
    'is_mandatory',
    'recurrence_type',
    'recurrence_days',
    'start_date',
    'recurrence_ends_on',
    'available_from_time',
    'available_to_time',
    'completion_window_start',
    'completion_window_end',
    'suggested_duration_minutes',
    'is_active',
  ];

  protected function casts(): array
  {
    return [
      'needs_approval' => 'boolean',
      'is_collaborative' => 'boolean',
      'is_mandatory' => 'boolean',
      'is_active' => 'boolean',
      'recurrence_days' => 'collection',
      'start_date' => 'date',
      'recurrence_ends_on' => 'date',
      // 'type' => TaskType::class, // Native enum cast
      // 'recurrence_type' => RecurrenceType::class // Native enum cast
    ];
  }

  // Relationships
  public function parent(): BelongsTo
  {
    return $this->belongsTo(User::class, 'user_id');
  }
  public function assignments(): HasMany
  {
    return $this->hasMany(TaskAssignment::class);
  }
  public function pauses(): HasMany
  {
    return $this->hasMany(TaskPause::class);
  }

  public function children(): BelongsToMany
  {
    return $this->belongsToMany(Child::class)
      ->withPivot('token_reward') // Make the extra pivot column accessible
      ->withTimestamps(); // If your pivot table has timestamps
  }

  // Scopes
  public function scopeActive(Builder $query): Builder
  {
    return $query->where('is_active', true);
  }
  public function scopeMandatory(Builder $query): Builder
  {
    return $query->where('is_mandatory', true);
  }
  public function scopeRecurring(Builder $query): Builder
  {
    return $query->where('recurrence_type', '!=', 'none');
  }
  public function scopeCollaborative(Builder $query): Builder
  {
    return $query->where('is_collaborative', true);
  }
  public function scopeOfType(Builder $query, string $type): Builder
  {
    return $query->where('type', $type);
  }

  // Helper to check recurrence (basic version)
  public function runsOnDate(Carbon $date): bool
  {
    if ($this->recurrence_type === 'none') {
      return $this->start_date?->isSameDay($date) ?? false;
    }
    if ($this->start_date && $this->start_date->isAfter($date)) {
      return false;
    }
    if ($this->recurrence_ends_on && $this->recurrence_ends_on->isBefore($date)) {
      return false;
    }
    switch ($this->recurrence_type) {
      case 'daily':
        return true;
      case 'weekly':
        return $this->recurrence_days && $this->recurrence_days->contains($date->format('D')); // Assumes 'MON', 'TUE' etc
      case 'monthly':
        return $this->recurrence_days && $this->recurrence_days->contains($date->day); // Assumes day numbers [1, 15] etc
      case 'custom':
        return $this->recurrence_days && $this->recurrence_days->contains($date->format('D')); // Example: custom uses weekly days
      default:
        return false;
    }
    // NOTE: Full recurrence (intervals, specific weekdays of month) often needs a dedicated library/service
  }
}
