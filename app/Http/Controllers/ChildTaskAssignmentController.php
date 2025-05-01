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
    $user = Auth::user();
    $validatedData = $request->validated();
    $taskId = $validatedData['task_id'];
    $childIds = $validatedData['child_ids'];
    $assignedDate = Carbon::today();

    try {
      // Ensure all child IDs belong to the authenticated user
      $childrenCount = Child::whereIn('id', $childIds)->where('user_id', $user->id)->count();
      if ($childrenCount !== count($childIds)) {
        return response()->json(['message' => 'Invalid child ID provided.'], 403);
      }

      // Ensure the task exists and belongs to the authenticated user
      $task = Task::where('id', $taskId)->where('user_id', $user->id)->first();
      if (!$task) {
        return response()->json(['message' => 'Invalid task ID provided.'], 403);
      }

      // Mark as complete
      $status = $this->taskCompletionService->completeTaskAssignments($task, $childIds, $assignedDate);

      return response()->json(['message' => 'Task marked successfully!', 'results' => $status]);
    } catch (TaskAssignmentConflictException $e) {
      return response()->json(['message' => $e->getMessage()], 409);
    } catch (\Exception $e) {
      Log::error('Error marking task complete:', ['exception' => $e]);
      return response()->json(['message' => 'An error occurred while marking the task.'], 500);
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
    Log::info('Updating task assignment status', ['assignment_id' => $assignment->id]);
    $user = Auth::user();
    $validated = $request->validate([
      'status' => ['required', 'string', 'in:approved,rejected'],
    ]);
    $newStatus = $validated['status'];

    // --- Authorization ---
    // 1. Ensure the assignment exists and wasn't soft deleted (handled by route model binding)
    // 2. Ensure the logged-in user is the parent of the child the assignment belongs to.
    // Eager load child with user relationship for efficiency
    $assignment->load(['child', 'task']);
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
            $transactionType = match ($assignment->task->type) {
              'challenge' => 'challenge_completion',
              default => 'routine_completion',
            };

            $assignment->child->addTokens(
              $assignment->assigned_token_amount,
              $transactionType,
              $assignment,
              "Task completion reward ({$assignment->task->title})",
            );

            $message .= " Awarded {$assignment->assigned_token_amount} tokens.";
          }
        } else {
          // rejected
          $assignment->approved_at = null; // Ensure approved_at is null if rejected
          $message = 'Task rejected.';
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

  // Method to list pending approvals for the authenticated family head
  public function listPendingFamilyApprovals(Request $request)
  {
    // Example placeholder (replace with actual logic):
    $user = $request->user();
    // Remove the incorrect family_id check. Authorization is handled by the query.
    // if (!$user->family_id) {
    //     // Example check, adjust as needed
    //     return response()->json(['message' => 'User not associated with a family.'], 403);
    // }

    // Fetch assignments needing approval for children linked to this family head
    $pendingApprovals = TaskAssignment::whereHas('child', function ($query) use ($user) {
      $query->where('user_id', $user->id); // Assuming Child model has user_id linking to parent
    })
      ->where('status', 'pending_approval') // Assuming this status
      ->with(['child:id,name', 'task:id,title']) // Load necessary relations (task, not taskDefinition)
      ->orderBy('completed_at', 'asc')
      ->get();

    // Format the data to match the frontend expectation (PendingApproval interface)
    $formattedApprovals = $pendingApprovals->map(function ($assignment) {
      return [
        'assignment_id' => $assignment->id,
        'child_name' => $assignment->child->name,
        'task_title' => $assignment->task->title, // Use task relationship
        'completed_at' => $assignment->completed_at->toISOString(), // Format date
      ];
    });

    return response()->json(['data' => $formattedApprovals]);
  }
}
