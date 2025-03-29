<?php

namespace App\Policies;

use App\Models\TaskPause;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPausePolicy
{
    private function userOwnsPause(User $user, TaskPause $taskPause): bool
    {
        return $user->id === $taskPause->user_id;
    }

    public function viewAny(User $user): bool
    {
        return true;
    } // Controller filters
    public function view(User $user, TaskPause $taskPause): bool
    {
        return $this->userOwnsPause($user, $taskPause);
    }
    public function create(User $user): bool
    {
        return true;
    }
    public function update(User $user, TaskPause $taskPause): bool
    {
        return $this->userOwnsPause($user, $taskPause);
    }
    public function delete(User $user, TaskPause $taskPause): bool
    {
        return $this->userOwnsPause($user, $taskPause);
    }
    // ... restore / forceDelete ...
}
