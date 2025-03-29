<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Models\Task; // Assuming TaskType enum is not used yet for strings 'quest'/'challenge'

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Any authenticated user (parent) can create a task for themselves.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Ensure the user is logged in (middleware should also handle this)
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $taskType = $this->input('type'); // Get the type to use in conditional rules

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:65535'], // Max text length
            'image_path' => ['nullable', 'string', 'max:2048'], // Adjust max length as needed
            'type' => ['required', 'string', Rule::in(['quest', 'challenge'])],

            // Token amount is required only for challenges
            'token_amount' => [
                Rule::requiredIf(fn() => $taskType === 'challenge'),
                'nullable', // Allow null if type is 'quest'
                'integer',
                'min:0',
            ],

            'needs_approval' => ['sometimes', 'boolean'], // Use sometimes if not always present/defaulted
            'is_collaborative' => ['sometimes', 'boolean'],
            'is_mandatory' => ['sometimes', 'boolean'],

            // Recurrence Rules
            'recurrence_type' => ['required', 'string', Rule::in(['none', 'daily', 'weekly', 'monthly', 'custom'])],
            'recurrence_days' => [
                Rule::requiredIf(fn() => in_array($this->input('recurrence_type'), ['weekly', 'monthly', 'custom'])),
                'nullable',
                'array',
                // Basic check: ensure it's an array if provided.
                // More specific validation per type (days MON-SUN vs numbers 1-31) might need custom rule or post-validation logic.
            ],
            'recurrence_days.*' => ['string', 'distinct'], // Ensure items in array are distinct strings (basic check)

            // Dates & Times
            // Start date required for one-time tasks, nullable for recurring (defaults to today maybe?)
            'start_date' => [
                Rule::requiredIf(fn() => $this->input('recurrence_type') === 'none'),
                'nullable', // Allow null if recurring
                'date_format:Y-m-d', // Ensure YYYY-MM-DD format
            ],
            'recurrence_ends_on' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],

            'available_from_time' => ['nullable', 'date_format:H:i', 'required_with:available_to_time'], // Ensure H:i format (e.g., 14:30)
            'available_to_time' => ['nullable', 'date_format:H:i', 'after:available_from_time'],

            'completion_window_start' => ['nullable', 'date_format:H:i', 'required_with:completion_window_end'],
            'completion_window_end' => ['nullable', 'date_format:H:i', 'after:completion_window_start'],

            // Other fields
            'suggested_duration_minutes' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],

            // --- TODO: Define how child assignment data is sent ---
            // Example: Assuming an array like assigned_children: [{id: 1, token_amount: 5}, {id: 2}]
            'assigned_children' => ['nullable', 'array'],
            'assigned_children.*.id' => [
                // Validate each item in the array
                'required', // Each object needs an id
                'integer',
                Rule::exists('children', 'id')->where(function ($query) {
                    // Ensure the child ID belongs to the currently authenticated parent
                    return $query->where('user_id', $this->user()->id);
                }),
            ],
            'assigned_children.*.token_amount' => [
                // Optional override for challenge tokens
                'nullable', // Not always required
                'integer',
                'min:0',
                Rule::requiredIf(fn() => $taskType === 'challenge'), // Only relevant for challenges
            ],
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
        // Set defaults if needed, e.g., for booleans not present in request
        $this->mergeIfMissing([
            'needs_approval' => false,
            'is_collaborative' => false,
            'is_mandatory' => false,
            'is_active' => true,
        ]);

        // Ensure recurrence_days is null if not applicable type, to pass validation
        if (!in_array($this->input('recurrence_type'), ['weekly', 'monthly', 'custom'])) {
            $this->merge(['recurrence_days' => null]);
        }
    }
}
