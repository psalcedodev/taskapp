<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DayViewTaskResource extends JsonResource
{
  /**
   * The assignment status calculated in the controller.
   * We need a way to pass this extra data to the resource.
   * Using a static property is one simple way for this context.
   *
   * @var string
   */
  public static $assignmentStatus = 'pending'; // Default

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
      'type' => $this->type,
      'needs_approval' => $this->needs_approval,
      'is_mandatory' => $this->is_mandatory, // Assumes this field exists on Task model
      'available_from_time' => $this->available_from_time,
      'available_to_time' => $this->available_to_time,
      'assignment_status' => static::$assignmentStatus, // Use the status passed statically
      'children' => $this->whenLoaded('children', function () {
        return $this->children
          ->map(function ($child) {
            return [
              'id' => $child->id,
              'name' => $child->name,
              'color' => $child->color,
              'avatar' => $child->avatar,
              'token_reward' => $child->pivot->token_reward ?? 0,
            ];
          })
          ->values();
      }),
    ];
  }
}
