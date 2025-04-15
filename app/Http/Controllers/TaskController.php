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
   * List all active tasks for the authenticated user's family with their child assignments.
   * Only includes today's status information as supplementary data.
   * Only returns tasks that are within their active period (after start_date and before recurrence_ends_on).
   *
   * @return JsonResponse
   */
  public function listFamilyTasks(): JsonResponse
  {
    $user = Auth::user();
    $today = Carbon::today();

    // Fetch all active task definitions with their assigned children (pivot data)
    // Only get tasks that are within their active date range
    $tasks = $user
      ->tasks()
      ->where('is_active', true)
      ->where(function ($query) use ($today) {
        $query
          ->where(function ($q) use ($today) {
            // Tasks that have started (start_date is null or in the past/today)
            $q->whereNull('start_date')->orWhere('start_date', '<=', $today);
          })
          ->where(function ($q) use ($today) {
            // Tasks that haven't ended (recurrence_ends_on is null or in the future/today)
            $q->whereNull('recurrence_ends_on')->orWhere('recurrence_ends_on', '>=', $today);
          });
      })
      ->with([
        'children' => function ($query) {
          $query->select('children.id', 'children.name', 'children.color', 'children.avatar');
        },
      ])
      ->get();

    return response()->json($tasks);
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

  /**
   * Get task assignments for a specific date.
   * This endpoint provides status information about tasks for any date.
   *
   * @param Request $request
   * @return JsonResponse
   */
  public function getTaskAssignmentsForDate(Request $request): JsonResponse
  {
    $user = Auth::user();

    // Get the date from the request, default to today
    $targetDateStr = $request->input('date', Carbon::today()->toDateString());
    info($targetDateStr);
    $targetDate = Carbon::parse($targetDateStr)->startOfDay();
    $today = Carbon::today()->startOfDay();

    // Determine if we're looking at past, present, or future
    $isPastDate = $targetDate->lt($today);
    $isFutureDate = $targetDate->gt($today);

    // Get all task assignments for this date
    $assignments = TaskAssignment::where('assigned_date', $targetDate)
      ->whereHas('child', function ($query) use ($user) {
        $query->where('user_id', $user->id);
      })
      ->with(['task:id,title,type,needs_approval,is_collaborative', 'child:id,name,avatar,color'])
      ->get();

    // Transform the assignments to include appropriate status based on date context
    $transformedAssignments = $assignments->map(function ($assignment) use ($isPastDate, $isFutureDate) {
      $status = $assignment->status;

      // For past dates, adjust status display
      if ($isPastDate && !in_array($status, ['completed', 'approved', 'in_progress'])) {
        $status = 'missed';
      }

      // For future dates, tasks shouldn't have statuses yet
      if ($isFutureDate) {
        $status = 'pending';
      }

      return [
        'id' => $assignment->id,
        'task_id' => $assignment->task_id,
        'child_id' => $assignment->child_id,
        'status' => $status,
        'assigned_date' => $assignment->assigned_date->toDateString(),
        'completed_at' => $assignment->completed_at?->toIso8601String(),
        'approved_at' => $assignment->approved_at?->toIso8601String(),
        'task' => [
          'id' => $assignment->task->id,
          'title' => $assignment->task->title,
          'type' => $assignment->task->type,
          'needs_approval' => $assignment->task->needs_approval,
          'is_collaborative' => $assignment->task->is_collaborative,
        ],
        'child' => [
          'id' => $assignment->child->id,
          'name' => $assignment->child->name,
          'avatar' => $assignment->child->avatar,
          'color' => $assignment->child->color,
        ],
      ];
    });

    return response()->json([
      'date' => $targetDate->toDateString(),
      'assignments' => $transformedAssignments,
    ]);
  }
}
