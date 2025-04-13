<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use App\Models\TaskAssignment; // To create specific assignments
use Carbon\Carbon; // For dates
use Illuminate\Support\Str;

class TaskSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Get the current user (for testing purposes, assuming the first user is the current user)
    $currentUser = User::first();

    if ($currentUser && $currentUser->children()->exists()) {
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
          'start_date' => now(),
          'recurrence_ends_on' => now()->addWeeks(4),
          'completion_window_start' => '16:00',
          'completion_window_end' => '18:00',
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
          'completion_window_start' => '10:00',
          'completion_window_end' => '12:00',
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
          'start_date' => now(),
          'recurrence_ends_on' => now()->addWeeks(2),
          'completion_window_start' => '20:00',
          'completion_window_end' => '21:00',
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
          'completion_window_start' => '10:00',
          'completion_window_end' => '12:00',
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
          'completion_window_start' => '07:00',
          'completion_window_end' => '07:30',
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
          'completion_window_start' => '14:00',
          'completion_window_end' => '16:00',
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
          'completion_window_start' => '09:00',
          'completion_window_end' => '10:00',
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
          'completion_window_start' => '17:00',
          'completion_window_end' => '18:00',
          'suggested_duration_minutes' => 45,
          'is_active' => true,
        ],
        // Additional test cases for various statuses
        [
          'title' => 'Completed Individual Task',
          'description' => 'This task is already completed.',
          'type' => 'routine',
          'needs_approval' => true,
          'is_collaborative' => false,
          'is_mandatory' => false,
          'recurrence_type' => 'none',
          'recurrence_days' => [],
          'start_date' => now()->subDays(2),
          'recurrence_ends_on' => null,
          'completion_window_start' => '08:00',
          'completion_window_end' => '17:00',
          'suggested_duration_minutes' => 30,
          'is_active' => true,
        ],
        [
          'title' => 'Approved Individual Task',
          'description' => 'This task is completed and approved.',
          'type' => 'routine',
          'needs_approval' => true,
          'is_collaborative' => false,
          'is_mandatory' => false,
          'recurrence_type' => 'none',
          'recurrence_days' => [],
          'start_date' => now()->subDays(3),
          'recurrence_ends_on' => null,
          'completion_window_start' => '08:00',
          'completion_window_end' => '17:00',
          'suggested_duration_minutes' => 30,
          'is_active' => true,
        ],
        [
          'title' => 'Overdue Task',
          'description' => 'This task is past its due date.',
          'type' => 'routine',
          'needs_approval' => true,
          'is_collaborative' => false,
          'is_mandatory' => true,
          'recurrence_type' => 'none',
          'recurrence_days' => [],
          'start_date' => now()->subDays(5),
          'recurrence_ends_on' => null,
          'completion_window_start' => '08:00',
          'completion_window_end' => '17:00',
          'suggested_duration_minutes' => 45,
          'is_active' => true,
        ],
        [
          'title' => 'Completed Collaborative Task',
          'description' => 'This collaborative task is already completed.',
          'type' => 'challenge',
          'needs_approval' => true,
          'is_collaborative' => true,
          'is_mandatory' => false,
          'recurrence_type' => 'none',
          'recurrence_days' => [],
          'start_date' => now()->subDays(2),
          'recurrence_ends_on' => null,
          'completion_window_start' => '10:00',
          'completion_window_end' => '15:00',
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
          'completion_window_start' => '12:00',
          'completion_window_end' => '13:00',
          'suggested_duration_minutes' => 20,
          'is_active' => false,
        ],
      ];

      foreach ($tasks as $taskData) {
        $task = Task::factory()->create(array_merge($taskData, ['user_id' => $currentUser->id]));

        if ($taskData['is_collaborative']) {
          // Create one collaborative instance ID for each collaborative task
          $collaborativeInstanceId = Str::uuid()->toString();

          foreach ($currentUser->children as $child) {
            // Set different statuses for the completed collaborative task example
            $status = 'pending';
            $completedAt = null;
            $approvedAt = null;

            if ($taskData['title'] === 'Completed Collaborative Task') {
              $status = 'completed';
              $completedAt = now()->subDay();

              if ($taskData['needs_approval']) {
                $approvedAt = now()->subHours(6);
                $status = 'approved';
              }
            }

            TaskAssignment::factory()->create([
              'task_id' => $task->id,
              'child_id' => $child->id,
              'assigned_date' => $taskData['start_date'],
              'due_date' => $taskData['start_date']->copy()->addDays(1),
              'status' => $status,
              'assigned_token_amount' => rand(1, 10),
              'collaborative_instance_id' => $collaborativeInstanceId,
              'completed_at' => $completedAt,
              'approved_at' => $approvedAt,
            ]);
          }
        } else {
          // For recurring tasks, create assignments for each recurrence day
          if (!empty($taskData['recurrence_days'])) {
            foreach ($taskData['recurrence_days'] as $day) {
              $assignedDate = Carbon::parse("next $day")->startOfDay();
              $dueDate = $assignedDate->copy()->endOfDay();

              foreach ($currentUser->children as $child) {
                // Default status
                $status = 'pending';
                $completedAt = null;
                $approvedAt = null;

                // Set specific statuses for test cases
                if ($taskData['title'] === 'Completed Individual Task') {
                  $status = 'completed';
                  $completedAt = now()->subDay();
                } elseif ($taskData['title'] === 'Approved Individual Task') {
                  $status = 'approved';
                  $completedAt = now()->subDays(2);
                  $approvedAt = now()->subDay();
                } elseif ($taskData['title'] === 'Overdue Task') {
                  $assignedDate = now()->subDays(5);
                  $dueDate = now()->subDays(4);
                }

                TaskAssignment::factory()->create([
                  'task_id' => $task->id,
                  'child_id' => $child->id,
                  'assigned_date' => $assignedDate,
                  'due_date' => $dueDate,
                  'status' => $status,
                  'assigned_token_amount' => rand(1, 10),
                  'collaborative_instance_id' => null,
                  'completed_at' => $completedAt,
                  'approved_at' => $approvedAt,
                ]);
              }
            }
          } else {
            // For non-recurring tasks
            foreach ($currentUser->children as $child) {
              // Default status
              $status = 'pending';
              $completedAt = null;
              $approvedAt = null;
              $assignedDate = $taskData['start_date'];
              $dueDate = $assignedDate->copy()->addDay();

              // Set specific statuses for test cases
              if ($taskData['title'] === 'Completed Individual Task') {
                $status = 'completed';
                $completedAt = now()->subDay();
              } elseif ($taskData['title'] === 'Approved Individual Task') {
                $status = 'approved';
                $completedAt = now()->subDays(2);
                $approvedAt = now()->subDay();
              } elseif ($taskData['title'] === 'Overdue Task') {
                $assignedDate = now()->subDays(5);
                $dueDate = now()->subDays(4);
              }

              TaskAssignment::factory()->create([
                'task_id' => $task->id,
                'child_id' => $child->id,
                'assigned_date' => $assignedDate,
                'due_date' => $dueDate,
                'status' => $status,
                'assigned_token_amount' => rand(1, 10),
                'collaborative_instance_id' => null,
                'completed_at' => $completedAt,
                'approved_at' => $approvedAt,
              ]);
            }
          }
        }
      }
    }
  }
}
