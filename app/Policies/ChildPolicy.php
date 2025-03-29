<?php

namespace App\Policies;

use App\Models\Child;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ChildPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Any authenticated user can view their own list of children (controller filters)
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Child $child): bool
    {
        // User can view the child if they are the parent
        return $user->id === $child->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create a child for themselves
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Child $child): bool
    {
        // User can update the child if they are the parent
        return $user->id === $child->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Child $child): bool
    {
        // User can delete the child if they are the parent
        return $user->id === $child->user_id;
    }

    /**
     * Determine whether the user can restore the model. (If using Soft Deletes)
     */
    // public function restore(User $user, Child $child): bool { ... }

    /**
     * Determine whether the user can permanently delete the model. (If using Soft Deletes)
     */
    // public function forceDelete(User $user, Child $child): bool { ... }
}
