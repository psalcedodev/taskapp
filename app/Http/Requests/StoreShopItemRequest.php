<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreShopItemRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    // Any authenticated user (parent) can create a shop item for themselves
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
      'name' => ['required', 'string', 'max:255'],
      'description' => ['nullable', 'string', 'max:65535'],
      'stock' => ['required', 'integer', 'min:0'],
      'image_path' => ['nullable', 'string', 'max:2048'], // Adjust as needed
      'token_cost' => ['required', 'integer', 'min:1'], // Min cost of 1? Or 0?
      'needs_approval' => ['sometimes', 'boolean'],
      'is_limited_time' => ['sometimes', 'boolean'],
      'available_from' => [
        'nullable',
        Rule::requiredIf(fn() => $this->input('is_limited_time') == true), // Required if limited time is checked
        'date', // Accepts various date/datetime formats
      ],
      'available_until' => [
        'nullable',
        Rule::requiredIf(fn() => $this->input('is_limited_time') == true),
        'date',
        'after_or_equal:available_from', // Must end on or after start date
      ],
      'is_active' => ['sometimes', 'boolean'],
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    // Set defaults for booleans if not present in the request
    $this->mergeIfMissing([
      'needs_approval' => false,
      'is_limited_time' => false,
      'is_active' => true,
    ]);

    // Ensure dates are null if not a limited time offer
    if ($this->input('is_limited_time') == false) {
      $this->merge([
        'available_from' => null,
        'available_until' => null,
      ]);
    }
  }
}
