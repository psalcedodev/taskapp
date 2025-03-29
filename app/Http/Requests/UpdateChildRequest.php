<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule; // Not strictly needed here yet but good practice
use Illuminate\Validation\Rules\Password;

class UpdateChildRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Get the child instance from the route parameter
        $child = $this->route('child');

        // User must be logged in and own the child record
        return Auth::check() && $child && $child->user_id === $this->user()->id;
        // return true; // Alternatively, if relying solely on controller/policy authorization
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Use 'sometimes' for fields that might not be updated every time
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'pin' => [
                'sometimes', // Only validate if 'pin' is present in the request
                'required', // If present, it must not be empty
                'string',
                'digits:4', // Enforce 4 digits
                // 'confirmed', // If using pin_confirmation
            ],
            // 'pin_confirmation' => ['required_with:pin'], // If using 'confirmed' rule
            'avatar' => ['sometimes', 'nullable', 'string', 'max:2048'], // Or image validation
            // Don't usually allow updating token balance directly here - use manual adjustment
            // 'token_balance' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
