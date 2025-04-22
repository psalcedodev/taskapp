<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class TaskDetailResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    Log::info('TaskDetailResource', ['task' => $this]);
    return [
      // Include all original task attributes
      'id' => $this->id,
      'title' => $this->title,
      'description' => $this->description,
      'type' => $this->type,
      'needs_approval' => $this->needs_approval,
      'is_collaborative' => $this->is_collaborative,
      'is_mandatory' => $this->is_mandatory,
      'recurrence_type' => $this->recurrence_type,
      'recurrence_days' => $this->recurrence_days,
      'start_date' => $this->start_date, // Keep original format from model (likely Carbon or string)
      'recurrence_ends_on' => $this->recurrence_ends_on,
      'available_from_time' => $this->available_from_time,
      'available_to_time' => $this->available_to_time,
      'completion_window_start' => $this->completion_window_start,
      'completion_window_end' => $this->completion_window_end,
      'suggested_duration_minutes' => $this->suggested_duration_minutes,
      'is_active' => $this->is_active,
      'created_at' => $this->created_at,
      'updated_at' => $this->updated_at,
      'user_id' => $this->user_id,

      // Map the 'children' relationship to 'assigned_children' key
      'assigned_children' => $this->whenLoaded('children', function () {
        return $this->children->map(function ($child) {
          return [
            'id' => $child->id,
            'name' => $child->name,
            // Access pivot data
            'token_reward' => $child->pivot->token_reward,
          ];
        });
      }),
    ];
  }
}
