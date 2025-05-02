<?php

namespace App\Http\Controllers;

use App\Http\Requests\MarkTaskCompleteRequest;
use App\Models\TaskAssignment;
use Illuminate\Http\Request;

class ParentTaskController extends Controller
{
  public function getTaskAssignmentsForDate(Request $request)
  {
    return app(TaskController::class)->getTaskAssignmentsForDate($request);
  }

  public function markComplete(MarkTaskCompleteRequest $request)
  {
    return app(ChildTaskAssignmentController::class)->markComplete($request);
  }
}
