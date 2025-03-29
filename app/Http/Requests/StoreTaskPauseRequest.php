<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreTaskPauseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'pause_start_date' => ['required', 'date_format:Y-m-d'],
            'pause_end_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:pause_start_date'],
            'reason' => ['nullable', 'string', 'max:255'],
            'task_id' => [
                'nullable', // Can apply to all tasks
                'integer',
                // Ensure task exists and belongs to the user
                Rule::exists('tasks', 'id')->where(function ($query) {
                    return $query->where('user_id', $this->user()->id);
                }),
            ],
            'child_id' => [
                'nullable', // Can apply to all children
                'integer',
                // Ensure child exists and belongs to the user
                Rule::exists('children', 'id')->where(function ($query) {
                    return $query->where('user_id', $this->user()->id);
                }),
            ],
            // --- TODO: If allowing multi-select children/tasks, validation needs changing ---
            // 'child_ids' => ['nullable', 'array'],
            // 'child_ids.*' => ['integer', Rule::exists...],
            // 'task_ids' => ['nullable', 'array'],
            // 'task_ids.*' => ['integer', Rule::exists...],
        ];
    }
}
