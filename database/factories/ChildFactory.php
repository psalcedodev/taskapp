<?php

namespace Database\Factories;

use App\Models\Child;
use App\Models\User; // Import User model
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class ChildFactory extends Factory
{
    protected $model = Child::class;

    public function definition(): array
    {
        return [
            // Associate with a User (typically passed via 'for()')
            'user_id' => User::factory(), // Creates a new user if not specified otherwise
            'name' => fake()->firstName(),
            // Example PIN hashing (use a simple default or random)
            'pin_hash' => Hash::make('1234'), // Default PIN '1234' - CHANGE THIS
            'token_balance' => fake()->numberBetween(0, 500),
            'avatar' => null, // Or generate fake avatar URL/path
        ];
    }
}
