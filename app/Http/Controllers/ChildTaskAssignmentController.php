<?php

namespace App\Http\Controllers;

use App\Http\Requests\MarkTaskAssignmentCompleteRequest; // We'll create this
use App\Models\Child;
use App\Models\TaskAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate; // Use Gate for policy checks
use Carbon\Carbon;
use Illuminate\Http\Response;
use App\Services\TaskCompletionService; // Assumes a Service class handles complex logic

class ChildTaskAssignmentController extends Controller
{
    /**
     * Display a listing of the resource for a specific child.
     * Fetches based on date range (defaulting to today).
     *
     * @param Request $request
     * @param Child $child The specific child whose assignments are being requested.
     * @return JsonResponse
     */
    public function index(Request $request, Child $child): JsonResponse
    {
        // Authorize: Ensure the logged-in parent owns this child
        if (Auth::user()->cannot('view', $child)) {
            abort(403, 'Unauthorized action.');
        }

        // Validate date range parameters (example: default to today)
        $startDate = $request->date('start_date', Carbon::today());
        $endDate = $request->date('end_date', $startDate); // Default to single day if no end date

        $assignments = TaskAssignment::where('child_id', $child->id)
            ->whereBetween('assigned_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->with('task') // Eager load task details (title, type, times etc.)
            ->orderBy('assigned_date', 'asc')
            // Add sorting by time if needed, requires joining/selecting task time fields
            // ->orderBy(fn($q) => $q->select('completion_window_start')->from('tasks')->whereColumn('tasks.id', 'task_assignments.task_id'), 'asc')
            ->get();

        // Check TaskPause status for each assignment (this might be better done via a relationship/scope)
        // Basic check example:
        $assignments = $assignments->filter(function ($assignment) use ($startDate) {
            // Check if *any* pause rule applies for this task/child on the assigned date
            return !\App\Models\TaskPause::isActiveFor($assignment->assigned_date, $assignment->task_id, $assignment->child_id)->exists();
        });

        return response()->json($assignments);
    }

    /**
     * Mark the specified TaskAssignment as complete or pending approval.
     *
     * @param MarkTaskAssignmentCompleteRequest $request // Use Form Request for validation/auth
     * @param Child $child // Child from route binding
     * @param TaskAssignment $taskAssignment // Assignment scoped to child via scopeBindings() or manual check
     * @param TaskCompletionService $completionService // Inject service for complex logic
     * @return JsonResponse
     */
    public function markComplete(
        MarkTaskAssignmentCompleteRequest $request,
        TaskAssignment $taskAssignment,
        TaskCompletionService $completionService,
    ): JsonResponse {
        // Authorization:
        // 1. Parent owns child (implicit via route binding + middleware/request authorize)
        // 2. Assignment belongs to child (implicit via scopeBindings or check below)
        // 3. Assignment is in 'pending' state (can be done in Form Request or here)
        // 4. Current time is within completion window (if applicable) - check in Form Request or Service

        // If not using scopeBindings, explicitly check assignment belongs to child:
        // if ($taskAssignment->child_id !== $child->id) {
        //     abort(403, 'Assignment does not belong to this child.');
        // }

        // Validation and core authorization done by MarkTaskAssignmentCompleteRequest

        $notes = $request->input('notes');

        try {
            // Delegate the complex logic to a service class
            $updatedAssignment = $completionService->completeAssignment($taskAssignment, $notes);

            return response()->json($updatedAssignment);
        } catch (\App\Exceptions\TaskCompletionException $e) {
            // Example custom exception
            // Handle specific errors like "outside completion window", "already completed" etc.
            return response()->json(['message' => $e->getMessage()], 422); // Unprocessable Entity
        } catch (\Exception $e) {
            // Handle generic errors
            report($e); // Log the exception
            return response()->json(['message' => 'Failed to mark task as complete.'], 500);
        }
    }
}
