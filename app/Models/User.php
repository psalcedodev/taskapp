<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = ['name', 'email', 'password'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = ['password', 'remember_token'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function children(): HasMany
    {
        return $this->hasMany(Child::class);
    }
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
    public function shopItems(): HasMany
    {
        return $this->hasMany(ShopItem::class);
    }
    // public function calendarEvents(): HasMany { return $this->hasMany(CalendarEvent::class); } // To Implement in the future
    public function taskPauses(): HasMany
    {
        return $this->hasMany(TaskPause::class);
    }
}
