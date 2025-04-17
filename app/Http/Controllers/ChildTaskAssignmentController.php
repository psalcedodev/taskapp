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

      // Determine the success message based on the final status
      $successMessage = $finalStatus === 'pending_approval' ? 'Task submitted for approval.' : 'Task marked as complete.';

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
   * Display a listing of the resource. (Optional - if needed)
   */
  public function index(Child $child)
  {
    abort(501, 'Not Implemented');
  }
}
