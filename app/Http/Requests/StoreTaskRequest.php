<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
// Removed App\Models\Task import as it's not directly used here now

class StoreTaskRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return Auth::check();
  }

  /**
   * Get the validation rules that apply to the request.
   */
  public function rules(): array
  {
    return [
      'title' => ['required', 'string', 'max:255'],
      'description' => ['nullable', 'string', 'max:65535'],
      'image_path' => ['nullable', 'string', 'max:2048'],
      'type' => ['required', 'string', Rule::in(['routine', 'challenge'])],

      'needs_approval' => ['sometimes', 'boolean'],
      'is_collaborative' => ['sometimes', 'boolean'],
      'is_mandatory' => ['sometimes', 'boolean'],

      // Recurrence Rules
      'recurrence_type' => ['required', 'string', Rule::in(['none', 'daily', 'weekdays', 'weekends', 'custom'])],
      'recurrence_days' => [
        Rule::requiredIf(fn() => in_array($this->input('recurrence_type'), ['weekdays', 'weekends', 'custom'])),
        'nullable',
        'array',
      ],
      'recurrence_days.*' => ['string', 'distinct'], // Basic check

      'start_date' => [Rule::requiredIf(fn() => $this->input('recurrence_type') === 'none'), 'nullable', 'date_format:Y-m-d'],
      'recurrence_ends_on' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],

      'available_from_time' => ['nullable', 'date_format:H:i:s', 'required_with:available_to_time'],
      'available_to_time' => ['nullable', 'date_format:H:i:s', 'after:available_from_time'],

      'completion_window_start' => ['nullable', 'date_format:H:i', 'required_with:completion_window_end'],
      'completion_window_end' => ['nullable', 'date_format:H:i', 'after:completion_window_start'],

      'suggested_duration_minutes' => ['nullable', 'integer', 'min:1'],
      'is_active' => ['sometimes', 'boolean'],

      'assigned_children' => ['required', 'array', 'min:1'], // Must assign to at least one child
      'assigned_children.*.id' => [
        'required',
        'integer',
        Rule::exists('children', 'id')->where(function ($query) {
          return $query->where('user_id', $this->user()->id); // Child must belong to parent
        }),
      ],
      'assigned_children.*.token_reward' => [
        'nullable',
        'integer',
        'min:0',
        // Required specifically when creating a 'challenge' type task
        Rule::requiredIf(fn() => $this->input('type') === 'challenge'),
      ],
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    // Set defaults if needed
    $this->mergeIfMissing([
      'needs_approval' => false,
      'is_collaborative' => false,
      'is_mandatory' => false,
      'is_active' => true,
    ]);

    // Ensure recurrence_days is null if not applicable type
    if (!in_array($this->input('recurrence_type'), ['weekdays', 'weekends', 'custom'])) {
      $this->merge(['recurrence_days' => null]);
    }

    // --- Ensure token_reward is set to 0 for routines if not provided ---
    // We might handle this default when processing *after* validation instead,
    // or ensure the frontend always sends 0 for routines if no specific small amount is intended.
    // Let's assume the controller/service handles setting default 0 if needed.
  }

  /**
   * Get custom messages for validation errors.
   * Optional: Provide user-friendly messages.
   *
   * @return array
   */
  // public function messages(): array
  // {
  //     return [
  //         'assigned_children.required' => 'Please assign the task to at least one child.',
  //         'assigned_children.min' => 'Please assign the task to at least one child.',
  //         'assigned_children.*.id.required' => 'Child selection is missing.',
  //         'assigned_children.*.id.exists' => 'Invalid child selected.',
  //         'assigned_children.*.token_reward.required' => 'A token reward is required for each child on a Challenge.',
  //     ];
  // }
}
