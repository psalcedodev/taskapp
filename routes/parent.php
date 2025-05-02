<?php

use App\Http\Controllers\ChildController;
use App\Http\Controllers\ParentDashboardController;
use App\Http\Controllers\ParentTaskController;
use App\Http\Controllers\ParentPurchaseController;
use App\Http\Controllers\ShopItemController;
use App\Http\Controllers\TaskPauseController;
use Illuminate\Support\Facades\Route;

// Parent-only routes (UI and actions)
Route::middleware(['auth', 'verified'])->group(function () {
  // UI Routes
  Route::get('dashboard', [ParentDashboardController::class, 'dashboard'])->name('dashboard');
  Route::get('/tasks', [ParentDashboardController::class, 'tasksManager'])->name('tasks.manager');
  Route::get('/shop', [ParentDashboardController::class, 'shopManager'])->name('shop.manager');

  // Task Routes
  Route::post('/task-assignments/complete', [ParentTaskController::class, 'markComplete'])->name('task-assignments.complete');
  Route::get('/task-assignments', [ParentTaskController::class, 'getTaskAssignmentsForDate'])->name('task-assignments.for-date');

  // Purchase Routes
  Route::post('/purchases/{purchase}/approve', [ParentPurchaseController::class, 'approve'])->name('purchases.approve');
  Route::post('/purchases/{purchase}/reject', [ParentPurchaseController::class, 'reject'])->name('purchases.reject');
  Route::post('/purchases/{purchase}/revert', [ParentPurchaseController::class, 'revert'])->name('purchases.revert');
  Route::get('/shop/purchases/{child_id}', [ParentPurchaseController::class, 'purchaseHistory'])->name('shop.purchases.history');

  // Resource Routes
  Route::resources([
    'children' => ChildController::class,
    'shop-items' => ShopItemController::class,
    'task-pauses' => TaskPauseController::class,
  ]);
});
