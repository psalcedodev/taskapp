<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
  /**
   * Determine whether the user can view any models.
   */
  public function viewAny(User $user): bool
  {
    // Allow only authenticated users to view any tasks
    return $user->exists();
  }

  /**
   * Determine whether the user can view the model.
   */
  public function view(User $user, Task $task): bool
  {
    // Allow viewing only if the task's user_id matches the logged-in user's ID
    return $task->user_id === $user->id;
  }

  /**
   * Determine whether the user can create models.
   */
  public function create(User $user): bool
  {
    // Allow only authenticated users to create tasks
    return $user->exists();
  }

  /**
   * Determine whether the user can update the model.
   */
  public function update(User $user, Task $task): bool
  {
    // Allow updating only if the task's user_id matches the logged-in user's ID
    return $task->user_id === $user->id;
  }

  /**
   * Determine whether the user can delete the model.
   */
  public function delete(User $user, Task $task): bool
  {
    // Allow deleting only if the task's user_id matches the logged-in user's ID
    return $task->user_id === $user->id;
  }

  /**
   * Determine whether the user can restore the model.
   */
  public function restore(User $user, Task $task): bool
  {
    // Allow restoring only if the task's user_id matches the logged-in user's ID
    return $task->user_id === $user->id;
  }

  /**
   * Determine whether the user can permanently delete the model.
   */
  public function forceDelete(User $user, Task $task): bool
  {
    // Allow force deleting only if the task's user_id matches the logged-in user's ID
    return $task->user_id === $user->id;
  }
}
