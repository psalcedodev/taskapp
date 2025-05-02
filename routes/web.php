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

// Developer-only routes
Route::middleware(['auth', 'role:developer', 'verified'])->group(function () {
  Route::get('developer-dashboard', [DeveloperDashboardController::class, 'dashboard'])->name('developer-dashboard');
  Route::get('developer-dashboard/users', [DeveloperDashboardController::class, 'usersManager'])->name('developer-dashboard.users-manager');
  Route::get('developer-dashboard/users/all', [DeveloperDashboardController::class, 'listAllUsers'])->name('listAllUsers');
  Route::post('developerRegisterUser', [RegisteredUserController::class, 'developerRegisterUser'])->name('register-user');
  Route::delete('developerDeleteUser', [RegisteredUserController::class, 'developerDeleteUser'])->name('delete-user');
});

// General authenticated web routes
Route::middleware(['auth', 'verified'])->group(function () {
  Route::get('/', function () {
    return Inertia::render('task_viewer');
  })->name('home');

  // Parent-specific routes have been moved to routes/parent.php
});

require __DIR__ . '/settings.php'; // Assuming this contains profile/password routes
require __DIR__ . '/auth.php'; // Assuming this contains login/register/etc. routes
require __DIR__ . '/api.php'; // Assuming this contains login/register/etc. routes
require __DIR__ . '/parent.php'; // Assuming this contains parent-specific routes
