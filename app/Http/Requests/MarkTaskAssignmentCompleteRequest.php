<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\TaskAssignment;
use App\Models\Child;
use Carbon\Carbon;

class MarkTaskAssignmentCompleteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Check parent ownership, assignment ownership, status, and time window.
     */
    public function authorize(): bool
    {
        $child = $this->route('child');
        $taskAssignment = $this->route('task_assignment');
        $user = Auth::user();

        // 1. Check if authenticated user owns the child
        if (!$user || !$child || $child->user_id !== $user->id) {
            return false;
        }

        // 2. Check if the assignment exists and belongs to the child
        if (!$taskAssignment || $taskAssignment->child_id !== $child->id) {
            // This check might be redundant if using route scopeBindings effectively
            return false;
        }

        // 3. Check if the assignment is currently pending
        if ($taskAssignment->status !== 'pending') {
            // Or allow re-completing? For now, only allow from pending.
            return false;
        }

        // 4. Check completion time window (if applicable)
        $task = $taskAssignment->task; // Assumes relationship is loaded or accessible
        $now = Carbon::now();
        $today = $now->format('Y-m-d');

        // Ensure the task is being completed on its assigned day (or allow completion later? TBD)
        if ($taskAssignment->assigned_date->format('Y-m-d') !== $today) {
            // return false; // Uncomment to restrict completion to assigned day only
        }

        $startTime = $task->completion_window_start; // e.g., "08:00"
        $endTime = $task->completion_window_end; // e.g., "08:30"

        if ($startTime && $endTime) {
            $currentTime = $now->format('H:i:s');
            $startTime .= ':00'; // Add seconds for comparison
            $endTime .= ':00';

            if ($currentTime < $startTime || $currentTime > $endTime) {
                // Allow a small grace period? For now, strict check.
                // You could throw a specific AuthorizationException here with a message.
                return false; // Outside completion window
            }
        }

        // If all checks pass
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:1000'], // Optional notes from the child
        ];
    }
}
