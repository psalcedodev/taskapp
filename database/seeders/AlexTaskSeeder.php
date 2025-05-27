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
use Illuminate\Support\Facades\Hash;

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
        'token_balance' => 74, // Start with 0 tokens
        // Add any other required fields for Child model with default values
        'pin_hash' => Hash::make('1234'),
        'avatar' => null, // Example if avatar is nullable
      ],
    );
    $this->command->info("Ensured child 'Alexander' (ID: {$alex->id}) exists for user ID: {$currentUser->id}.");

    // --- Define Alex's Tasks ---
    $alexTaskDefinitions = [
      [
        'title' => 'Wake Up & Do your bed',
        'description' => 'Wake up and get ready for the day.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '09:00',
        'available_to_time' => '09:30',
        'suggested_duration_minutes' => 30,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Brush Teeth & Wash Face',
        'description' => 'Brush teeth and wash face after waking up.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '09:30',
        'available_to_time' => '09:45',
        'suggested_duration_minutes' => 15,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Breakfast',
        'description' => 'Eat breakfast.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '09:45',
        'available_to_time' => '10:15',
        'suggested_duration_minutes' => 30,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Summer Study (Morning)',
        'description' => 'Morning summer study session.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '10:30',
        'available_to_time' => '11:00',
        'suggested_duration_minutes' => 30,
        'is_active' => true,
        'token_reward' => 2,
      ],
      [
        'title' => 'Play Time (Morning)',
        'description' => 'Morning play time.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => false,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '11:00',
        'available_to_time' => '12:30',
        'suggested_duration_minutes' => 90,
        'is_active' => true,
        'token_reward' => 0,
      ],
      [
        'title' => 'Lunch',
        'description' => 'Eat lunch.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '12:30',
        'available_to_time' => '13:30',
        'suggested_duration_minutes' => 60,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Quiet Time/TV',
        'description' => 'Quiet time or TV after lunch.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '13:30',
        'available_to_time' => '14:30',
        'suggested_duration_minutes' => 60,
        'is_active' => true,
        'token_reward' => 0,
      ],
      [
        'title' => 'Summer Study (Afternoon)',
        'description' => 'Afternoon summer study session.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '14:30',
        'available_to_time' => '15:45',
        'suggested_duration_minutes' => 75,
        'is_active' => true,
        'token_reward' => 2,
      ],
      [
        'title' => 'Play Time (Afternoon)',
        'description' => 'Afternoon play time.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => false,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '15:30',
        'available_to_time' => '17:30',
        'suggested_duration_minutes' => 120,
        'is_active' => true,
        'token_reward' => 0,
      ],
      [
        'title' => 'Family Time',
        'description' => 'Family time in the evening.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => false,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '17:30',
        'available_to_time' => '19:00',
        'suggested_duration_minutes' => 90,
        'is_active' => true,
        'token_reward' => 0,
      ],
      [
        'title' => 'Dinner',
        'description' => 'Eat dinner.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '19:30',
        'available_to_time' => '20:30',
        'suggested_duration_minutes' => 60,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Brush Teeth/Shower',
        'description' => 'Brush teeth and shower before bed.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '20:30',
        'available_to_time' => '21:00',
        'suggested_duration_minutes' => 15,
        'is_active' => true,
        'token_reward' => 1,
      ],
      [
        'title' => 'Karate Class Focus Reward (Tue)',
        'description' => 'Focus reward for Karate class on Tuesday.',
        'type' => 'routine',
        'needs_approval' => true,
        'is_collaborative' => false,
        'is_mandatory' => false,
        'recurrence_type' => 'custom',
        'recurrence_days' => ['Tue'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '17:50',
        'available_to_time' => '18:40',
        'suggested_duration_minutes' => 50,
        'is_active' => true,
        'token_reward' => 2,
      ],
      [
        'title' => 'Karate Class Focus Reward (Thu)',
        'description' => 'Focus reward for Karate class on Thursday.',
        'type' => 'routine',
        'needs_approval' => true,
        'is_collaborative' => false,
        'is_mandatory' => false,
        'recurrence_type' => 'custom',
        'recurrence_days' => ['Thu'],
        'start_date' => today(),
        'recurrence_ends_on' => null,
        'available_from_time' => '17:00',
        'available_to_time' => '17:50',
        'suggested_duration_minutes' => 50,
        'is_active' => true,
        'token_reward' => 2,
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
      //   $assignmentStartDate = Carbon::today();
      //   $assignmentEndDate = $assignmentStartDate->copy()->addDays(4); // Today + 4 days

      //   for ($date = $assignmentStartDate->copy(); $date->lte($assignmentEndDate); $date->addDay()) {
      //     if ($task->runsOnDate($date)) {
      //       TaskAssignment::updateOrCreate(
      //         [
      //           'task_id' => $task->id,
      //           'child_id' => $alex->id,
      //           'assigned_date' => $date->toDateString(),
      //         ],
      //         [
      //           'due_date' => $task->available_to_time ? $date->copy()->setTimeFromTimeString($task->available_to_time) : $date->copy()->endOfDay(),
      //           'status' => 'in_progress',
      //           'assigned_token_amount' => $tokenReward,
      //           'collaborative_instance_id' => null,
      //           'completed_at' => null,
      //           'approved_at' => null,
      //         ],
      //       );
      //     }
      //   }
    } // End foreach task definition

    $this->command->info('Finished seeding tasks and assignments for Alexander.');
  }
}
