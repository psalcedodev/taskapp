<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Child; // Import Child
use App\Models\Streak; // Import Streak

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $parent = User::factory()->create([
            'name' => 'Parent User',
            'email' => 'parent@example.com', // Easy login email
        ]);

        User::factory()
            ->developer() // Use the state to assign the 'Developer' role
            ->create([
                'name' => 'Dev Admin', // Customize name
                'email' => 'dev@example.com', // Customize email
                // Password defaults to 'password' unless overridden here
                // 'password' => Hash::make('your_dev_password'),
            ]);

        // Create children for this parent and initial streaks for them
        Child::factory()
            ->count(2)
            ->recycle($parent) // Recycle the parent instead of creating new ones
            ->afterCreating(function (Child $child) {
                // Create initial streak records for each child
                Streak::factory()->daily()->recycle($child)->create();
                Streak::factory()->weekly()->recycle($child)->create();
            })
            ->create();

        // Create a specific Developer user (Optional, if using roles)
        // $developer = User::factory()->developer()->create([ // Assuming 'developer' state exists
        //     'name' => 'Dev User',
        //     'email' => 'dev@example.com',
        // ]);

        // Create a few other random parent users with children and streaks
        User::factory()
            ->count(3)
            ->has(
                Child::factory()
                    ->count(fake()->numberBetween(1, 3)) // Each parent has 1-3 kids
                    ->afterCreating(function (Child $child) {
                        Streak::factory()->daily()->recycle($child)->create();
                        Streak::factory()->weekly()->recycle($child)->create();
                    }),
            )
            ->create();

        $this->call([
            TaskSeeder::class, // Creates Tasks and some sample Assignments for today
            ShopItemSeeder::class, // Creates Shop Items
            // Add other seeders like PurchaseSeeder if needed
        ]);
    }
}
