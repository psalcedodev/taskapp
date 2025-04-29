<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\ShopItemController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskPauseController;
use App\Http\Controllers\ChildTaskAssignmentController; // Import the new controller
use App\Http\Controllers\DeveloperDashboardController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\BankController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:developer', 'verified'])->group(function () {
  Route::get('developer-dashboard', [DeveloperDashboardController::class, 'dashboard'])->name('developer-dashboard');
  Route::get('developer-dashboard/users', [DeveloperDashboardController::class, 'usersManager'])->name('developer-dashboard.users-manager');
  Route::get('developer-dashboard/users/all', [DeveloperDashboardController::class, 'listAllUsers'])->name('listAllUsers');
  Route::post('developerRegisterUser', [RegisteredUserController::class, 'developerRegisterUser'])->name('register-user');
  Route::delete('developerDeleteUser', [RegisteredUserController::class, 'developerDeleteUser'])->name('delete-user');
});

Route::middleware(['auth', 'verified'])->group(function () {
  Route::get('/', function () {
    return Inertia::render('task_viewer');
  })->name('home');

  Route::get('dashboard', function () {
    return Inertia::render('family/family_dashboard');
  })->name('dashboard');

  Route::get('/tasks', function () {
    return Inertia::render('parent/tasks/tasks_manager');
  })->name('tasks.manager');

  Route::get('/shop', function () {
    return Inertia::render('parent/shop/shop_manager');
  })->name('shop.manager');

  Route::post('/task-assignments/complete', [ChildTaskAssignmentController::class, 'markComplete'])->name('task-assignments.complete');
  Route::post('/purchases/{purchase}/approve', [PurchaseController::class, 'approve'])->name('purchases.approve');
  Route::post('/purchases/{purchase}/reject', [PurchaseController::class, 'reject'])->name('purchases.reject');
  Route::post('/purchases/{purchase}/revert', [PurchaseController::class, 'revert'])->name('purchases.revert');
  Route::get('/task-assignments', [TaskController::class, 'getTaskAssignmentsForDate'])->name('task-assignments.for-date');

  Route::resources([
    'children' => ChildController::class,
    // 'tasks' => TaskController::class,
    'shop-items' => ShopItemController::class,
    'purchases' => PurchaseController::class, // Note: We haven't defined this controller logic yet
    'task-pauses' => TaskPauseController::class, // Note: We haven't defined this controller logic yet
  ]);

  // Purchase history for a child
  Route::get('/shop/purchases/{child_id}', [ShopController::class, 'purchaseHistory'])->name('shop.purchases.history');
});

require __DIR__ . '/settings.php'; // Assuming this contains profile/password routes
require __DIR__ . '/auth.php'; // Assuming this contains login/register/etc. routes
require __DIR__ . '/api.php'; // Assuming this contains login/register/etc. routes
