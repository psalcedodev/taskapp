<?php

namespace Database\Factories;

use App\Models\Child;
use App\Models\Streak;
use Illuminate\Database\Eloquent\Factories\Factory;

class StreakFactory extends Factory
{
  protected $model = Streak::class;

  public function definition(): array
  {
    return [
      'child_id' => Child::factory(),
      'type' => fake()->randomElement(['daily_quest', 'weekdays_quest', 'weekends_quest']),
      'current_streak_count' => 0,
      'longest_streak_count' => 0,
      'last_streak_date' => null,
    ];
  }

  public function daily(): static
  {
    return $this->state(fn(array $attributes) => ['type' => 'daily_quest']);
  }

  public function weekdays(): static
  {
    return $this->state(fn(array $attributes) => ['type' => 'weekdays_quest']);
  }

  public function weekends(): static
  {
    return $this->state(fn(array $attributes) => ['type' => 'weekends_quest']);
  }
}
