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
        $type = fake()->randomElement(['quest', 'challenge']);
        $recurrence = fake()->randomElement(['none', 'daily', 'weekly']); // Keep it simple

        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(1),
            'image_path' => null,
            'token_amount' => $type === 'challenge' ? fake()->numberBetween(5, 50) : 0,
            'type' => $type,
            'needs_approval' => fake()->boolean(30), // 30% chance
            'is_collaborative' => false,
            'is_mandatory' => fake()->boolean(10), // 10% chance
            'recurrence_type' => $recurrence,
            'recurrence_days' =>
                $recurrence === 'weekly'
                    ? json_encode(fake()->randomElements(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], fake()->numberBetween(1, 3)))
                    : null,
            'start_date' => $recurrence === 'none' ? fake()->dateTimeBetween('-1 week', '+1 week')->format('Y-m-d') : null,
            // CORRECTED LINE: Uses nullsafe operator '?->'
            'recurrence_ends_on' => $recurrence !== 'none' ? fake()->optional(0.2)->dateTimeBetween('+1 month', '+6 months')?->format('Y-m-d') : null,
            'available_from_time' => fake()->optional()->time('H:i'),
            'available_to_time' => null, // Add logic later if needed based on from_time
            'completion_window_start' => fake()->optional(0.2)->time('H:i'),
            'completion_window_end' => null, // Add logic later if needed based on start_time
            'suggested_duration_minutes' => fake()->optional()->numberBetween(5, 60),
            'is_active' => true,
        ];
    }

    // --- Factory States ---
    public function quest(): static
    {
        return $this->state(fn(array $attributes) => ['type' => 'quest', 'token_amount' => 0]);
    }

    public function challenge(): static
    {
        return $this->state(fn(array $attributes) => ['type' => 'challenge', 'token_amount' => fake()->numberBetween(5, 50)]);
    }

    public function daily(): static
    {
        return $this->state(fn(array $attributes) => ['recurrence_type' => 'daily', 'recurrence_days' => null]);
    }

    public function weekly(array $days = ['MON', 'WED', 'FRI']): static
    {
        return $this->state(fn(array $attributes) => ['recurrence_type' => 'weekly', 'recurrence_days' => json_encode($days)]);
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
