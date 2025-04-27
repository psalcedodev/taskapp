<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\TaskAssignment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GenerateTaskAssignments extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'tasks:generate-assignments {date?}'; // Optional date for testing

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Generate task assignments for active tasks based on their recurrence rules for the specified date (defaults to today)';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $targetDate = $this->argument('date') ? Carbon::parse($this->argument('date')) : Carbon::today();
    $this->info('Generating task assignments for: ' . $targetDate->toDateString());
    Log::info('Starting task assignment generation for: ' . $targetDate->toDateString());

    // Fetch active tasks that should run on the target date
    // Eager load the children relationship with pivot data
    $tasksToAssign = Task::active()
      ->where(function ($query) use ($targetDate) {
        // Task's active range includes the target date
        $query
          ->where(function ($q) use ($targetDate) {
            $q->whereNull('start_date')->orWhere('start_date', '<=', $targetDate);
          })
          ->where(function ($q) use ($targetDate) {
            $q->whereNull('recurrence_ends_on')->orWhere('recurrence_ends_on', '>=', $targetDate);
          });
      })
      ->where(function ($query) use ($targetDate) {
        // Task recurs on the target date
        $query
          ->where('recurrence_type', 'none')
          ->whereDate('start_date', $targetDate) // Non-recurring task on its start date
          ->orWhere('recurrence_type', 'daily') // Daily tasks
          ->orWhere(function ($q) use ($targetDate) {
            // Weekdays/Weekends/Custom based on stored days
            $q->whereIn('recurrence_type', ['weekdays', 'weekends', 'custom'])->whereJsonContains('recurrence_days', $targetDate->format('D')); // Assumes 'Mon', 'Tue', etc.
          });
      })
      ->with('children:id') // Eager load children with pivot data (token_reward)
      ->get();

    if ($tasksToAssign->isEmpty()) {
      $this->info('No tasks found scheduled for ' . $targetDate->toDateString());
      Log::info('No tasks found scheduled for ' . $targetDate->toDateString());
      return 0;
    }

    $this->info('Found ' . $tasksToAssign->count() . ' task definitions to process.');
    $assignmentsCreated = 0;
    $assignmentsSkipped = 0;

    foreach ($tasksToAssign as $task) {
      if ($task->children->isEmpty()) {
        Log::warning("Task ID {$task->id} ('{$task->title}') is active but has no assigned children. Skipping.");
        continue;
      }

      foreach ($task->children as $child) {
        // Use transaction to ensure atomicity if needed (e.g., complex side effects)
        // DB::transaction(function () use ($task, $child, $targetDate, &$assignmentsCreated, &$assignmentsSkipped) { ... });

        try {
          // Use updateOrCreate to prevent duplicates
          $assignment = TaskAssignment::updateOrCreate(
            [
              'task_id' => $task->id,
              'child_id' => $child->id,
              'assigned_date' => $targetDate->toDateString(),
              'collaborative_instance_id' => null, // Add logic if task is collaborative
            ],
            [
              'due_date' => $task->available_to_time
                ? $targetDate->copy()->setTimeFromTimeString($task->available_to_time)
                : $targetDate->copy()->endOfDay(),
              'status' => 'in_progress', // Initial status
              'assigned_token_amount' => $child->pivot->token_reward ?? 0, // Get reward from pivot
              'completed_at' => null,
              'approved_at' => null,
              'notes' => null,
            ],
          );

          if ($assignment->wasRecentlyCreated) {
            $assignmentsCreated++;
            Log::info("Created TaskAssignment: Task ID {$task->id}, Child ID {$child->id}, Date {$targetDate->toDateString()}");
          } elseif ($assignment->wasChanged()) {
            Log::info(
              "Updated existing TaskAssignment (should be rare with updateOrCreate): Task ID {$task->id}, Child ID {$child->id}, Date {$targetDate->toDateString()}",
            );
            // Potentially log changes if needed
          } else {
            $assignmentsSkipped++;
            // Log::debug("Skipped TaskAssignment (already exists): Task ID {$task->id}, Child ID {$child->id}, Date {$targetDate->toDateString()}");
          }
        } catch (\Exception $e) {
          Log::error(
            "Failed to create/update TaskAssignment for Task ID {$task->id}, Child ID {$child->id}, Date {$targetDate->toDateString()}: " .
              $e->getMessage(),
          );
          $this->error("Error processing Task ID {$task->id} for Child ID {$child->id}: " . $e->getMessage());
        }
      }
    }

    $this->info("Assignment generation complete for {$targetDate->toDateString()}.");
    $this->info("Assignments Created: {$assignmentsCreated}");
    $this->info("Assignments Skipped (Already Existed): {$assignmentsSkipped}");
    Log::info("Assignment generation complete for {$targetDate->toDateString()}. Created: {$assignmentsCreated}, Skipped: {$assignmentsSkipped}");

    return 0; // Success
  }
}
