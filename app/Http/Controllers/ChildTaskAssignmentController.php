<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Task;
use App\Models\TaskAssignment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // Import DB facade
use Illuminate\Validation\Rule; // Import Rule for validation
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ChildTaskAssignmentController extends Controller
{
  /**
   * Mark task assignments as complete for TODAY based on request data.
   * Handles both collaborative and non-collaborative tasks.
   * Expects 'task_id' and 'child_ids' (array) in the request body.
   *
   * @param Request $request
   * @return JsonResponse
   */
  public function markComplete(Request $request): JsonResponse
  {
    $validated = $request->validate([
      'task_id' => ['required', 'integer', Rule::exists('tasks', 'id')],
      'child_ids' => ['required', 'array'],
      'child_ids.*' => ['integer', Rule::exists('children', 'id')], // Validate each ID in the array
    ]);

    $taskId = $validated['task_id'];
    $childIds = $validated['child_ids'];
    $user = Auth::user();
    $assignedDate = Carbon::today();

    // Fetch the task and authorize
    $task = Task::findOrFail($taskId);
    if ($task->user_id !== $user->id) {
      abort(403, 'Unauthorized action (task).');
    }

    // Authorize all children belong to the user
    $childrenCount = Child::whereIn('id', $childIds)->where('user_id', $user->id)->count();
    if ($childrenCount !== count($childIds)) {
      abort(403, 'Unauthorized action (child).');
    }

    // --- Main Logic within Transaction ---
    return DB::transaction(function () use ($task, $childIds, $assignedDate, $user) {
      $newStatus = $task->needs_approval ? 'pending_approval' : 'completed';
      $completionTime = now();
      $updatedAssignments = collect();

      // Fetch existing assignments for today for the given task and children
      $existingAssignments = TaskAssignment::where('task_id', $task->id)
        ->where('assigned_date', $assignedDate)
        ->whereIn('child_id', $childIds)
        ->get()
        ->keyBy('child_id'); // Key by child_id for easy access

      // Check for conflicts (already submitted/approved)
      $alreadySubmitted = $existingAssignments->contains(function ($assignment) {
        return in_array($assignment->status, ['approved', 'pending_approval']);
      });

      // --- Logging Point 1: Check for Conflict Exit ---
      Log::info(
        "MarkComplete: Task {$task->id}, Children " . implode(', ', $childIds) . '. Already Submitted? ' . ($alreadySubmitted ? 'Yes' : 'No'),
      );

      if ($alreadySubmitted) {
        // If any are already submitted/approved, return conflict
        // Consider returning the current state if helpful for frontend
        return response()->json(['message' => 'One or more assignments are already submitted or approved.'], 409);
      }

      // Fetch pivot data for all relevant children at once
      $pivotData = $task->children()->whereIn('child_task.child_id', $childIds)->get()->keyBy('id'); // Key by child_id

      // Loop through the child IDs provided in the request
      foreach ($childIds as $childId) {
        $childPivot = $pivotData->get($childId);
        $tokenReward = $childPivot?->pivot?->token_reward ?? 0;

        // Use updateOrCreate to handle existing 'pending' or create new
        // --- Logging Point 2: Before Update/Create ---
        Log::info(
          "MarkComplete: Updating/Creating for Child {$childId}, Task {$task->id}. New Status: {$newStatus}, Completed At: {$completionTime}",
        );

        $assignment = TaskAssignment::updateOrCreate(
          [
            // Conditions to find
            'task_id' => $task->id,
            'child_id' => $childId,
            'assigned_date' => $assignedDate,
          ],
          [
            // Values to set/update
            'assigned_token_amount' => $tokenReward,
            'due_date' => $assignedDate->copy()->endOfDay(),
            'status' => $newStatus,
            'completed_at' => $completionTime,
          ],
        );

        // --- Logging Point 3: After Update/Create ---
        Log::info("MarkComplete: Result for Child {$childId}, Task {$task->id}", [
          'assignment_id' => $assignment->id,
          'status' => $assignment->status,
          'completed_at' => $assignment->completed_at,
        ]);

        // Award tokens ONLY if the status is 'completed'
        if ($newStatus === 'completed' && $tokenReward > 0) {
          // Fetch the Child model instance for addTokens
          $child = Child::find($childId); // Consider fetching all children outside loop if performance is critical
          if ($child) {
            $transactionType = match ($task->type) {
              'challenge' => 'challenge_completion',
              default => 'routine_completion',
            };
            $child->addTokens($tokenReward, $transactionType, $assignment, "Task completion reward ({$task->type})");
          }
        }
        $updatedAssignments->push($assignment->load(['task', 'child'])); // Load relations for response
      }

      // Return success with the updated assignment(s)
      return response()->json($updatedAssignments, 200);
    }); // End DB::transaction
  }

  /**
   * Display a listing of the resource. (Optional - if needed)
   */
  public function index(Child $child)
  {
    abort(501, 'Not Implemented');
  }
}
