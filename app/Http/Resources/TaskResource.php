<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'title' => $this->title,
      'description' => $this->description,
      'token_amount' => $this->token_amount,
      'type' => $this->type,
      'needs_approval' => $this->needs_approval,
      'is_collaborative' => $this->is_collaborative,
      'recurrence_type' => $this->recurrence_type,
      'recurrence_days' => $this->recurrence_days,
      'start_date' => $this->start_date,
      'recurrence_ends_on' => $this->recurrence_ends_on,
      'available_from_time' => $this->available_from_time,
      'available_to_time' => $this->available_to_time,
      'completion_window_start' => $this->completion_window_start,
      'completion_window_end' => $this->completion_window_end,
      'suggested_duration_minutes' => $this->suggested_duration_minutes,
      'is_active' => $this->is_active,
      'assigned_to' => $this->assignments->map(function ($assignment) {
        return [
          'id' => $assignment->child->id,
          'name' => $assignment->child->name,
          'tokens' => $assignment->assigned_token_amount,
        ];
      }),
    ];
  }
}
