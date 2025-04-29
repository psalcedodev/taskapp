<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController; // Assuming you have this
use App\Http\Controllers\ChildTaskAssignmentController; // Assuming you have this
use App\Http\Controllers\AuthController; // Make sure this is the correct controller
use App\Http\Controllers\BankController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\ShopItemController; // <-- Add ShopItemController
use App\Http\Controllers\FamilyController; // <-- Add FamilyController
use App\Http\Controllers\ShopController;

Route::middleware(['auth', 'verified'])->group(function () {
  // Existing Task routes
  Route::get('/tasks/family', [TaskController::class, 'listFamilyTasks'])->name('tasks.family.list');
  Route::get('/api/family/children', [ChildController::class, 'listFamilyChildren'])->name('family.children.list');

  Route::get('/tasks/definitions', [TaskController::class, 'listDefinitions'])->name('tasks.definitions.list');
  Route::apiResource('tasks', TaskController::class); // Exclude index if listDefinitions replaces it

  // Existing Child Task Assignment routes
  Route::post('/assignments/complete', [ChildTaskAssignmentController::class, 'markComplete'])->name('assignments.complete');
  Route::patch('/assignments/{assignment}', [ChildTaskAssignmentController::class, 'updateStatus'])->name('assignments.updateStatus');
  Route::patch('/api/family/assignments/{assignment}', [ChildTaskAssignmentController::class, 'updateStatus'])->name(
    'api.family.assignments.updateStatus',
  );

  // Child routes (assuming you have a controller)
  // Route::get('/children', [ChildController::class, 'index'])->name('children.index');

  // *** Add the new password revalidation route here ***
  Route::post('/auth/revalidate-password', [AuthController::class, 'revalidatePassword'])->name('auth.revalidatePassword');

  // *** Add API Resource route for Shop Items ***
  Route::apiResource('shop-items', ShopItemController::class);

  // *** Add Family Dashboard specific API routes ***
  Route::get('/api/family/pending-approvals', [ChildTaskAssignmentController::class, 'listPendingFamilyApprovals'])->name(
    'api.family.pending-approvals.list',
  );
  Route::get('/api/family/recent-activities', [FamilyController::class, 'listRecentActivities'])->name('api.family.recent-activities.list');

  // List available shop items
  Route::get('/shop/items', [ShopController::class, 'listItems'])->name('shop.items.list');

  // Purchase an item
  Route::post('/shop/purchase', [ShopController::class, 'purchase'])->name('shop.purchase');

  // Verify child PIN
  Route::post('/child/verify-pin', [ChildController::class, 'verifyPin'])->name('child.verify-pin');
  // ... other authenticated API routes ...

  Route::get('/bank/{child}/transactions', [BankController::class, 'getTransactions'])->name('bank.transactions');
  Route::get('/bank/{child}/stats', [BankController::class, 'getStats'])->name('bank.stats');
});

// Public API routes (if any) can go outside the middleware group
