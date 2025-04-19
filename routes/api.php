<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController; // Assuming you have this
use App\Http\Controllers\ChildTaskAssignmentController; // Assuming you have this
use App\Http\Controllers\AuthController; // Make sure this is the correct controller
use App\Http\Controllers\ShopItemController; // <-- Add ShopItemController

Route::middleware(['auth', 'verified'])->group(function () {
  // Existing Task routes
  Route::get('/tasks/family', [TaskController::class, 'listFamilyTasks'])->name('tasks.family.list');
  Route::get('/tasks/definitions', [TaskController::class, 'listDefinitions'])->name('tasks.definitions.list');
  Route::apiResource('tasks', TaskController::class); // Exclude index if listDefinitions replaces it

  // Existing Child Task Assignment routes
  Route::post('/assignments/complete', [ChildTaskAssignmentController::class, 'markComplete'])->name('assignments.complete');
  Route::patch('/assignments/{assignment}', [ChildTaskAssignmentController::class, 'updateStatus'])->name('assignments.updateStatus');

  // Child routes (assuming you have a controller)
  // Route::get('/children', [ChildController::class, 'index'])->name('children.index');

  // *** Add the new password revalidation route here ***
  Route::post('/auth/revalidate-password', [AuthController::class, 'revalidatePassword'])->name('auth.revalidatePassword');

  // *** Add API Resource route for Shop Items ***
  Route::apiResource('shop-items', ShopItemController::class);

  // ... other authenticated API routes ...
});

// Public API routes (if any) can go outside the middleware group
