<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse; // Keep for potential future use
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth; // Use Auth facade
use Illuminate\Support\Facades\Redirect; // Keep for potential future use
use Inertia\Inertia;
use Inertia\Response as InertiaResponse; // Alias Inertia Response
use App\Http\Resources\TaskResource;
use Carbon\Carbon; // Import Carbon for date handling
use App\Models\Child; // Import Child model
use App\Models\TaskAssignment; // Import TaskAssignment

class TaskController extends Controller
{
  /**
   * Display a listing of the tasks for the authenticated parent.
   * Renders the main Inertia page for tasks.
   *
   * @param Request $request
   * @return InertiaResponse
   */
  public function index(): InertiaResponse
  {
    return Inertia::render('parent/tasks/tasks_manager');
  }

  /**
   * List tasks for the authenticated user's family for today.
   * Merges projected tasks with actual assignment statuses for the current day.
   * For non-collaborative tasks, returns a separate task entry for each assigned child.
   * For collaborative tasks, returns a single entry with all assigned children.
   *
   * @param Request $request
   * @return JsonResponse
   */
  public function listFamilyTasks(Request $request): JsonResponse
  {
    $user = Auth::user();
    $targetDate = Carbon::today(); // Focus on today's status

    // 1. Fetch actual assignments for today, keyed for quick lookup
    $actualAssignments = TaskAssignment::where('assigned_date', $targetDate)
      ->whereIn('child_id', $user->children->pluck('id'))
      // ->with(['task', 'child']) // Optional: Eager load if needed elsewhere
      ->get()
      ->keyBy(function ($item) {
        // Create a unique key: task_id-child_id (assuming non-collaborative for key simplicity here)
        // For collaborative, status might need different handling
        return $item->task_id . '-' . $item->child_id;
      });

    // 2. Fetch active task definitions with their assigned children (pivot data)
    $tasks = $user
      ->tasks()
      ->where('is_active', true)
      ->with([
        'children' => function ($query) {
          $query->select('children.id', 'children.name', 'children.color', 'children.avatar');
        },
      ])
      // ->orderBy('created_at', 'desc') // Order might be less relevant now
      ->get();

    // 3. Use flatMap to generate the final list, merging actual status
    $transformedTasks = $tasks->flatMap(function ($task) use ($targetDate, $actualAssignments) {
      // Check if the task runs on the target date
      if (!$task->runsOnDate($targetDate)) {
        return []; // Skip if task doesn't run today
      }

      // Base task data conversion
      $baseTaskData = $task->toArray();
      unset($baseTaskData['children']);
      $baseTaskData['start_date'] = $task->start_date?->toDateString();
      $baseTaskData['recurrence_ends_on'] = $task->recurrence_ends_on?->toDateString();
      $baseTaskData['recurrence_days'] = $task->recurrence_days?->toArray() ?? [];
      $baseTaskData['available_from_time'] = $task->available_from_time ? Carbon::parse($task->available_from_time)->format('H:i') : null;
      $baseTaskData['available_to_time'] = $task->available_to_time ? Carbon::parse($task->available_to_time)->format('H:i') : null;

      if ($task->is_collaborative) {
        // --- Collaborative Task ---
        $allChildStatuses = []; // Store statuses of actual assignments for this task today
        $assignedToArray = $task->children->map(function ($child) use ($task, $actualAssignments, &$allChildStatuses) {
          $assignmentKey = $task->id . '-' . $child->id;
          $actual = $actualAssignments->get($assignmentKey);
          $status = $actual ? $actual->status : 'pending'; // Default to pending if no assignment exists yet
          $allChildStatuses[] = $status; // Collect the status

          return [
            'id' => $child->id, // Changed from child_id to id for consistency
            'name' => $child->name,
            'color' => $child->color,
            'avatar' => $child->avatar,
            'token_reward' => $child->pivot->token_reward,
            'status' => $status, // Use the determined status
            'completed_at' => $actual ? $actual->completed_at?->toIso8601String() : null,
            'approved_at' => $actual ? $actual->approved_at?->toIso8601String() : null,
            'assignment_id' => $actual ? $actual->id : null,
          ];
        });
        $baseTaskData['assigned_to'] = $assignedToArray;

        // Determine overall status for the collaborative task
        $totalChildrenAssigned = $task->children->count();
        $completedOrApprovedCount = collect($allChildStatuses)->filter(fn($s) => in_array($s, ['completed', 'approved']))->count();
        $pendingApprovalCount = collect($allChildStatuses)->filter(fn($s) => $s === 'pending_approval')->count();
        $anyInProgress = collect($allChildStatuses)->contains(fn($s) => !in_array($s, ['pending', 'completed', 'approved', 'pending_approval'])); // Check for any other status like 'rejected' or custom ones

        if ($pendingApprovalCount > 0) {
          $baseTaskData['status'] = 'pending_approval';
        } elseif ($totalChildrenAssigned > 0 && $completedOrApprovedCount === $totalChildrenAssigned) {
          // All assigned children have completed or been approved
          $baseTaskData['status'] = 'completed'; // Use 'completed' as the final state indicator
        } elseif ($completedOrApprovedCount > 0 || $anyInProgress) {
          // Some progress made, but not fully completed/approved by all, or other statuses exist
          $baseTaskData['status'] = 'in_progress';
        } else {
          // No assignments started, completed, or pending approval yet
          $baseTaskData['status'] = 'pending';
        }

        $baseTaskData['assignment_id'] = null; // No single assignment ID

        return [$baseTaskData];
      } else {
        // --- Non-Collaborative Task ---
        // Create a separate task entry for each assigned child
        return $task->children->map(function ($child) use ($baseTaskData, $task, $actualAssignments) {
          $assignmentKey = $task->id . '-' . $child->id;
          $actual = $actualAssignments->get($assignmentKey); // Find actual assignment

          // Create assigned_to with only the current child
          $assignedToArray = [
            [
              'id' => $child->id,
              'name' => $child->name,
              'color' => $child->color,
              'avatar' => $child->avatar,
              'token_reward' => $child->pivot->token_reward,
              // Status details are now top-level for this specific instance
            ],
          ];

          $childSpecificTaskData = $baseTaskData;
          $childSpecificTaskData['assigned_to'] = $assignedToArray;

          // Add top-level status details for this specific instance
          $childSpecificTaskData['status'] = $actual ? $actual->status : 'pending';
          $childSpecificTaskData['completed_at'] = $actual ? $actual->completed_at?->toIso8601String() : null;
          $childSpecificTaskData['approved_at'] = $actual ? $actual->approved_at?->toIso8601String() : null;
          $childSpecificTaskData['assignment_id'] = $actual ? $actual->id : null; // Include assignment ID if it exists

          return $childSpecificTaskData;
        });
      }
    });

    return response()->json($transformedTasks->values());
  }

