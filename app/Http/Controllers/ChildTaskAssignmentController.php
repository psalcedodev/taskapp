<?php

namespace App\Http\Controllers;

use App\Http\Requests\MarkTaskCompleteRequest;
use App\Services\TaskCompletionService;
use App\Exceptions\TaskAssignmentConflictException;
use App\Models\Child;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\TaskAssignment;
use Illuminate\Support\Facades\DB;

class ChildTaskAssignmentController extends Controller
{
  protected TaskCompletionService $taskCompletionService;

  public function __construct(TaskCompletionService $taskCompletionService)
  {
    $this->taskCompletionService = $taskCompletionService;
  }

  /**
   * Mark task assignments as complete for TODAY based on request data.
   * Delegates core logic to TaskCompletionService.
   *
   * @param MarkTaskCompleteRequest $request
   * @return JsonResponse
   */
  public function markComplete(MarkTaskCompleteRequest $request): JsonResponse
  {
    $validated = $request->validated();

    $taskId = $validated['task_id'];
    $childIds = $validated['child_ids'];
    $user = Auth::user();
    $assignedDate = Carbon::today();

    // Fetch the task
    $task = Task::findOrFail($taskId);

    // Authorize Task ownership (Child ownership checked in FormRequest)
    if ($task->user_id !== $user->id) {
      abort(403, 'Unauthorized action (task).');
    }

    try {
      // Delegate the core logic to the service
      $finalStatus = $this->taskCompletionService->completeTaskAssignments($task, $childIds, $assignedDate);
      // Determine the success message based on the final status and number of children/rewards
      if ($finalStatus === 'pending_approval') {
        $successMessage = 'Waiting for parent approval! 👀';
      } elseif (count($childIds) === 1 && $task->children->first()->pivot->token_reward > 0) {
        // Use reward amount only if a single child assignment was completed and there's a reward
        $successMessage = "You did it and earned {$task->children->first()->pivot->token_reward} tokens! 🎉";
      } else {
        // Generic message for multiple children, no reward, or other completed statuses
        $successMessage = 'Task marked as complete! 🎉';
      }

      // Return success with the appropriate message and the status
      return response()->json(['message' => $successMessage, 'status' => $finalStatus], 200);
    } catch (TaskAssignmentConflictException $e) {
      // Handle the specific conflict case
      return response()->json(['message' => $e->getMessage()], 409); // 409 Conflict
    } catch (\Exception $e) {
      // Handle other potential errors during the process
      Log::error('Error in markComplete:', ['exception' => $e]);
      return response()->json(['message' => 'An unexpected error occurred.'], 500);
    }
  }

  /**
   * Update the status of a specific TaskAssignment (Approve/Reject).
   *
   * @param Request $request
   * @param TaskAssignment $assignment
   * @return JsonResponse
   */
  public function updateStatus(Request $request, TaskAssignment $assignment): JsonResponse
  {
    $user = Auth::user();
    $validated = $request->validate([
      'status' => ['required', 'string', 'in:approved,rejected'],
    ]);
    $newStatus = $validated['status'];

    // --- Authorization ---
    // 1. Ensure the assignment exists and wasn't soft deleted (handled by route model binding)
    // 2. Ensure the logged-in user is the parent of the child the assignment belongs to.
    // Eager load child with user relationship for efficiency
    $assignment->load('child.user');
    if (!$assignment->child || $assignment->child->user_id !== $user->id) {
      abort(403, 'Unauthorized action.');
    }

    // 3. Ensure the task is actually pending approval
    if ($assignment->status !== 'pending_approval') {
      return response()->json(['message' => 'Task is not pending approval.'], 409); // Conflict
    }

    // --- Update Logic ---
    try {
      // Use a transaction in case token awarding fails
      return DB::transaction(function () use ($assignment, $newStatus, $user) {
        $assignment->status = $newStatus;
        $message = '';

        if ($newStatus === 'approved') {
          $assignment->approved_at = now();
          $message = 'Task approved!';

          // Award tokens if applicable
          if ($assignment->assigned_token_amount > 0) {
            // Ideally, use a service for this logic
            $this->taskCompletionService->awardTokens($assignment->child, $assignment->assigned_token_amount, $assignment);
            $message .= " Awarded {$assignment->assigned_token_amount} tokens.";
          }
        } else {
          // rejected
          $assignment->approved_at = null; // Ensure approved_at is null if rejected
          $message = 'Task rejected.';
          // Optionally, revert tokens if they were somehow awarded prematurely?
          // Or add logic to notify child?
        }

        $assignment->save();

        // Return success response
        return response()->json(['message' => $message, 'assignment' => $assignment->fresh()]); // Return updated assignment
      });
    } catch (\Exception $e) {
      Log::error('Error updating assignment status:', [
        'assignment_id' => $assignment->id,
        'exception' => $e,
      ]);
      return response()->json(['message' => 'An error occurred while updating the task status.'], 500);
    }
  }

  /**
   * Display a listing of the resource. (Optional - if needed)
   */
  public function index(Child $child)
  {
    abort(501, 'Not Implemented');
  }
}
