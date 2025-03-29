<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use App\Models\TaskAssignment; // To create specific assignments
use Carbon\Carbon; // For dates

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all parent users (excluding maybe developer if you created one)
        $parents = User::whereDoesntHave('roles', fn($q) => $q->where('name', 'Developer'))->get();
        // If not using roles, just get all users: $parents = User::all();

        foreach ($parents as $parent) {
            // Create some Quests (Routines)
            Task::factory()->count(5)->quest()->recycle($parent)->create();

            // Create a daily quest for today's assignments
            $dailyQuest = Task::factory()
                ->daily()
                ->quest()
                ->recycle($parent)
                ->create([
                    'title' => 'Brush Teeth AM',
                    'completion_window_start' => '07:00',
                    'completion_window_end' => '09:00',
                    'is_mandatory' => true,
                ]);
            $dailyQuestPM = Task::factory()
                ->daily()
                ->quest()
                ->recycle($parent)
                ->create([
                    'title' => 'Brush Teeth PM',
                    'completion_window_start' => '19:00',
                    'completion_window_end' => '21:00',
                    'is_mandatory' => true,
                ]);

            // Create some Challenges (Token Earners)
            Task::factory()->count(3)->challenge()->recycle($parent)->create();

            // --- Create Specific Task Assignments for Today ---
            // This is simpler than running full recurrence logic in seeder
            $today = Carbon::today();
            foreach ($parent->children as $child) {
                if ($dailyQuest) {
                    TaskAssignment::factory()->create([
                        'task_id' => $dailyQuest->id,
                        'child_id' => $child->id,
                        'assigned_date' => $today,
                        'status' => 'pending',
                        'assigned_token_amount' => 0, // Quests have 0 direct tokens
                    ]);
                }
                if ($dailyQuestPM) {
                    TaskAssignment::factory()->create([
                        'task_id' => $dailyQuestPM->id,
                        'child_id' => $child->id,
                        'assigned_date' => $today,
                        'status' => 'pending',
                        'assigned_token_amount' => 0,
                    ]);
                }
                // Maybe assign one random challenge for today too?
                $randomChallenge = $parent->tasks()->where('type', 'challenge')->inRandomOrder()->first();
                if ($randomChallenge) {
                    TaskAssignment::factory()->create([
                        'task_id' => $randomChallenge->id,
                        'child_id' => $child->id,
                        'assigned_date' => $today,
                        'status' => 'pending',
                        'assigned_token_amount' => $randomChallenge->token_amount, // Use task's default
                    ]);
                }
            }
        }
    }
}
