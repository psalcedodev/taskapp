<?php

namespace App\Services;

use App\Models\User;
use App\Models\TaskAssignment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class TaskAssignmentGenerator
{
  /**
   * Generate task assignments for a user and date (if not already present).
   *
   * @param User $user
   * @param Carbon|string $date (date string or Carbon instance)
   * @return array [created => int, skipped => int]
   */
  public function generateForUserAndDate(User $user, $date): array
  {
    $date = $date instanceof Carbon ? $date : Carbon::parse($date);
    $created = 0;
    $skipped = 0;

    // Fetch active tasks for the user that should run on the date
    $tasks = $user->tasks()->activeInRange($date)->recurringOnDate($date)->with('children:id')->get();

    foreach ($tasks as $task) {
      foreach ($task->children as $child) {
        $exists = TaskAssignment::where('task_id', $task->id)->where('child_id', $child->id)->where('assigned_date', $date->toDateString())->exists();
        if ($exists) {
          $skipped++;
          continue;
        }
        TaskAssignment::create([
          'task_id' => $task->id,
          'child_id' => $child->id,
          'assigned_date' => $date->toDateString(),
          'due_date' => $task->available_to_time ? $date->copy()->setTimeFromTimeString($task->available_to_time) : $date->copy()->endOfDay(),
          'status' => 'in_progress',
          'assigned_token_amount' => $child->pivot->token_reward ?? 0,
          'completed_at' => null,
          'approved_at' => null,
          'notes' => null,
          'collaborative_instance_id' => null,
        ]);
        $created++;
      }
    }
    Log::info("On-demand assignment generation for user {$user->id} on {$date->toDateString()}: created {$created}, skipped {$skipped}");
    return ['created' => $created, 'skipped' => $skipped];
  }
}
