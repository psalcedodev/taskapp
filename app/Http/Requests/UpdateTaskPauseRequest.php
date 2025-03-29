<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateTaskPauseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $pause = $this->route('task_pause'); // Route model binding name
        return Auth::check() && $pause && $pause->user_id === $this->user()->id;
        // return true; // If using controller/policy auth
    }

    public function rules(): array
    {
        // Use 'sometimes' for optional updates
        return [
            'pause_start_date' => ['sometimes', 'required', 'date_format:Y-m-d'],
            'pause_end_date' => [
                'sometimes',
                'required',
                'date_format:Y-m-d',
                // Compare against incoming or existing start date
                'after_or_equal:' . ($this->input('pause_start_date') ?? $this->route('task_pause')->pause_start_date?->format('Y-m-d')),
            ],
            'reason' => ['sometimes', 'nullable', 'string', 'max:255'],
            'task_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('tasks', 'id')->where(function ($query) {
                    return $query->where('user_id', $this->user()->id);
                }),
            ],
            'child_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('children', 'id')->where(function ($query) {
                    return $query->where('user_id', $this->user()->id);
                }),
            ],
            // TODO: Add validation if allowing update of multiple child/task links
        ];
    }
}
