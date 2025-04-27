<?php

namespace Database\Factories;

use App\Models\Child;
use App\Models\User; // Import User model
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class ChildFactory extends Factory
{
  protected $model = Child::class;

  // Define a list of possible colors
  protected $colors = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#E0BBE4', '#FEC8D8'];

  //   protected palette8Map: Record<string, string> = {
  //     'Sky Blue':   '#56A5EC',
  //     'Mint Green': '#34D399',
  //     'Coral Orange': '#FB923C',
  //     'Rose Pink':  '#F472B6',
  //     'Violet':     '#A78BFA',
  //     'Lemon Yellow': '#FACC15',
  //     'Cool Gray':  '#94A3B8',
  //     'Soft Red':   '#F87171'
  //   };

  protected $palette8Map = [
    'Sky Blue' => '#56A5EC',
    'Mint Green' => '#34D399',
    'Coral Orange' => '#FB923C',
    'Rose Pink' => '#F472B6',
    'Violet' => '#A78BFA',
  ];
  public function definition(): array
  {
    return [
      // Associate with a User (typically passed via 'for()')
      'user_id' => User::factory(), // Creates a new user if not specified otherwise
      'name' => fake()->firstName(),
      // Example PIN hashing (use a simple default or random)
      'pin_hash' => Hash::make(fake()->numerify('####')), // Random 4-digit PIN
      'token_balance' => fake()->numberBetween(0, 500),
      'avatar' => null, // Or generate fake avatar URL/path
      'color' => fake()->randomElement($this->palette8Map), // Assign a random color from the list
    ];
  }
}