  /**
   * Show the form for creating a new resource.
   * NOTE: In a modal-based workflow, this might be unused or could
   * return JSON data needed to initialize the create modal form.
   *
   * @return void | JsonResponse | InertiaResponse
   */
  public function create()
  {
    // Option 1: Not used if modal is self-contained in React
    // Option 2: Return JSON needed for the modal
    // return response()->json(['children' => Auth::user()->children()->select('id', 'name')->get()]);
    // Option 3: Render a dedicated Inertia page (if you decide to have one later)
    // return Inertia::render('Tasks/Create');
    abort(404); // Or return appropriate response if unused
  }

  /**
   * Store a newly created task in storage based on modal form submission.
   * Returns the created task as JSON.
   *
   * @param StoreTaskRequest $request
   * @return JsonResponse
   */
  public function store(StoreTaskRequest $request): JsonResponse
  {
    $validated = $request->validated();
    $childAssignmentData = $validated['assigned_children'] ?? []; // Get child data from request
    unset($validated['assigned_children']); // Remove it before creating task

    // Create the task associated with the logged-in user (parent)
    $task = Auth::user()->tasks()->create($validated);

    // Prepare data for sync method: [child_id => ['pivot_column' => value]]
    $syncData = [];
    foreach ($childAssignmentData as $assignment) {
      if (isset($assignment['child_id']) && isset($assignment['token_reward'])) {
        // Ensure child belongs to parent (already validated in FormRequest ideally)
        $syncData[$assignment['child_id']] = ['token_reward' => $assignment['token_reward']];
      }
    }

    // Sync the relationship using the pivot table
    if (!empty($syncData)) {
      $task->children()->sync($syncData); // This adds/updates/removes rows in child_task table
    } else {
      $task->children()->detach(); // Remove all children if empty array sent
    }

    // Eager load for response if needed
    $task->load('children');

    return response()->json($task, 201);
  }
  /**
   * Display the specified task details.
   * Acts as an API endpoint returning JSON for modal/detail views.
   *
   * @param Task $task
   * @return JsonResponse
   */
  public function show(Task $task): JsonResponse
  {
    $this->authorize('view', $task);

    return response()->json(new TaskResource($task));
  }

