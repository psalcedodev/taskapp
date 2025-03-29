<?php
namespace App\Services;

use App\Models\TaskAssignment;
use App\Models\Child;
// Potentially inject other services like a StreakService

class TaskCompletionService
{
    // Maybe inject StreakService in constructor?
    // public function __construct(private StreakService $streakService) {}

    /**
     * Handles the logic for completing a task assignment.
     *
     * @param TaskAssignment $assignment
     * @param string|null $notes
     * @return TaskAssignment The updated assignment
     * @throws \App\Exceptions\TaskCompletionException // Custom exception for errors
     */
    public function completeAssignment(TaskAssignment $assignment, ?string $notes): TaskAssignment
    {
        // --- Authorization checks already done in Form Request ---

        // --- Core Logic ---
        \Illuminate\Support\Facades\DB::transaction(function () use ($assignment, $notes) {
            $assignment->status = $assignment->task->needs_approval ? 'pending_approval' : 'completed';
            $assignment->completed_at = now();
            $assignment->notes = $notes;
            $assignment->save();

            $child = $assignment->child; // Get the child model

            // Perform actions based on task type
            if ($assignment->task->type === 'challenge') {
                if ($assignment->status === 'completed' && $assignment->assigned_token_amount > 0) {
                    // Award tokens directly if approved or no approval needed
                    $child->addTokens(
                        $assignment->assigned_token_amount,
                        'challenge_completion',
                        $assignment,
                        "Completed challenge: {$assignment->task->title}",
                    );
                }
                // If needs approval, tokens are awarded later by parent approval logic
            } elseif ($assignment->task->type === 'quest') {
                if ($assignment->status === 'completed' || $assignment->status === 'pending_approval') {
                    // Check streak on completion/pending
                    // Trigger streak update logic (could be another service call)
                    // $this->streakService->updateDailyQuestStreak($child, $assignment->assigned_date);
                    // $this->streakService->updateWeeklyQuestStreak($child, $assignment->assigned_date);
                }
                // Tokens are awarded via streak bonuses (handled by streak logic) or manual adjustments
            }
        }); // End transaction

        return $assignment->refresh(); // Return updated assignment
    }

    // Maybe add methods for handling parent approval which might award tokens for challenges
    // public function approveAssignment(TaskAssignment $assignment) { ... }
}
