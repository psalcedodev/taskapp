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
    public function index(Request $request): InertiaResponse
    {
        // Basic authorization: user must be logged in (handled by middleware)
        $user = Auth::user();

        // Fetch tasks belonging to the parent
        // Add any filtering/sorting based on request if needed later
        $tasks = $user
            ->tasks()
            ->orderBy('created_at', 'desc') // Example sorting
            ->get(); // Consider pagination for large lists: ->paginate(15)

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            // Pass any other props needed for the Index page
        ]);
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
        // Validation is handled by StoreTaskRequest
        $validated = $request->validated();

        // Associate with the logged-in user (parent)
        $task = Auth::user()->tasks()->create($validated);

        // --- TODO: Handle Child Assignment ---
        // If $request contains child IDs and specific token amounts,
        // you might store default assignments here or handle it differently.
        // This depends on how you decide parents assign tasks.
        // Example: if (isset($validated['children'])) { $task->children()->sync($validated['children']); }

        // --- TODO: Handle Skill Assignment (If Skills are re-added later) ---

        // Load any relationships needed by the frontend view after creation
        // $task->load('children');

        return response()->json($task, 201); // Return created task with 201 status
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
        // Authorization is handled by UpdateTaskRequest (or use $this->authorize)
        // $this->authorize('update', $task);

        // Validation is handled by UpdateTaskRequest
        $validated = $request->validated();

        $task->update($validated);

        // --- TODO: Handle updates to Child Assignment ---
        // If $validated contains updated child links/tokens, update them here.

        // --- TODO: Handle updates to Skill Assignment (If Skills are re-added later) ---

        // Load relationships if needed by the frontend after update
        // $task->load('children');

        return response()->json($task->fresh()); // Return updated task data
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
        if ($request->filled('type') && in_array($request->type, ['quest', 'challenge'])) {
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