  /**
   * Show the form for editing the specified resource.
   * NOTE: In a modal-based workflow, this might be unused. The edit modal
   * typically fetches data using the show() method/route.
   *
   * @param Task $task
   * @return void | JsonResponse | InertiaResponse
   */
  public function edit(Task $task)
  {
    // Option 1: Not used if modal fetches data via show() route
    // Option 2: Render a dedicated Inertia page
    // $this->authorize('update', $task); // Authorize first
    // return Inertia::render('Tasks/Edit', ['task' => $task]);
    abort(404); // Or return appropriate response if unused
  }

  /**
   * Update the specified task in storage based on modal form submission.
   * Returns the updated task as JSON.
   *
   * @param UpdateTaskRequest $request
   * @param Task $task
   * @return JsonResponse
   */
  public function update(UpdateTaskRequest $request, Task $task): JsonResponse
  {
    $validated = $request->validated();
    $childAssignmentData = $validated['assigned_children'] ?? null; // Check if sent
    unset($validated['assigned_children']);

    $task->update($validated);

    // Only sync if the assignment data was actually included in the update request
    if ($childAssignmentData !== null) {
      $syncData = [];
      foreach ($childAssignmentData as $assignment) {
        if (isset($assignment['child_id']) && isset($assignment['token_reward'])) {
          $syncData[$assignment['child_id']] = ['token_reward' => $assignment['token_reward']];
        }
      }
      $task->children()->sync($syncData); // Sync the changes
    }

    return response()->json($task->fresh()->load('children'));
  }

  /**
   * Remove the specified task from storage.
   * Returns a No Content response on success.
   *
   * @param Task $task
   * @return Response
   */
  public function destroy(Task $task): Response
  {
    // Authorize that the logged-in user can delete this task
    $this->authorize('delete', $task); // Uses TaskPolicy@delete

    $task->delete(); // Model events (like deleting assignments) should be handled via Observers or Model 'deleting' event

    return response()->noContent(); // 204 No Content status
  }

  // --- Optional: Example Custom API Method for Axios ---
  // This method might be deprecated or refactored if listFamilyTasks handles all needs
  public function listTasksApi(Request $request): JsonResponse
  {
    // ... (keep or remove based on whether you still need a raw task list) ...
    // Consider if this endpoint is still necessary or if listFamilyTasks covers the use case.
    // If kept, ensure it returns Task definitions, maybe with pivot data.
    $user = Auth::user();
    $query = $user->tasks()->with('children'); // Eager load children pivot data

    // ... rest of the filtering/sorting/pagination logic ...

    $tasks = $query->paginate(15);
    // You might want a TaskResource that includes pivot data here
    return response()->json($tasks);
  }
}
