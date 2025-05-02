<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ParentDashboardController extends Controller
{
  public function dashboard()
  {
    return Inertia::render('family/family_dashboard');
  }

  public function tasksManager()
  {
    return Inertia::render('parent/tasks/tasks_manager');
  }

  public function shopManager()
  {
    return Inertia::render('parent/shop/shop_manager');
  }
}
