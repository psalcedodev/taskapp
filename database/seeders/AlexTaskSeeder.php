<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use App\Models\Child;
use App\Models\TaskAssignment;
use Carbon\Carbon;
use Illuminate\Support\Arr;

class AlexTaskSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $currentUser = User::first();
    if (!$currentUser) {
      $this->command->error('No user found. Cannot seed tasks for Alex.');
      return;
    }

    $this->command->info('Seeding tasks for Alexander...');

    // --- Create/Update Child: Alexander ---
    $alex = Child::updateOrCreate(
      [
        'user_id' => $currentUser->id,
        'name' => 'Alexander',
      ],
      [
        'color' => '#FF3131', // Fire Red
        'token_balance' => 0, // Start with 0 tokens
        // Add any other required fields for Child model with default values
        'pin_hash' => '1234', // Example if pin_hash is nullable
        'avatar' => null, // Example if avatar is nullable
      ],
    );
    $this->command->info("Ensured child 'Alexander' (ID: {$alex->id}) exists for user ID: {$currentUser->id}.");

    // --- Define Alex's Tasks ---
    $alexTaskDefinitions = [
      [
        'title' => 'Wake Up On Your Own',
        'description' => 'Wake up on your own and get ready for school.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '07:30',
        'available_to_time' => '08:05',
        'suggested_duration_minutes' => 35,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Brush Teeth (AM)',
        'description' => 'Brush teeth after waking up.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '08:00',
        'available_to_time' => '08:10',
        'suggested_duration_minutes' => 10,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Get Dressed',
        'description' => 'Get dressed for school.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '08:10',
        'available_to_time' => '08:20',
        'suggested_duration_minutes' => 10,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Eat Breakfast',
        'description' => 'Eat breakfast after getting dressed.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '08:20',
        'available_to_time' => '08:40',
        'suggested_duration_minutes' => 20,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Eat All Lunch at School',
        'description' => 'Report if you ate all your lunch at school today.',
        'type' => 'routine',
        'needs_approval' => false, // Needs approval to confirm
        'is_collaborative' => false,
        'is_mandatory' => false,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '15:30',
        'available_to_time' => '16:00',
        'suggested_duration_minutes' => 5,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Brush Teeth (PM)',
        'description' => 'Brush teeth before bed.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '20:00',
        'available_to_time' => '20:45',
        'suggested_duration_minutes' => 10,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Get Clothes Ready for Tomorrow',
        'description' => 'Lay out clothes ready for tomorrow morning.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '20:45',
        'available_to_time' => '21:00',
        'suggested_duration_minutes' => 15,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Go to Bed',
        'description' => 'Head to bed on time.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '21:00',
        'available_to_time' => '21:30',
        'suggested_duration_minutes' => 30,
        'is_active' => true,
        'token_reward' => 1,
      ],
    ];

    $createdAlexTasks = collect();

    // --- Create Tasks and Assign ONLY to Alex ---
    foreach ($alexTaskDefinitions as $taskData) {
      $tokenReward = $taskData['token_reward']; // Get reward from definition
      unset($taskData['token_reward']); // Remove before creating task

      $taskData['start_date'] = Carbon::parse($taskData['start_date']);
      $taskData['recurrence_ends_on'] = $taskData['recurrence_ends_on'] ? Carbon::parse($taskData['recurrence_ends_on']) : null;

      $fillableTaskData = Arr::only($taskData, (new Task())->getFillable());

      // Use updateOrCreate for the Task itself based on title and user
      $task = Task::updateOrCreate(
        [
          'user_id' => $currentUser->id,
          'title' => $taskData['title'],
        ],
        array_merge($fillableTaskData, ['user_id' => $currentUser->id]),
      );
      $createdAlexTasks->push($task);

      // Sync ONLY Alex to this task with the specified reward
      $task->children()->sync([$alex->id => ['token_reward' => $tokenReward]]);
      $this->command->info("Assigned '{$task->title}' to Alexander with reward: {$tokenReward}");

      // --- Generate Assignments for this task for the next 5 days ---
      $assignmentStartDate = Carbon::today();
      $assignmentEndDate = $assignmentStartDate->copy()->addDays(4); // Today + 4 days

      for ($date = $assignmentStartDate->copy(); $date->lte($assignmentEndDate); $date->addDay()) {
        if ($task->runsOnDate($date)) {
          TaskAssignment::updateOrCreate(
            [
              'task_id' => $task->id,
              'child_id' => $alex->id,
              'assigned_date' => $date->toDateString(),
            ],
            [
              'due_date' => $task->available_to_time ? $date->copy()->setTimeFromTimeString($task->available_to_time) : $date->copy()->endOfDay(),
              'status' => 'in_progress',
              'assigned_token_amount' => $tokenReward,
              'collaborative_instance_id' => null,
              'completed_at' => null,
              'approved_at' => null,
            ],
          );
        }
      }
    } // End foreach task definition

    $this->command->info('Finished seeding tasks and assignments for Alexander.');
  }
}
