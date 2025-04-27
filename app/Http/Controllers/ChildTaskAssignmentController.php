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
use Illuminate\Validation\Rule;

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
    $taskIds = $validatedData['task_ids'];
    $childIds = $validatedData['child_ids'];
    $assignedDate = Carbon::today(); // Mark completion for today

    try {
      // Basic authorization: Ensure all child IDs belong to the authenticated user
      $childrenCount = Child::whereIn('id', $childIds)->where('user_id', $user->id)->count();
      if ($childrenCount !== count($childIds)) {
        return response()->json(['message' => 'Invalid child ID provided.'], 403);
      }

      // Basic authorization: Ensure all tasks exist and belong to the authenticated user
      $tasksCount = Task::whereIn('id', $taskIds)->where('user_id', $user->id)->count();
      if ($tasksCount !== count($taskIds)) {
        return response()->json(['message' => 'Invalid task ID provided.'], 403);
      }

      // Fetch tasks to check 'needs_approval'
      $tasks = Task::whereIn('id', $taskIds)->get();

      $results = [];
      foreach ($tasks as $task) {
        $status = $this->taskCompletionService->completeTaskAssignments($task, $childIds, $assignedDate);
        $results[$task->id] = $status;
      }

      return response()->json(['message' => 'Tasks marked successfully!', 'results' => $results]);
    } catch (TaskAssignmentConflictException $e) {
      return response()->json(['message' => $e->getMessage()], 409); // 409 Conflict
    } catch (\Exception $e) {
      Log::error('Error marking tasks complete:', ['exception' => $e]);
      return response()->json(['message' => 'An error occurred while marking tasks.'], 500);
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
