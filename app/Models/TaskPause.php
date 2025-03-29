<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class TaskPause extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'task_id', 'child_id', 'pause_start_date', 'pause_end_date', 'reason'];
    protected function casts(): array
    {
        return ['pause_start_date' => 'date', 'pause_end_date' => 'date'];
    }
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    } // Nullable
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    } // Nullable

    // Scope to check for active pauses
    public function scopeIsActiveFor(Builder $query, Carbon $date, ?int $taskId, ?int $childId): Builder
    {
        return $query
            ->where('pause_start_date', '<=', $date->format('Y-m-d'))
            ->where('pause_end_date', '>=', $date->format('Y-m-d'))
            ->where(function (Builder $q) use ($taskId, $childId) {
                $q->where(fn(Builder $q1) => $q1->where('task_id', $taskId)->where('child_id', $childId)) // Task+Child specific
                    ->orWhere(fn(Builder $q2) => $q2->where('task_id', $taskId)->whereNull('child_id')) // Task specific (all children)
                    ->orWhere(fn(Builder $q3) => $q3->whereNull('task_id')->where('child_id', $childId)) // Child specific (all tasks)
                    ->orWhere(fn(Builder $q4) => $q4->whereNull('task_id')->whereNull('child_id')); // Global
            });
        // NOTE: The calling service needs to check if ->exists() for ANY pause rule matching.
    }
}
