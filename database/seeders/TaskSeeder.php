<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use App\Models\TaskAssignment; // Import TaskAssignment
use Carbon\Carbon;
use Illuminate\Support\Str; // Keep Str if needed elsewhere, maybe not here anymore

class TaskSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $currentUser = User::first();

    if ($currentUser && $currentUser->children()->exists()) {
      // Full task definitions array
      $tasks = [
        [
          'title' => 'Do Homework',
          'description' => 'Complete all assigned homework.',
          'type' => 'routine',
          'needs_approval' => true,
          'is_collaborative' => false,
          'is_mandatory' => true,
          'recurrence_type' => 'weekly',
          'recurrence_days' => ['Mon', 'Wed', 'Fri'],
          'start_date' => now()->startOfDay(),
          'recurrence_ends_on' => now()->addWeeks(4),
          'available_from_time' => '16:00',
          'available_to_time' => '18:00',
          'suggested_duration_minutes' => 60,
          'is_active' => true,
        ],
        [
          'title' => 'Group Science Project',
          'description' => 'Work on the science project collaboratively.',
          'type' => 'challenge',
          'needs_approval' => false,
          'is_collaborative' => true,
          'is_mandatory' => false,
          'recurrence_type' => 'none',
          'recurrence_days' => [],
          'start_date' => now(),
          'recurrence_ends_on' => null,
          'available_from_time' => '10:00',
          'available_to_time' => '12:00',
          'suggested_duration_minutes' => 120,
          'is_active' => true,
        ],
        [
          'title' => 'Daily Reading',
          'description' => 'Read a book for 30 minutes.',
          'type' => 'routine',
          'needs_approval' => true,
          'is_collaborative' => false,
          'is_mandatory' => true,
          'recurrence_type' => 'daily',
          'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          'start_date' => now()->startOfDay(),
          'recurrence_ends_on' => now()->addWeeks(2),
          'available_from_time' => '20:00',
          'available_to_time' => '21:00',
          'suggested_duration_minutes' => 30,
          'is_active' => true,
        ],
        [
          'title' => 'Weekend Cleanup',
          'description' => 'Clean the house during the weekend.',
          'type' => 'routine',
          'needs_approval' => false,
          'is_collaborative' => true,
          'is_mandatory' => false,
          'recurrence_type' => 'weekly',
          'recurrence_days' => ['Sat', 'Sun'],
          'start_date' => now(),
          'recurrence_ends_on' => now()->addWeeks(6),
          'available_from_time' => '10:00',
          'available_to_time' => '12:00',
          'suggested_duration_minutes' => 120,
          'is_active' => true,
        ],
        [
          'title' => 'Morning Exercise',
          'description' => 'Do 15 minutes of morning exercise.',
          'type' => 'routine',
          'needs_approval' => false,
          'is_collaborative' => false,
          'is_mandatory' => true,
          'recurrence_type' => 'daily',
          'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          'start_date' => now(),
          'recurrence_ends_on' => now()->addWeeks(8),
          'available_from_time' => '07:00',
          'available_to_time' => '07:30',
          'suggested_duration_minutes' => 15,
          'is_active' => true,
        ],
        [
          'title' => 'Art Project',
          'description' => 'Work on an art project for school.',
          'type' => 'challenge',
          'needs_approval' => true,
          'is_collaborative' => true,
          'is_mandatory' => false,
          'recurrence_type' => 'none',
          'recurrence_days' => [],
          'start_date' => now(),
          'recurrence_ends_on' => null,
          'available_from_time' => '14:00',
          'available_to_time' => '16:00',
          'suggested_duration_minutes' => 120,
          'is_active' => true,
        ],
        [
          'title' => 'Gardening',
          'description' => 'Spend time gardening in the backyard.',
          'type' => 'routine',
          'needs_approval' => false,
          'is_collaborative' => true,
          'is_mandatory' => false,
          'recurrence_type' => 'weekly',
          'recurrence_days' => ['Sat'],
          'start_date' => now(),
          'recurrence_ends_on' => now()->addWeeks(10),
          'available_from_time' => '09:00',
          'available_to_time' => '10:00',
          'suggested_duration_minutes' => 60,
          'is_active' => true,
        ],
        [
          'title' => 'Music Practice',
          'description' => 'Practice playing a musical instrument.',
          'type' => 'routine',
          'needs_approval' => true,
          'is_collaborative' => false,
          'is_mandatory' => true,
          'recurrence_type' => 'daily',
          'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          'start_date' => now(),
          'recurrence_ends_on' => now()->addWeeks(3),
          'available_from_time' => '17:00',
          'available_to_time' => '18:00',
          'suggested_duration_minutes' => 45,
          'is_active' => true,
        ],
        // Additional test cases for various statuses (These might need adjustment if you rely on assignments for status)
        // Consider if these specific status examples are still needed or how to represent them
        // If you need specific past assignments for testing, you might add a separate section
        // after the main loop to create a few specific TaskAssignment records manually.
        [
          'title' => 'Completed Individual Task (Config)', // Renamed for clarity
          'description' => 'This task definition exists.',
          'type' => 'routine',
          'needs_approval' => true,
          'is_collaborative' => false,
          'is_mandatory' => false,
          'recurrence_type' => 'none',
          'recurrence_days' => [],
          'start_date' => now()->subDays(2), // Start date in the past
          'recurrence_ends_on' => null,
          'available_from_time' => '08:00',
          'available_to_time' => '17:00',
          'suggested_duration_minutes' => 30,
          'is_active' => true,
        ],
        [
          'title' => 'Approved Individual Task (Config)', // Renamed for clarity
          'description' => 'This task definition exists.',
          'type' => 'routine',
          'needs_approval' => true,
          'is_collaborative' => false,
          'is_mandatory' => false,
          'recurrence_type' => 'none',
          'recurrence_days' => [],
          'start_date' => now()->subDays(3), // Start date in the past
          'recurrence_ends_on' => null,
          'available_from_time' => '08:00',
          'available_to_time' => '17:00',
          'suggested_duration_minutes' => 30,
          'is_active' => true,
        ],
        [
          'title' => 'Overdue Task (Config)', // Renamed for clarity
          'description' => 'This task definition exists.',
          'type' => 'routine',
          'needs_approval' => true,
          'is_collaborative' => false,
          'is_mandatory' => true,
          'recurrence_type' => 'none',
          'recurrence_days' => [],
          'start_date' => now()->subDays(5)->startOfDay(), // Start date in the past
          'recurrence_ends_on' => null,
          'available_from_time' => '08:00',
          'available_to_time' => '17:00',
          'suggested_duration_minutes' => 45,
          'is_active' => true,
        ],
        [
          'title' => 'Completed Collaborative Task (Config)', // Renamed for clarity
          'description' => 'This task definition exists.',
          'type' => 'challenge',
          'needs_approval' => true,
          'is_collaborative' => true,
          'is_mandatory' => false,
          'recurrence_type' => 'none',
          'recurrence_days' => [],
          'start_date' => now()->subDays(2), // Start date in the past
          'recurrence_ends_on' => null,
          'available_from_time' => '10:00',
          'available_to_time' => '15:00',
          'suggested_duration_minutes' => 90,
          'is_active' => true,
        ],
        [
          'title' => 'Inactive Task',
          'description' => 'This task is currently inactive.',
          'type' => 'routine',
          'needs_approval' => false,
          'is_collaborative' => false,
          'is_mandatory' => false,
          'recurrence_type' => 'weekly',
          'recurrence_days' => ['Mon', 'Wed'],
          'start_date' => now(),
          'recurrence_ends_on' => now()->addWeeks(4),
          'available_from_time' => '12:00',
          'available_to_time' => '13:00',
          'suggested_duration_minutes' => 20,
          'is_active' => false, // Example inactive task
        ],
      ];

      $allChildren = $currentUser->children; // Get all children once
      $numberOfChildren = $allChildren->count(); // Count total children

      // Keep track of created tasks to query them later
      $createdTasks = collect();

      foreach ($tasks as $taskData) {
        // Ensure start_date is a Carbon instance
        $taskData['start_date'] = Carbon::parse($taskData['start_date']);
        // Ensure recurrence_ends_on is Carbon or null
        $taskData['recurrence_ends_on'] = $taskData['recurrence_ends_on'] ? Carbon::parse($taskData['recurrence_ends_on']) : null;

        // Create the Task definition
        // Use array_intersect_key to only pass columns that exist in the tasks table
        // This prevents errors if $taskData contains extra keys like 'assigned_children' from previous logic
        $fillableTaskData = array_intersect_key($taskData, array_flip((new Task())->getFillable()));
        $task = Task::factory()->create(array_merge($fillableTaskData, ['user_id' => $currentUser->id]));
        $createdTasks->push($task); // Store the created task

        // Prepare data for attaching children via pivot table
        $childSyncData = [];
        $childrenToAssign = collect(); // Use a collection to hold children to assign

        if ($taskData['is_collaborative']) {
          // Assign ALL children to collaborative tasks
          $childrenToAssign = $allChildren;
        } else {
          // Assign a RANDOM number (1 to total) of children to non-collaborative tasks
          if ($numberOfChildren > 0) {
            $numToAssign = rand(1, $numberOfChildren);
            // Select random children from the collection
            $childrenToAssign = $allChildren->random($numToAssign);
            // Ensure it's always a collection, even if only one is selected
            if (!$childrenToAssign instanceof \Illuminate\Database\Eloquent\Collection) {
              $childrenToAssign = collect([$childrenToAssign]);
            }
          }
        }

        // Prepare sync data for the selected children
        foreach ($childrenToAssign as $child) {
          $tokenReward = rand(5, 25); // Different random reward per child-task link
          $childSyncData[$child->id] = ['token_reward' => $tokenReward];
        }

        // Attach selected children to the task with their specific token reward
        if (!empty($childSyncData)) {
          $task->children()->sync($childSyncData);
        }

        // --- TaskAssignment creation logic removed ---
        // The cron job will handle creating assignments based on
        // Task definitions and the child_task pivot table.
      } // End foreach task

      // --- Generate Task Assignments for the next 5 days ---
      $this->command->info('Generating task assignments for the next 5 days...');
      $startDate = Carbon::today();
      $endDate = $startDate->copy()->addDays(4); // Today + 4 more days

      // Reload tasks with their children pivot data
      $tasksToAssign = Task::whereIn('id', $createdTasks->pluck('id'))
        ->where('is_active', true)
        ->with('children') // Eager load children with pivot data
        ->get();

      for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
        foreach ($tasksToAssign as $task) {
          // Check if the task runs on this specific date
          if ($task->runsOnDate($date)) {
            foreach ($task->children as $child) {
              // Create the TaskAssignment record
              TaskAssignment::factory()->create([
                'task_id' => $task->id,
                'child_id' => $child->id,
                'assigned_date' => $date->toDateString(),
                'due_date' => $date->copy()->endOfDay(), // Example: due end of assigned day
                'status' => 'pending', // Default status
                'assigned_token_amount' => $child->pivot->token_reward, // Get from pivot
                'collaborative_instance_id' => null, // Add logic if needed for collaborative
                'completed_at' => null,
                'approved_at' => null,
              ]);
            }
          }
        }
      }
      $this->command->info('Task assignments generated.');
      // --- End Task Assignment Generation ---

      // Optional: Add specific TaskAssignment records here for testing past statuses if needed
      // Example: Create a completed assignment for 'Completed Individual Task (Config)'
      // $completedTaskDef = Task::where('title', 'Completed Individual Task (Config)')->first();
      // if ($completedTaskDef && $currentUser->children->first()) {
      //     TaskAssignment::factory()->create([
      //         'task_id' => $completedTaskDef->id,
      //         'child_id' => $currentUser->children->first()->id,
      //         'assigned_date' => $completedTaskDef->start_date,
      //         'due_date' => $completedTaskDef->start_date->copy()->endOfDay(),
      //         'status' => 'completed',
      //         'assigned_token_amount' => $completedTaskDef->children->first()->pivot->token_reward ?? 10, // Get reward from pivot or default
      //         'completed_at' => now()->subDay(),
      //     ]);
      // }
    } else {
      $this->command->info('No user or no children found for the first user. Skipping task seeding.');
    }
  }
}
