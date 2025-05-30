<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr; // For random array element

class TaskFactory extends Factory
{
  protected $model = Task::class;

  public function definition(): array
  {
    $type = fake()->randomElement(['routine', 'challenge']);
    $recurrence = fake()->randomElement(['none', 'daily', 'weekdays', 'weekends', 'custom']); // Keep it simple

    return [
      'user_id' => User::factory(),
      'title' => fake()->sentence(3),
      'description' => fake()->optional()->paragraph(1),
      'image_path' => null,
      'type' => $type,
      'needs_approval' => fake()->boolean(30), // 30% chance
      'is_collaborative' => false,
      'is_mandatory' => fake()->boolean(10), // 10% chance
      'recurrence_type' => $recurrence,
      'recurrence_days' =>
        $recurrence === 'custom'
          ? fake()->randomElements(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], fake()->numberBetween(1, 3)) // Use short day names consistent with seeder
          : null, // Store as array, model casts to collection
      'start_date' => $recurrence === 'none' ? fake()->dateTimeBetween('-1 week', '+1 week')->format('Y-m-d') : now()->startOfDay()->format('Y-m-d'), // Default start date for recurring
      // CORRECTED LINE: Uses nullsafe operator '?->'
      'recurrence_ends_on' => $recurrence !== 'none' ? fake()->optional(0.2)->dateTimeBetween('+1 month', '+6 months')?->format('Y-m-d') : null,
      'available_from_time' => fake()->optional()->time('H:i'), // Explicitly H:i
      'available_to_time' => null, // Add logic later if needed based on from_time
      'completion_window_start' => fake()->optional(0.2)->time('H:i'), // Explicitly H:i
      'completion_window_end' => null, // Add logic later if needed based on start_time
      'suggested_duration_minutes' => fake()->optional()->numberBetween(5, 60),
      'is_active' => true,
    ];
  }

  // --- Factory States ---

  public function daily(): static
  {
    return $this->state(fn(array $attributes) => ['recurrence_type' => 'daily', 'recurrence_days' => null]);
  }

  public function custom(array $days = ['Mon', 'Wed', 'Fri']): static
  {
    // Use short day names
    // Store as array, model casts to collection
    return $this->state(fn(array $attributes) => ['recurrence_type' => 'custom', 'recurrence_days' => $days]);
  }

  public function needsApproval(): static
  {
    return $this->state(fn(array $attributes) => ['needs_approval' => true]);
  }

  public function mandatory(): static
  {
    return $this->state(fn(array $attributes) => ['is_mandatory' => true]);
  }
}
