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
use App\Http\Resources\DayViewTaskResource; // Import the new resource
use Carbon\Carbon; // Import Carbon for date handling
use App\Models\Child; // Import Child model
use App\Models\TaskAssignment; // Import TaskAssignment
use Illuminate\Support\Collection; // Add Collection import
use Illuminate\Database\Eloquent\Builder; // Add Builder import
use Illuminate\Support\Facades\Log; // <-- Add Log facade
use App\Http\Resources\TaskManagerTaskResource; // Use a new resource for this list
use App\Http\Resources\TaskDetailResource; // <-- Import the new resource
use App\Services\TaskAssignmentGenerator;

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
   * List tasks for the authenticated user's family, filtered by date,
   * with assignment status merged, and grouped by hour for the Day View.
   * Returns only fields needed by the Day View component via DayViewTaskResource.
   *
   * @param Request $request
   * @param TaskAssignmentGenerator $assignmentGenerator
   * @return JsonResponse
   */
  public function listFamilyTasks(Request $request, TaskAssignmentGenerator $assignmentGenerator): JsonResponse
  {
    $user = Auth::user();
    $targetDateStr = $request->input('date', Carbon::today()->toDateString());
    $targetDate = Carbon::parse($targetDateStr)->startOfDay();

    // On-demand assignment generation for this user/date
    $assignmentGenerator->generateForUserAndDate($user, $targetDate);

    $originalTasks = $user->tasks()->where('is_active', true)->activeInRange($targetDate)->get();
    // Fetch Tasks using Scopes
    $tasks = $user
      ->tasks()
      ->where('is_active', true)
      ->activeInRange($targetDate) // Use scope
      ->recurringOnDate($targetDate) // Use scope
      ->with(['children']) // Still need children with pivot data
      ->orderBy('available_from_time')
      ->get();
    Log::info('--- Start New Tasks ---');
    foreach ($tasks as $task) {
      Log::info('New Task: ' . json_encode($task));
    }
    Log::info('--- End New Tasks ---');
    // Date context
    $today = Carbon::today()->startOfDay();
    $isPastDate = $targetDate->lt($today);
    $isFutureDate = $targetDate->gt($today);

    // Separate anytime tasks (both times null)
    $anytimeTasks = $tasks
      ->filter(function ($task) {
        return is_null($task->available_from_time) && is_null($task->available_to_time);
      })
      ->values();

    // Remove anytime tasks from the main tasks collection
    $timedTasks = $tasks->reject(function ($task) {
      return is_null($task->available_from_time) && is_null($task->available_to_time);
    });

    // Process and Group Timed Tasks
    $hourlyTasks = collect(range(0, 23))->mapWithKeys(fn($hour) => [$hour => collect()])->toArray();

    foreach ($timedTasks as $task) {
      // Fetch assignments specifically for this task and date within the loop
      $taskAssignments = TaskAssignment::where('task_id', $task->id)
        ->whereDate('assigned_date', $targetDate)
        ->whereHas('child', fn(Builder $q) => $q->where('user_id', $user->id))
        ->select('task_id', 'child_id', 'status') // Select only needed columns
        ->get();

      // Calculate Status
      $taskStatus = $this->calculateOverallTaskStatus($taskAssignments, $isPastDate, $isFutureDate);

      // Determine Hour (Refactored into helper)
      $hour = $this->getHourFromTime($task->available_from_time);

      // Use the API Resource, passing the status via constructor
      $taskData = new DayViewTaskResource($task, $taskStatus);

      // Add resource to the correct hour slot
      if (!isset($hourlyTasks[$hour]) || !$hourlyTasks[$hour] instanceof Collection) {
        $hourlyTasks[$hour] = collect();
      }
      $hourlyTasks[$hour]->push($taskData);
    }

    // Map anytime tasks to DayViewTaskResource
    $anytimeTaskResources = $anytimeTasks
      ->map(function ($task) use ($user, $targetDate, $isPastDate, $isFutureDate) {
        $taskAssignments = TaskAssignment::where('task_id', $task->id)
          ->whereDate('assigned_date', $targetDate)
          ->whereHas('child', fn(Builder $q) => $q->where('user_id', $user->id))
          ->select('task_id', 'child_id', 'status')
          ->get();
        $taskStatus = $this->calculateOverallTaskStatus($taskAssignments, $isPastDate, $isFutureDate);
        return new DayViewTaskResource($task, $taskStatus);
      })
      ->values();

    return response()->json([
      'hourlyTasks' => $hourlyTasks,
      'anytimeTasks' => $anytimeTaskResources,
    ]);
  }

  /**
   * Calculate the overall visual status for a task based on its assignments and date context.
   *
   * @param Collection $assignments Assignments for the task on the target date.
   * @param bool $isPastDate Is the target date in the past?
   * @param bool $isFutureDate Is the target date in the future?
   * @return string The calculated status ('pending', 'missed', 'rejected', etc.)
   */
  private function calculateOverallTaskStatus(Collection $assignments, bool $isPastDate, bool $isFutureDate): string
  {
    $statuses = $assignments->pluck('status');

    $taskStatus = 'pending'; // Default

    if (!$assignments->isEmpty()) {
      if ($statuses->contains('rejected')) {
        $taskStatus = 'rejected';
      } elseif ($statuses->contains('pending_approval')) {
        $taskStatus = 'pending_approval';
      } elseif ($statuses->contains('in_progress')) {
        $taskStatus = 'in_progress';
      } elseif ($statuses->every(fn($s) => in_array($s, ['completed', 'approved']))) {
        $taskStatus = 'completed';
      } else {
        $taskStatus = 'pending';
      }
    }

    // Apply date context adjustments
    if ($isPastDate && !in_array($taskStatus, ['completed', 'approved', 'rejected'])) {
      $taskStatus = 'missed';
    }
    if ($isFutureDate) {
      $taskStatus = 'future';
    }

    return $taskStatus;
  }

  /**
   * Determine the hour (0-23) from a time string (HH:MM or HH:MM:SS).
   * Defaults to 8 if parsing fails or time is null.
   *
   * @param string|null $timeString
   * @return int
   */
  private function getHourFromTime(?string $timeString): int
  {
    if (!$timeString) {
      return 8; // Default hour
    }
    $timeParts = explode(':', $timeString);
    if (count($timeParts) >= 1 && is_numeric($timeParts[0])) {
      $parsedHour = intval($timeParts[0]);
      if ($parsedHour >= 0 && $parsedHour <= 23) {
        return $parsedHour;
      }
    }
    return 8; // Default if parsing failed
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
      if (isset($assignment['id']) && isset($assignment['token_reward'])) {
        // Ensure child belongs to parent (already validated in FormRequest ideally)
        $syncData[$assignment['id']] = ['token_reward' => $assignment['token_reward']];
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
   * Uses TaskDetailResource to format the output.
   *
   * @param Task $task
   * @return TaskDetailResource // <-- Return type is now the resource
   */
  public function show(Task $task): TaskDetailResource
  {
    $this->authorize('view', $task);

    // Eager load children with specific pivot data
    $task->load([
      'children' => function ($query) {
        // Only load existing pivot columns
        $query->withPivot('token_reward');
      },
    ]);
    TaskDetailResource::withoutWrapping();
    return new TaskDetailResource($task);
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
    Log::info('Updating task: ' . $task->id);
    Log::info('Request: ' . json_encode($request->all()));
    $validated = $request->validated();
    $childAssignmentData = $validated['assigned_children'] ?? null; // Check if sent
    unset($validated['assigned_children']);

    $task->update($validated);

    // Only sync if the assignment data was actually included in the update request
    if ($childAssignmentData !== null) {
      $syncData = [];
      foreach ($childAssignmentData as $assignment) {
        if (isset($assignment['id']) && isset($assignment['token_reward'])) {
          $syncData[$assignment['id']] = ['token_reward' => $assignment['token_reward']];
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
   * List task definitions for the Task Manager.
   *
   * Returns a list of tasks formatted by TaskDetailResource.
   *
   * @param Request $request
   * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
   */
  public function listDefinitions(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
  {
    $user = Auth::user();

    $tasks = $user
      ->tasks()
      ->with([
        'children' => function ($query) {
          $query->select('children.id', 'children.name');
          $query->withPivot('token_reward');
        },
      ])
      ->orderBy('title')
      ->get();

    Log::info('Listing task definitions for user: ' . $user->id);
    foreach ($tasks as $task) {
      Log::info('Task: ' . json_encode($task));
    }

    // Disable the default "data" wrapping for this specific response
    TaskDetailResource::withoutWrapping();

    return TaskDetailResource::collection($tasks);
  }
}
