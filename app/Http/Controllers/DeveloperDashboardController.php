<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeveloperDashboardController extends Controller
{
  public function dashboard()
  {
    return Inertia::render('developer/developer_dashboard', [
      'dasdada' => 'hello',
    ]);
  }

  public function usersManager()
  {
    return Inertia::render('developer/users/users_manager', [
      'users' => User::all(),
    ]);
  }

  public function listAllUsers()
  {
    return response()->json(User::orderBy('name', 'asc')->get());
  }
}
