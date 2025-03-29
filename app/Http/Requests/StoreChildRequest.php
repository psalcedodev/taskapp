<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password; // Can use for PIN complexity

class StoreChildRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Any authenticated user (parent) can add a child to their own account
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
            'name' => ['required', 'string', 'max:100'],
            'pin' => [
                'required',
                'string',
                'digits:4', // Enforce 4 digits, adjust if needed
                // 'confirmed', // Add this if you have a 'pin_confirmation' field in your form
                // Optional: Add complexity rule if desired
                // Password::min(4)->numbers(),
            ],
            // 'pin_confirmation' => ['required_with:pin'], // If using 'confirmed' rule
            'avatar' => ['nullable', 'string', 'max:2048'], // Or image validation rules
            'token_balance' => ['sometimes', 'integer', 'min:0'], // Usually starts at 0
        ];
    }

    /**
     * Prepare the data for validation.
     * Set initial token balance if not provided.
     */
    protected function prepareForValidation(): void
    {
        $this->mergeIfMissing([
            'token_balance' => 0,
        ]);
    }
}
