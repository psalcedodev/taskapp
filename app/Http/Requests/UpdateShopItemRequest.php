<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateShopItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $shopItem = $this->route('shop_item'); // Route model binding name

        // Check ownership
        return Auth::check() && $shopItem && $shopItem->user_id == $this->user()->id;
        // return true; // Or rely on controller/policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Get current/incoming value for is_limited_time for conditional checks
        $isLimitedTime = $this->boolean('is_limited_time', $this->route('shop_item')->is_limited_time ?? false);

        return [
            // Use 'sometimes' to only validate fields present in the request
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:65535'],
            'image_path' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'token_cost' => ['sometimes', 'required', 'integer', 'min:1'],
            'needs_approval' => ['sometimes', 'boolean'],
            'is_limited_time' => ['sometimes', 'boolean'],
            'available_from' => [
                'sometimes', // Only validate if sent
                'nullable', // Allow setting back to null
                Rule::requiredIf($isLimitedTime), // Required if limited time is true
                'date',
            ],
            'available_until' => [
                'sometimes',
                'nullable',
                Rule::requiredIf($isLimitedTime),
                'date',
                // Ensure it's after start_date if start_date is also being updated or exists
                Rule::when(
                    $this->filled('available_from') || $this->route('shop_item')->available_from, // Check incoming or existing start date
                    'after_or_equal:' . ($this->input('available_from') ?? $this->route('shop_item')->available_from?->format('Y-m-d H:i:s')), // Compare against incoming or existing
                    function ($input) {
                        // Fallback if no start date exists (less likely needed here)
                        return '';
                    },
                ),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // If is_limited_time is explicitly set to false, nullify dates
        if ($this->has('is_limited_time') && $this->input('is_limited_time') == false) {
            $this->merge([
                'available_from' => null,
                'available_until' => null,
            ]);
        }
    }
}
