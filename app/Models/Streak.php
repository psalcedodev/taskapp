<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;
// use App\Enums\StreakType; // If using native PHP Enum

class Streak extends Model
{
    use HasFactory;
    protected $fillable = ['child_id', 'type', 'current_streak_count', 'longest_streak_count', 'last_streak_date'];
    protected function casts(): array
    {
        return ['last_streak_date' => 'date' /* 'type' => StreakType::class */];
    }
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }
    /* Streak update logic is complex and best handled in a Service Class/Action */
}
