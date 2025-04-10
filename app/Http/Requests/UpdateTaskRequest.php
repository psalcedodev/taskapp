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
   */
  public function authorize(): bool
  {
    $task = $this->route('task');
    return Auth::check() && $task && $task->user_id == $this->user()->id;
    // return true; // If using controller/policy authorization solely
  }

  /**
   * Get the validation rules that apply to the request.
   */
  public function rules(): array
  {
    // Get task type - checks incoming request first, falls back to existing task type
    $taskType = $this->input('type', $this->route('task')?->type);

    return [
      'title' => ['sometimes', 'required', 'string', 'max:255'],
      'description' => ['sometimes', 'nullable', 'string', 'max:65535'],
      'image_path' => ['sometimes', 'nullable', 'string', 'max:2048'],
      'type' => ['sometimes', 'required', 'string', Rule::in(['routine', 'challenge'])], // Updated types

      // REMOVED: Validation for top-level token_amount

      'needs_approval' => ['sometimes', 'boolean'],
      'is_collaborative' => ['sometimes', 'boolean'],
      'is_mandatory' => ['sometimes', 'boolean'],

      // Recurrence Rules
      'recurrence_type' => ['sometimes', 'required', 'string', Rule::in(['none', 'daily', 'weekly', 'monthly', 'custom'])],
      'recurrence_days' => [
        'sometimes', // Only validate if present
        Rule::requiredIf(
          // Check incoming type first, then existing type
          fn() => in_array($this->input('recurrence_type', $this->route('task')?->recurrence_type), ['weekly', 'monthly', 'custom']),
        ),
        'nullable', // Allow sending null to clear it
        'array',
      ],
      'recurrence_days.*' => ['string', 'distinct'], // Keep basic array item validation

      // Dates & Times
      'start_date' => [
        'sometimes',
        // Required if incoming/existing type is 'none'
        Rule::requiredIf(fn() => $this->input('recurrence_type', $this->route('task')?->recurrence_type) === 'none'),
        'nullable',
        'date_format:Y-m-d',
      ],
      'recurrence_ends_on' => [
        'sometimes',
        'nullable',
        'date_format:Y-m-d',
        // Ensure it's after start_date if start_date is also being updated or exists
        // Using Rule::when for better conditional logic based on presence of start_date input
        Rule::when($this->filled('start_date'), 'after_or_equal:start_date', function ($input) {
          // Fallback: If start_date isn't in the input, compare against the existing task's start_date if it exists
          $existingStartDate = $this->route('task')?->start_date;
          return $existingStartDate ? 'after_or_equal:' . $existingStartDate->format('Y-m-d') : ''; // No rule if no start date found
        }),
      ],

      'available_from_time' => ['sometimes', 'nullable', 'date_format:H:i', 'required_with:available_to_time'],
      'available_to_time' => ['sometimes', 'nullable', 'date_format:H:i', 'after:available_from_time'],

      'completion_window_start' => ['sometimes', 'nullable', 'date_format:H:i', 'required_with:completion_window_end'],
      'completion_window_end' => ['sometimes', 'nullable', 'date_format:H:i', 'after:completion_window_start'],

      // Other fields
      'suggested_duration_minutes' => ['sometimes', 'nullable', 'integer', 'min:1'],
      'is_active' => ['sometimes', 'boolean'],

      // Child Assignment Validation (Updated)
      // Array itself can be nullable or omitted in updates if assignments aren't changing
      'assigned_children' => ['sometimes', 'nullable', 'array'],
      // Only validate items if the array itself is present and not null
      'assigned_children.*.id' => [
        // Use required_unless to make id required only if assigned_children is present and not null
        'required_unless:assigned_children,null',
        'integer',
        Rule::exists('children', 'id')->where(function ($query) {
          return $query->where('user_id', $this->user()->id); // Child must belong to parent
        }),
      ],
      // Assuming key 'token_reward' is sent from frontend
      'assigned_children.*.token_reward' => [
        'required_unless:assigned_children,null', // Required if the parent array item exists...
        Rule::requiredIf(fn() => $taskType === 'challenge'), // ...and specifically if type is 'challenge'
        'nullable', // Still allow null if type is 'routine'
        'integer',
        'min:0',
      ],
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    // Ensure recurrence_days is null if type doesn't require it
    $recurrenceType = $this->input('recurrence_type', $this->route('task')?->recurrence_type);
    if ($recurrenceType && !in_array($recurrenceType, ['weekly', 'monthly', 'custom'])) {
      // Only merge if the key exists or might be problematic; safer just to let validation handle it maybe
      if ($this->has('recurrence_days')) {
        // Only merge if actually sent
        $this->merge(['recurrence_days' => null]);
      }
    }

    // If assigned_children is sent as an empty array, validation might fail on *.id.
    // Controller logic should handle syncing an empty array correctly (detach all).
    // No specific preparation needed here usually.
  }
}
