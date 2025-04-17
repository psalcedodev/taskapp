<?php
namespace App\Services;

use App\Models\TaskAssignment;
use App\Models\Child;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log; // Keep Log if needed for debugging
use App\Exceptions\TaskAssignmentConflictException; // Define a custom exception
// Potentially inject other services like a StreakService

class TaskCompletionService
{
  // Maybe inject StreakService in constructor?
  // public function __construct(private StreakService $streakService) {}

  /**
   * Handles the logic for completing a task assignment.
   *
   * @param TaskAssignment $assignment
   * @param string|null $notes
   * @return TaskAssignment The updated assignment
   * @throws \App\Exceptions\TaskCompletionException // Custom exception for errors
   */
  public function completeAssignment(TaskAssignment $assignment, ?string $notes): TaskAssignment
  {
    // --- Authorization checks already done in Form Request ---

    // --- Core Logic ---
    \Illuminate\Support\Facades\DB::transaction(function () use ($assignment, $notes) {
      $assignment->status = $assignment->task->needs_approval ? 'pending_approval' : 'completed';
      $assignment->completed_at = now();
      $assignment->notes = $notes;
      $assignment->save();

      $child = $assignment->child; // Get the child model

      // Perform actions based on task type
      if ($assignment->task->type === 'challenge') {
        if ($assignment->status === 'completed' && $assignment->assigned_token_amount > 0) {
          // Award tokens directly if approved or no approval needed
          $child->addTokens(
            $assignment->assigned_token_amount,
            'challenge_completion',
            $assignment,
            "Completed challenge: {$assignment->task->title}",
          );
        }
        // If needs approval, tokens are awarded later by parent approval logic
      } elseif ($assignment->task->type === 'routine') {
        if ($assignment->status === 'completed' || $assignment->status === 'pending_approval') {
          // Check streak on completion/pending
          // Trigger streak update logic (could be another service call)
          // $this->streakService->updateDailyQuestStreak($child, $assignment->assigned_date);
          // $this->streakService->updateWeeklyQuestStreak($child, $assignment->assigned_date);
        }
        // Tokens are awarded via streak bonuses (handled by streak logic) or manual adjustments
      }
    }); // End transaction

    return $assignment->refresh(); // Return updated assignment
  }

  // Maybe add methods for handling parent approval which might award tokens for challenges
  // public function approveAssignment(TaskAssignment $assignment) { ... }

  /**
   * Marks task assignments as complete or pending approval.
   *
   * @param Task $task The task being completed.
   * @param array $childIds Array of child IDs to mark the assignment for.
   * @param Carbon $assignedDate The date for which the assignment is being marked.
   * @return string The final status ('completed' or 'pending_approval').
   * @throws TaskAssignmentConflictException If an assignment is already submitted/approved.
   */
  public function completeTaskAssignments(Task $task, array $childIds, Carbon $assignedDate): string
  {
    return DB::transaction(function () use ($task, $childIds, $assignedDate) {
      $newStatus = $task->needs_approval ? 'pending_approval' : 'completed';
      $completionTime = now();

      // Fetch existing assignments for today for the given task and children
      $existingAssignments = TaskAssignment::where('task_id', $task->id)
        ->where('assigned_date', $assignedDate)
        ->whereIn('child_id', $childIds)
        ->get();

      // Check for conflicts (already submitted/approved)
      $alreadySubmitted = $existingAssignments->contains(function ($assignment) {
        return in_array($assignment->status, ['approved', 'pending_approval']);
      });

      if ($alreadySubmitted) {
        Log::warning("TaskAssignmentConflict: Task {$task->id}, Children " . implode(', ', $childIds));
        throw new TaskAssignmentConflictException('One or more assignments are already submitted or approved.');
      }

      // Fetch pivot data for all relevant children at once
      $pivotData = $task->children()->whereIn('child_task.child_id', $childIds)->get()->keyBy('id');

      // Loop through the child IDs provided in the request
      foreach ($childIds as $childId) {
        $childPivot = $pivotData->get($childId);
        $tokenReward = $childPivot?->pivot?->token_reward ?? 0;

        $assignment = TaskAssignment::updateOrCreate(
          [
            'task_id' => $task->id,
            'child_id' => $childId,
            'assigned_date' => $assignedDate,
          ],
          [
            'assigned_token_amount' => $tokenReward,
            'due_date' => $assignedDate->copy()->endOfDay(),
            'status' => $newStatus,
            'completed_at' => $completionTime,
          ],
        );

        // Award tokens ONLY if the status is 'completed'
        if ($newStatus === 'completed' && $tokenReward > 0) {
          $child = Child::find($childId); // Find the child model instance
          if ($child) {
            $transactionType = match ($task->type) {
              'challenge' => 'challenge_completion',
              default => 'routine_completion',
            };
            $child->addTokens($tokenReward, $transactionType, $assignment, "Task completion reward ({$task->type})");
          }
        }
      }

      return $newStatus; // Return the final status
    });
  }
}

// Define the custom exception (could be in its own file in App/Exceptions)
namespace App\Exceptions;

use Exception;

class TaskAssignmentConflictException extends Exception {}
