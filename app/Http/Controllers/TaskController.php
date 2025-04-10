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

  public function listFamilyTasks(): JsonResponse
  {
    // Basic authorization: user must be logged in (handled by middleware)
    $user = Auth::user();

    // Fetch tasks belonging to the parent with relationships
    $tasks = $user
      ->tasks()
      ->with(['assignments.child']) // Load relationships
      ->orderBy('created_at', 'desc') // Example sorting
      ->get()
      ->map(function ($task) {
        return [
          'id' => $task->id,
          'title' => $task->title,
          'description' => $task->description,
          'token_amount' => $task->token_amount,
          'type' => $task->type,
          'needs_approval' => $task->needs_approval,
          'is_collaborative' => $task->is_collaborative,
          'recurrence_type' => $task->recurrence_type,
          'recurrence_days' => $task->recurrence_days,
          'start_date' => $task->start_date,
          'recurrence_ends_on' => $task->recurrence_ends_on,
          'available_from_time' => $task->available_from_time,
          'available_to_time' => $task->available_to_time,
          'completion_window_start' => $task->completion_window_start,
          'completion_window_end' => $task->completion_window_end,
          'suggested_duration_minutes' => $task->suggested_duration_minutes,
          'is_active' => $task->is_active,
          'assigned_to' => $task->assignments->pluck('child.name')->join(', '),
        ];
      });

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
    // Authorize that the logged-in user can view this task
    $this->authorize('view', $task); // Uses TaskPolicy@view

    // Eager load relationships if needed by the detail/edit view
    // $task->load('children'); // Example

    return response()->json($task);
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
  public function listTasksApi(Request $request): JsonResponse
  {
    $user = Auth::user();
    $query = $user->tasks();

    // Example filtering: ?type=quest or ?type=challenge
    if ($request->filled('type') && in_array($request->type, ['routine', 'challenge'])) {
      $query->where('type', $request->type);
    }

    // Example sorting: ?sort_by=title&sort_dir=asc
    $sortBy = $request->query('sort_by', 'created_at');
    $sortDir = $request->query('sort_dir', 'desc');
    if (in_array($sortBy, ['title', 'created_at', 'type']) && in_array($sortDir, ['asc', 'desc'])) {
      $query->orderBy($sortBy, $sortDir);
    } else {
      $query->orderBy('created_at', 'desc'); // Default sort
    }

    // Example pagination: ?page=2
    $tasks = $query->paginate(15); // Adjust page size as needed

    return response()->json($tasks);
  }
}
