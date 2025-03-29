<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class TaskAssignment extends Model
{
    /** @use HasFactory<\Database\Factories\TaskAssignmentFactory> */
    use HasFactory;

    protected $fillable = [
        'task_id',
        'child_id',
        'assigned_date',
        'due_date',
        'assigned_token_amount',
        'status',
        'completed_at',
        'approved_at',
        'notes',
        'collaborative_instance_id',
    ];

    protected function casts(): array
    {
        return [
            'assigned_date' => 'date',
            'due_date' => 'datetime',
            'completed_at' => 'datetime',
            'approved_at' => 'datetime',
            // 'status' => TaskAssignmentStatus::class, // Native enum cast
        ];
    }

    // Relationships
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }
    public function tokenTransactions(): MorphMany
    {
        return $this->morphMany(TokenTransaction::class, 'related');
    } // For Challenge rewards

    // Scopes
    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }
    public function scopePendingApproval(Builder $query): Builder
    {
        return $query->where('status', 'pending_approval');
    }
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }
    public function scopeForDate(Builder $query, Carbon $date): Builder
    {
        return $query->whereDate('assigned_date', $date);
    }
    public function scopeOfType(Builder $query, string $taskType): Builder
    {
        return $query->whereHas('task', fn(Builder $q) => $q->where('type', $taskType));
    }
}
