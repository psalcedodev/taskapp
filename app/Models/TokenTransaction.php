<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
// use App\Enums\TokenTransactionType; // If using native PHP Enum

class TokenTransaction extends Model
{
    use HasFactory;
    public $timestamps = false; // Uses manual 'timestamp' field
    protected $fillable = ['child_id', 'amount', 'type', 'related_type', 'related_id', 'description', 'timestamp'];
    protected function casts(): array
    {
        return ['timestamp' => 'datetime' /* 'type' => TokenTransactionType::class */];
    }
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }
    public function related(): MorphTo
    {
        return $this->morphTo();
    }
    /* Enum values: 'challenge_completion', 'purchase', 'revert', 'manual_adjustment', 'streak_bonus' */
}
