<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // Import Rule
use Illuminate\Support\Facades\Auth; // Import Auth

class MarkTaskCompleteRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    // Basic authorization: User must be authenticated.
    // More specific authorization (task/child ownership) will be done in the controller.
    return Auth::check();
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      'task_id' => ['required', 'integer', Rule::exists('tasks', 'id')],
      'child_ids' => ['required', 'array'],
      // Ensure child IDs exist and belong to the authenticated user
      'child_ids.*' => [
        'required',
        'integer',
        Rule::exists('children', 'id')->where(function ($query) {
          $query->where('user_id', Auth::id());
        }),
      ],
    ];
  }
}
