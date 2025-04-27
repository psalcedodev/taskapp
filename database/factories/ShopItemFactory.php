<?php

namespace Database\Factories;

use App\Models\ShopItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShopItemFactory extends Factory
{
  protected $model = ShopItem::class;

  public function definition(): array
  {
    return [
      'user_id' => User::factory(),
      'name' => fake()->words(3, true),
      'description' => fake()->optional()->sentence(),
      'image_path' => null, // Add fake image URL later if desired
      'stock' => fake()->numberBetween(1, 100),
      'token_cost' => fake()->numberBetween(25, 50),
      'needs_approval' => fake()->boolean(20), // 20% chance needs approval
      'is_limited_time' => false,
      'available_from' => null,
      'available_until' => null,
      'is_active' => true,
    ];
  }

  public function limitedTime(): static
  {
    return $this->state(
      fn(array $attributes) => [
        'is_limited_time' => true,
        'available_from' => now()->subDays(fake()->numberBetween(1, 3)),
        'available_until' => now()->addDays(fake()->numberBetween(2, 14)),
      ],
    );
  }
}
