<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
  /**
   * Define the application's command schedule.
   */
  protected function schedule(Schedule $schedule): void
  {
    // $schedule->command('inspire')->hourly();

    // Run the task assignment generator daily (e.g., at 1 AM server time)
    $schedule
      ->command('tasks:generate-assignments')
      ->dailyAt('00:25')
      ->withoutOverlapping()
      ->onSuccess(function () {
        Log::info('Scheduled task assignment generation completed successfully.');
      })
      ->onFailure(function () {
        Log::error('Scheduled task assignment generation failed.');
      });
  }

  /**
   * Register the commands for the application.
   */
  protected function commands(): void
  {
    $this->load(__DIR__ . '/Commands');

    require base_path('routes/console.php');
  }
}
