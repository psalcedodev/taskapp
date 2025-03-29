<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Models\Task;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * User must be authenticated and own the task they are trying to update.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Get the task instance from the route parameter
        $task = $this->route('task');

        // Check if user is logged in and if the task belongs to the user
        return Auth::check() && $task && $task->user_id == $this->user()->id;
        // Alternatively, rely solely on the TaskPolicy check in the controller:
        // return true; // If using $this->authorize('update', $task) in controller
    }

    /**
     * Get the validation rules that apply to the request.
     * Rules are similar to store, but often use 'sometimes' to allow partial updates.
     * Fields not included in the request payload will not be validated or updated.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Get task type - assume type might not be updatable, or use current task's type if not sent
        $taskType = $this->input('type', $this->route('task')->type);

        return [
            // Use 'sometimes' to only validate fields that are present in the request
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:65535'],
            'image_path' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'type' => ['sometimes', 'required', 'string', Rule::in(['quest', 'challenge'])], // Can type be updated? Decide based on app logic.

            'token_amount' => [
                'sometimes', // Only validate if present
                Rule::requiredIf(fn() => $taskType === 'challenge'),
                'nullable',
                'integer',
                'min:0',
            ],

            'needs_approval' => ['sometimes', 'boolean'],
            'is_collaborative' => ['sometimes', 'boolean'],
            'is_mandatory' => ['sometimes', 'boolean'],

            // Recurrence Rules
            'recurrence_type' => ['sometimes', 'required', 'string', Rule::in(['none', 'daily', 'weekly', 'monthly', 'custom'])],
            'recurrence_days' => [
                'sometimes', // Only validate if present
                Rule::requiredIf(
                    fn() => in_array($this->input('recurrence_type', $this->route('task')->recurrence_type), ['weekly', 'monthly', 'custom']),
                ),
                'nullable',
                'array',
            ],
            'recurrence_days.*' => ['string', 'distinct'],

            // Dates & Times
            'start_date' => [
                'sometimes',
                Rule::requiredIf(fn() => $this->input('recurrence_type', $this->route('task')->recurrence_type) === 'none'),
                'nullable',
                'date_format:Y-m-d',
            ],
            'recurrence_ends_on' => [
                'sometimes',
                'nullable',
                'date_format:Y-m-d',
                // Ensure it's after start_date if start_date is also being updated or exists
                Rule::when($this->filled('start_date'), 'after_or_equal:start_date', function ($input) {
                    // If start_date isn't in the input, compare against the existing task's start_date
                    return 'after_or_equal:' . ($this->route('task')->start_date ? $this->route('task')->start_date->format('Y-m-d') : 'today');
                }),
            ],

            'available_from_time' => ['sometimes', 'nullable', 'date_format:H:i', 'required_with:available_to_time'],
            'available_to_time' => ['sometimes', 'nullable', 'date_format:H:i', 'after:available_from_time'],

            'completion_window_start' => ['sometimes', 'nullable', 'date_format:H:i', 'required_with:completion_window_end'],
            'completion_window_end' => ['sometimes', 'nullable', 'date_format:H:i', 'after:completion_window_start'],

            // Other fields
            'suggested_duration_minutes' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],

            // --- TODO: Define how child assignment data is updated ---
            // Updating assignments might be complex (syncing, detaching, attaching).
            // Consider if this should be handled here or via separate endpoints.
            'assigned_children' => ['sometimes', 'nullable', 'array'],
            'assigned_children.*.id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('children', 'id')->where(function ($query) {
                    return $query->where('user_id', $this->user()->id);
                }),
            ],
            'assigned_children.*.token_amount' => ['sometimes', 'nullable', 'integer', 'min:0', Rule::requiredIf(fn() => $taskType === 'challenge')],
            // --- End Child Assignment Example ---
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Ensure recurrence_days is null if not applicable type, based on potentially incoming type or existing type
        $recurrenceType = $this->input('recurrence_type', $this->route('task')?->recurrence_type);
        if ($recurrenceType && !in_array($recurrenceType, ['weekly', 'monthly', 'custom'])) {
            $this->merge(['recurrence_days' => null]);
        }
    }
}
