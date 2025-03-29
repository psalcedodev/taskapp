<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class RejectPurchaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Policy check handled in controller for simplicity here, or duplicate here.
     */
    public function authorize(): bool
    {
        // Basic check - controller does ownership check via policy
        return Auth::check();
        // Or:
        // $purchase = $this->route('purchase');
        // return Auth::check() && $purchase && $purchase->child->user_id === $this->user()->id;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'parent_notes' => ['nullable', 'string', 'max:1000'], // Reason for rejection
        ];
    }
}
