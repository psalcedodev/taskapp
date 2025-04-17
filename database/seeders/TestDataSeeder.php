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

// Renamed from TaskSeeder to preserve test data
class TestDataSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $currentUser = User::where('email', 'parent@example.com')->first();

    if (!$currentUser || !$currentUser->children()->exists()) {
      $this->command->info('No user or no children found for the first user. Skipping test data seeding.');
      return;
    }

    $this->command->info('Seeding Test Tasks and Assignments...');

    $allChildren = $currentUser->children->keyBy('id'); // Key by ID for easier access
    $numberOfChildren = $allChildren->count();
    $nextChildIndex = 0; // To cycle through children for individual tasks

    // --- 1. Define Core Task Definitions ---
    $taskDefinitions = [
      // --- Routines ---
      [
        'title' => 'Do Homework (Test)',
        'description' => 'Complete all assigned homework.',
        'type' => 'routine',
        'needs_approval' => true,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'weekly',
        'recurrence_days' => ['Mon', 'Wed', 'Fri'],
        'start_date' => now()->subWeek(),
        'recurrence_ends_on' => now()->addWeeks(4),
        'available_from_time' => '16:00',
        'available_to_time' => '18:00',
        'suggested_duration_minutes' => 60,
        'is_active' => true,
      ],
      [
        'title' => 'Daily Reading (Test)',
        'description' => 'Read a book for 30 minutes.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        'start_date' => now()->subDays(3),
        'recurrence_ends_on' => now()->addWeeks(2),
        'available_from_time' => '20:00',
        'available_to_time' => '21:00',
        'suggested_duration_minutes' => 30,
        'is_active' => true,
      ],
      [
        'title' => 'Morning Exercise (Test)',
        'description' => 'Do 15 minutes of morning exercise.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => false,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'start_date' => now()->subWeek(),
        'recurrence_ends_on' => null,
        'available_from_time' => '07:00',
        'available_to_time' => '07:30',
        'suggested_duration_minutes' => 15,
        'is_active' => true,
      ],
      [
        'title' => 'Music Practice (Test)',
        'description' => 'Practice playing a musical instrument.',
        'type' => 'routine',
        'needs_approval' => true,
        'is_collaborative' => false,
        'is_mandatory' => true,
        'recurrence_type' => 'daily',
        'recurrence_days' => ['Tue', 'Thu'],
        'start_date' => now()->subDays(10),
        'recurrence_ends_on' => now()->addWeeks(3),
        'available_from_time' => '17:00',
        'available_to_time' => '17:45',
        'suggested_duration_minutes' => 45,
        'is_active' => true,
      ],
      [
        'title' => 'Weekend Cleanup (Test)',
        'description' => 'Help clean the house.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => true,
        'is_mandatory' => false,
        'recurrence_type' => 'weekly',
        'recurrence_days' => ['Sat'],
        'start_date' => now()->subWeeks(2),
        'recurrence_ends_on' => now()->addWeeks(6),
        'available_from_time' => '10:00',
        'available_to_time' => '11:30',
        'suggested_duration_minutes' => 90,
        'is_active' => true,
      ],
      [
        'title' => 'Gardening Help (Test)',
        'description' => 'Help with gardening tasks.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => true,
        'is_mandatory' => false,
        'recurrence_type' => 'weekly',
        'recurrence_days' => ['Sun'],
        'start_date' => now()->subWeek(),
        'recurrence_ends_on' => null,
        'available_from_time' => '09:00',
        'available_to_time' => '10:00',
        'suggested_duration_minutes' => 60,
        'is_active' => true,
      ],
      // --- Challenges ---
      [
        'title' => 'Group Science Project (Test)',
        'description' => 'Work on the science project collaboratively.',
        'type' => 'challenge',
        'needs_approval' => false,
        'is_collaborative' => true,
        'is_mandatory' => false,
        'recurrence_type' => 'none',
        'recurrence_days' => [],
        'start_date' => now()->addDays(2),
        'recurrence_ends_on' => null,
        'available_from_time' => '10:00',
        'available_to_time' => '12:00',
        'suggested_duration_minutes' => 120,
        'is_active' => true,
      ],
      [
        'title' => 'Build a Fort (Test)',
        'description' => 'Build an awesome fort together!',
        'type' => 'challenge',
        'needs_approval' => false,
        'is_collaborative' => true,
        'is_mandatory' => false,
        'recurrence_type' => 'none',
        'recurrence_days' => [],
        'start_date' => now()->addDay(),
        'recurrence_ends_on' => null,
        'available_from_time' => '14:00',
        'available_to_time' => '16:00',
        'suggested_duration_minutes' => 120,
        'is_active' => true,
      ],
      // --- Individual Tasks (specifically for status tests later) ---
      [
        'title' => 'Solo Math Challenge (Test)',
        'description' => 'Complete the extra math worksheet.',
        'type' => 'challenge',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => false,
        'recurrence_type' => 'none',
        'recurrence_days' => [],
        'start_date' => now()->subDays(4),
        'recurrence_ends_on' => null,
        'available_from_time' => '15:00',
        'available_to_time' => '16:00',
        'suggested_duration_minutes' => 30,
        'is_active' => true,
      ],
      [
        'title' => 'Write Short Story (Test)',
        'description' => 'Write a one-page short story.',
        'type' => 'challenge',
        'needs_approval' => true,
        'is_collaborative' => false,
        'is_mandatory' => false,
        'recurrence_type' => 'none',
        'recurrence_days' => [],
        'start_date' => now()->subDays(3),
        'recurrence_ends_on' => null,
        'available_from_time' => '11:00',
        'available_to_time' => '12:00',
        'suggested_duration_minutes' => 60,
        'is_active' => true,
      ],
      // --- Inactive Task ---
      [
        'title' => 'Old Reading Task (Test)',
        'description' => 'This task is no longer active.',
        'type' => 'routine',
        'needs_approval' => false,
        'is_collaborative' => false,
        'is_mandatory' => false,
        'recurrence_type' => 'weekly',
        'recurrence_days' => ['Mon'],
        'start_date' => now()->subMonths(2),
        'recurrence_ends_on' => now()->subMonth(),
        'available_from_time' => '12:00',
        'available_to_time' => '13:00',
        'suggested_duration_minutes' => 20,
        'is_active' => false,
      ],
    ];

    $createdTasks = collect(); // Keep track of created Task models
    $taskChildPivotData = []; // Store [taskId => [childId => reward]] for assignment creation

    // --- 2. Create Tasks and Assign Children ---
    $this->command->info('Creating test tasks and assigning children...');
    $childrenArray = $allChildren->values()->all(); // Get children as a simple array for cycling

    foreach ($taskDefinitions as $taskData) {
      $taskData['start_date'] = Carbon::parse($taskData['start_date']);
      $taskData['recurrence_ends_on'] = $taskData['recurrence_ends_on'] ? Carbon::parse($taskData['recurrence_ends_on']) : null;

      $fillableTaskData = Arr::only($taskData, (new Task())->getFillable());
      $task = Task::factory()->create(array_merge($fillableTaskData, ['user_id' => $currentUser->id]));
      $createdTasks->push($task);

      $childSyncData = [];
      $childrenToAssign = collect();

      if ($taskData['is_collaborative']) {
        $childrenToAssign = $allChildren;
      } elseif ($numberOfChildren > 0) {
        // Assign individual task to the next child in the cycle
        $assignedChild = $childrenArray[$nextChildIndex % $numberOfChildren];
        $childrenToAssign = collect([$assignedChild]);
        $nextChildIndex++; // Move to the next child for the next individual task
      }

      $taskChildPivotData[$task->id] = [];
      foreach ($childrenToAssign as $child) {
        $tokenReward = rand(5, 25);
        $childSyncData[$child->id] = ['token_reward' => $tokenReward];
        $taskChildPivotData[$task->id][$child->id] = $tokenReward; // Store for assignments
      }

      if (!empty($childSyncData)) {
        $task->children()->sync($childSyncData);
      }
    }

    // --- 3. Generate Future Assignments (Next 5 Days) ---
    $this->command->info('Generating future test task assignments (next 5 days)...');
    $startDate = Carbon::today();
    $endDate = $startDate->copy()->addDays(4);

    // Reload tasks with children pivot data for efficiency
    $activeTasks = Task::whereIn('id', $createdTasks->pluck('id'))->where('is_active', true)->get();
    // Note: We stored pivot data in $taskChildPivotData, no need to eager load `children` here

    for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
      foreach ($activeTasks as $task) {
        if ($task->runsOnDate($date) && isset($taskChildPivotData[$task->id])) {
          foreach ($taskChildPivotData[$task->id] as $childId => $reward) {
            // Use updateOrCreate to avoid duplicates if seeder runs multiple times
            TaskAssignment::updateOrCreate(
              [
                'task_id' => $task->id,
                'child_id' => $childId,
                'assigned_date' => $date->toDateString(),
              ],
              [
                'due_date' => $task->available_to_time ? $date->copy()->setTimeFromTimeString($task->available_to_time) : $date->copy()->endOfDay(),
                'status' => 'in_progress',
                'assigned_token_amount' => $reward,
                'collaborative_instance_id' => null, // Add logic if needed
                'completed_at' => null,
                'approved_at' => null,
              ],
            );
          }
        }
      }
    }

    // --- 4. Generate Specific Past/Status Assignments ---
    $this->command->info('Generating specific past/status test assignments...');

    if ($numberOfChildren > 0) {
      $child1 = $childrenArray[0]; // Use the first child for specific tests
      $child2 = $numberOfChildren > 1 ? $childrenArray[1] : $child1; // Use second or first if only one

      // --- Scenario: Completed (No Approval Needed) ---
      $completedTaskDef = Task::where('title', 'Morning Exercise (Test)')->first(); // Needs_approval = false
      if ($completedTaskDef && isset($taskChildPivotData[$completedTaskDef->id][$child1->id])) {
        TaskAssignment::updateOrCreate(
          [
            'task_id' => $completedTaskDef->id,
            'child_id' => $child1->id,
            'assigned_date' => now()->subDays(2)->toDateString(),
          ],
          [
            'status' => 'completed',
            'completed_at' => now()->subDays(2)->addHours(1), // Completed same day
            'assigned_token_amount' => $taskChildPivotData[$completedTaskDef->id][$child1->id],
            'due_date' => $completedTaskDef->available_to_time
              ? now()->subDays(2)->setTimeFromTimeString($completedTaskDef->available_to_time)
              : now()->subDays(2)->endOfDay(),
            'approved_at' => null,
          ],
        );
      }

      // --- Scenario: Pending Approval ---
      $pendingTaskDef = Task::where('title', 'Write Short Story (Test)')->first(); // Needs_approval = true
      if ($pendingTaskDef && isset($taskChildPivotData[$pendingTaskDef->id][$child1->id])) {
        TaskAssignment::updateOrCreate(
          [
            'task_id' => $pendingTaskDef->id,
            'child_id' => $child1->id,
            'assigned_date' => now()->subDays(3)->toDateString(), // Matches task start date
          ],
          [
            'status' => 'pending_approval',
            'completed_at' => now()->subDays(3)->addHours(2),
            'assigned_token_amount' => $taskChildPivotData[$pendingTaskDef->id][$child1->id],
            'due_date' => $pendingTaskDef->available_to_time
              ? now()->subDays(3)->setTimeFromTimeString($pendingTaskDef->available_to_time)
              : now()->subDays(3)->endOfDay(),
            'approved_at' => null,
          ],
        );
      }

      // --- Scenario: Approved ---
      $approvedTaskDef = Task::where('title', 'Music Practice (Test)')->first(); // Needs_approval = true
      if ($approvedTaskDef && isset($taskChildPivotData[$approvedTaskDef->id][$child2->id])) {
        // Assign to child 2
        TaskAssignment::updateOrCreate(
          [
            'task_id' => $approvedTaskDef->id,
            'child_id' => $child2->id,
            'assigned_date' => now()->subDays(5)->toDateString(), // An older date
          ],
          [
            'status' => 'approved',
            'completed_at' => now()->subDays(5)->addHours(1),
            'approved_at' => now()->subDays(4), // Approved the next day
            'assigned_token_amount' => $taskChildPivotData[$approvedTaskDef->id][$child2->id],
            'due_date' => $approvedTaskDef->available_to_time
              ? now()->subDays(5)->setTimeFromTimeString($approvedTaskDef->available_to_time)
              : now()->subDays(5)->endOfDay(),
          ],
        );
      }

      // --- Scenario: Rejected (Example using Homework task) ---
      $rejectedTaskDef = Task::where('title', 'Do Homework (Test)')->first(); // Needs_approval = true
      if ($rejectedTaskDef && isset($taskChildPivotData[$rejectedTaskDef->id][$child1->id])) {
        TaskAssignment::updateOrCreate(
          [
            'task_id' => $rejectedTaskDef->id,
            'child_id' => $child1->id,
            'assigned_date' => now()->subDays(6)->next(Carbon::MONDAY)->toDateString(), // Assign on a past Monday
          ],
          [
            'status' => 'rejected',
            'completed_at' => now()->subDays(6)->next(Carbon::MONDAY)->addHours(2),
            'approved_at' => null, // Not approved
            'assigned_token_amount' => $taskChildPivotData[$rejectedTaskDef->id][$child1->id],
            'due_date' => $rejectedTaskDef->available_to_time
              ? now()->subDays(6)->next(Carbon::MONDAY)->setTimeFromTimeString($rejectedTaskDef->available_to_time)
              : now()->subDays(6)->next(Carbon::MONDAY)->endOfDay(),
          ],
        );
      }

      // --- Scenario: Missed (Overdue) ---
      $missedTaskDef = Task::where('title', 'Solo Math Challenge (Test)')->first(); // No recurrence
      if ($missedTaskDef && isset($taskChildPivotData[$missedTaskDef->id][$child1->id])) {
        TaskAssignment::updateOrCreate(
          [
            'task_id' => $missedTaskDef->id,
            'child_id' => $child1->id,
            'assigned_date' => now()->subDays(4)->toDateString(), // Matches task start date
          ],
          [
            'status' => 'in_progress', // Still in progress but assigned date is past
            'completed_at' => null,
            'approved_at' => null,
            'assigned_token_amount' => $taskChildPivotData[$missedTaskDef->id][$child1->id],
            'due_date' => $missedTaskDef->available_to_time
              ? now()->subDays(4)->setTimeFromTimeString($missedTaskDef->available_to_time)
              : now()->subDays(4)->endOfDay(),
          ],
        );
      }
    } else {
      $this->command->info('Skipping specific past status test assignments as no children found.');
    }

    $this->command->info('Test Task and Assignment seeding completed.');
  }
}
