<?php

use App\Http\Controllers\ChildController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\ShopItemController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskPauseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resources([
        'children' => ChildController::class,
        'tasks' => TaskController::class,
        'shop-items' => ShopItemController::class,
        'purchases' => PurchaseController::class,
        'task-pauses' => TaskPauseController::class,
    ]);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
