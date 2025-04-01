<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
  /**
   * The current password being used by the factory.
   */
  protected static ?string $password;

  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'name' => fake()->name(),
      'email' => fake()->unique()->safeEmail(),
      'email_verified_at' => now(),
      'password' => (static::$password ??= Hash::make('password')),
      'remember_token' => Str::random(10),
    ];
  }

  /**
   * Indicate that the model's email address should be unverified.
   */
  public function unverified(): static
  {
    return $this->state(
      fn(array $attributes) => [
        'email_verified_at' => null,
      ],
    );
  }

  /**
   * Configure the factory to assign roles after creating the user.
   * Example using Spatie Permissions.
   */
  public function configure(): static
  {
    // Uncomment if using Spatie
    return $this->afterCreating(function (User $user) {
      // Assign 'User' role by default
      if (!$user->hasRole('User')) {
        $userRole = Role::firstOrCreate(['name' => 'user']);
        $user->assignRole($userRole);
      }
    });
  }

  /**
   * Indicate that the user is a developer/admin.
   */
  public function developer(): static
  {
    // Uncomment if using Spatie
    return $this->afterCreating(function (User $user) {
      $devRole = Role::firstOrCreate(['name' => 'developer']);
      $user->assignRole($devRole);
    });
  }
}
