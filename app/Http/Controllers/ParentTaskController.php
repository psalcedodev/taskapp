<?php

namespace App\Http\Controllers;

use App\Models\TaskAssignment;
use Illuminate\Http\Request;

class ParentTaskController extends Controller
{
  public function getTaskAssignmentsForDate(Request $request)
  {
    return app(TaskController::class)->getTaskAssignmentsForDate($request);
  }

  public function markComplete(Request $request)
  {
    return app(ChildTaskAssignmentController::class)->markComplete($request);
  }
}
