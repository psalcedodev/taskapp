<?php

namespace App\Policies;

use App\Models\TaskAssignment;
use App\Models\User;
use App\Models\Child; // Import Child
use Illuminate\Auth\Access\Response;

class TaskAssignmentPolicy
{
    /**
     * Determine whether the user can view any models.
     * Used potentially in parent views.
     */
    public function viewAny(User $user): bool
    {
        // Parent can view assignments related to their children
        return true; // Controller should filter by user's children
    }

    /**
     * Determine whether the user can view the model.
     * Parent can view assignments belonging to their children.
     */
    public function view(User $user, TaskAssignment $taskAssignment): bool
    {
        // Check if the assignment's child belongs to the user
        return $user->id === $taskAssignment->child->user_id;
    }

    /**
     * Determine whether the user can create models.
     * Assignments are typically created by the system (cron job).
     */
    public function create(User $user): bool
    {
        return false; // Generally false for direct user creation
    }

    /**
     * Determine whether the user (Parent) can update (approve/reject) the model.
     * This will be used by the parent's approval controller.
     */
    public function update(User $user, TaskAssignment $taskAssignment): bool
    {
        // Check if the assignment's child belongs to the user
        return $user->id === $taskAssignment->child->user_id;
    }

    /**
     * Determine whether the user (Child context via Parent auth) can mark complete.
     * This logic is complex here, better handled in Request/Controller as done above.
     * However, you could add a specific policy method if preferred.
     */
    // public function markComplete(User $user, TaskAssignment $taskAssignment): bool
    // {
    //    // Logic to check if $user owns the child associated with $taskAssignment,
    //    // check status, check time window etc. Requires child context usually.
    // }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TaskAssignment $taskAssignment): bool
    {
        // Can parents delete assignments? Maybe only if pending?
        return $user->id === $taskAssignment->child->user_id; // Basic ownership check
    }

    // ... restore / forceDelete if using soft deletes ...
}
