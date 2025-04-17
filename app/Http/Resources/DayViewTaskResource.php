<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DayViewTaskResource extends JsonResource
{
  /**
   * The calculated assignment status for this specific task instance.
   *
   * @var string
   */
  protected string $calculatedStatus;

  /**
   * Create a new resource instance.
   *
   * @param mixed $resource The underlying resource model (Task)
   * @param string $status The calculated status for this task
   */
  public function __construct($resource, string $status)
  {
    parent::__construct($resource);
    $this->calculatedStatus = $status;
  }

  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    // Helper function to format time or return null
    $formatTime = function ($timeString) {
      if (empty($timeString)) {
        return null;
      }
      try {
        // Attempt to parse assuming HH:MM or HH:MM:SS format
        return Carbon::parse($timeString)->format('g:i A');
      } catch (\Exception $e) {
        // Return null or original string if parsing fails
        return null;
      }
    };

    return [
      'id' => $this->id,
      'title' => $this->title,
      'description' => $this->description,
      'type' => $this->type,
      'needs_approval' => $this->needs_approval,
      'is_mandatory' => $this->is_mandatory, // Assumes this field exists on Task model
      'available_from_time' => $formatTime($this->available_from_time),
      'available_to_time' => $formatTime($this->available_to_time),
      'available_to_time_raw' => $this->available_to_time,
      'assignment_status' => $this->calculatedStatus, // Use the status passed via constructor
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
