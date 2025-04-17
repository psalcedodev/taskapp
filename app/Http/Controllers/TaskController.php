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
   * @return JsonResponse
   */
  public function listFamilyTasks(Request $request): JsonResponse
  {
    $user = Auth::user();
    $targetDateStr = $request->input('date', Carbon::today()->toDateString());
    $targetDate = Carbon::parse($targetDateStr)->startOfDay();

    // Fetch Tasks using Scopes
    $tasks = $user
      ->tasks()
      ->where('is_active', true)
      ->activeInRange($targetDate) // Use scope
      ->recurringOnDate($targetDate) // Use scope
      ->with(['children']) // Still need children with pivot data
      ->get();

    // Date context
    $today = Carbon::today()->startOfDay();
    $isPastDate = $targetDate->lt($today);
    $isFutureDate = $targetDate->gt($today);

    // Process and Group Tasks
    $hourlyTasks = collect(range(0, 23))->mapWithKeys(fn($hour) => [$hour => collect()])->toArray();

    foreach ($tasks as $task) {
      // Fetch assignments specifically for this task and date within the loop
      $taskAssignments = TaskAssignment::where('task_id', $task->id)
        ->whereDate('assigned_date', $targetDate)
        ->whereHas('child', fn(Builder $q) => $q->where('user_id', $user->id))
        ->select('task_id', 'child_id', 'status') // Select only needed columns
        ->get();

      // Calculate Status
      Log::info('Task Assignments', ['taskAssignments' => $taskAssignments]);
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

    return response()->json($hourlyTasks);
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
    Log::debug('Calculating Task Status', ['assignment_statuses' => $statuses->all()]); // Log input statuses

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

    $statusBeforeDateContext = $taskStatus; // Store status before date checks

    // Apply date context adjustments
    if ($isPastDate && !in_array($taskStatus, ['completed', 'approved', 'rejected'])) {
      $taskStatus = 'missed';
    }
    if ($isFutureDate) {
      $taskStatus = 'pending';
    }

    Log::debug('Calculated Task Status Result', [
      'before_date_context' => $statusBeforeDateContext,
      'final_status' => $taskStatus,
      'is_past' => $isPastDate,
      'is_future' => $isFutureDate,
    ]); // Log final result

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

    return response()->json($task->load('children'));
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
