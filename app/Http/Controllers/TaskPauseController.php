<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskPauseRequest;
use App\Http\Requests\UpdateTaskPauseRequest;
use App\Models\TaskPause;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class TaskPauseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): InertiaResponse
    {
        $pauses = Auth::user()
            ->taskPauses()
            ->with(['child:id,name', 'task:id,title']) // Eager load basic info
            ->orderBy('pause_start_date', 'desc')
            ->get();

        return Inertia::render('TaskPauses/Index', [
            'pauses' => $pauses,
            // Pass children/tasks lists if needed for filtering/forms in modal
            // 'children' => Auth::user()->children()->select('id','name')->get(),
            // 'tasks' => Auth::user()->tasks()->select('id','title')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource. (Unused for modals)
     */
    public function create()
    {
        abort(404);
    }

    /**
     * Store a newly created resource in storage.
     * Returns created pause as JSON.
     */
    public function store(StoreTaskPauseRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // --- TODO: Handle Multi-Record Creation ---
        // If UI allows selecting multiple children/tasks for one pause period,
        // you need logic here to loop and create multiple TaskPause records.
        // The current validation assumes one task_id/child_id or null for broader scope.
        // Example for single record:
        $pause = Auth::user()->taskPauses()->create($validated);

        $pause->load(['child:id,name', 'task:id,title']); // Load relationships for response

        return response()->json($pause, 201);
    }

    /**
     * Display the specified resource (API for modal).
     */
    public function show(TaskPause $taskPause): JsonResponse
    {
        $this->authorize('view', $taskPause); // Use Policy
        $taskPause->load(['child:id,name', 'task:id,title']);
        return response()->json($taskPause);
    }

    /**
     * Show the form for editing the specified resource. (Unused for modals)
     */
    public function edit(TaskPause $taskPause)
    {
        $this->authorize('update', $taskPause);
        abort(404);
    }

    /**
     * Update the specified resource in storage.
     * Returns updated pause as JSON.
     */
    public function update(UpdateTaskPauseRequest $request, TaskPause $taskPause): JsonResponse
    {
        // Auth handled by Request or $this->authorize('update', $taskPause);
        $validated = $request->validated();

        $taskPause->update($validated);
        $taskPause->load(['child:id,name', 'task:id,title']);

        return response()->json($taskPause->fresh());
    }

    /**
     * Remove the specified resource from storage.
     * Returns No Content response.
     */
    public function destroy(TaskPause $taskPause): Response
    {
        $this->authorize('delete', $taskPause); // Use Policy
        $taskPause->delete();
        return response()->noContent(); // 204
    }
}
