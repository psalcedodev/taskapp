<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Purchase;
use App\Models\TokenTransaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BankController extends Controller
{
  /**
   * Get transactions for a child within a date range
   */
  public function getTransactions(Request $request, Child $child): JsonResponse
  {
    $request->validate([
      'category' => ['nullable', 'string', 'in:all,challenge_completion,routine_completion,purchase,revert,manual_adjustment,streak_bonus'],
      'start_date' => ['nullable', 'date'],
      'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
      'period' => ['nullable', 'string', 'in:day,week,month,year'],
    ]);

    $query = TokenTransaction::where('child_id', $child->id)
      ->with(['related']) // Load the related model (e.g., Purchase)
      ->orderBy('timestamp', 'desc');

    // Handle date filtering
    if ($request->period) {
      $startDate = match ($request->period) {
        'day' => now()->startOfDay(),
        'week' => now()->startOfWeek(),
        'month' => now()->startOfMonth(),
        'year' => now()->startOfYear(),
      };
      $query->where('timestamp', '>=', $startDate);
    } elseif ($request->start_date) {
      $startDate = Carbon::parse($request->start_date)->startOfDay();
      $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : $startDate->copy()->endOfDay();

      $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    // Apply category filter if specified
    if ($request->category && $request->category !== 'all') {
      $query->where('type', $request->category);
    }

    $transactions = $query->get();

    // Transform the transactions to include purchase details when available
    $transactions->transform(function ($transaction) {
      $data = $transaction->toArray();

      // If this is a purchase transaction, include the purchase details
      if ($transaction->type === 'purchase' && $transaction->related instanceof Purchase) {
        $data['relatedPurchase'] = [
          'id' => $transaction->related->id,
          'itemName' => $transaction->related->shopItem->name,
          'quantity' => $transaction->related->quantity,
          'status' => $transaction->related->status,
        ];
      }

      return $data;
    });

    return response()->json($transactions);
  }

  /**
   * Get transaction statistics for a child within a date range
   */
  public function getStats(Request $request, Child $child): JsonResponse
  {
    $request->validate([
      'start_date' => ['nullable', 'date'],
      'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
      'period' => ['nullable', 'string', 'in:day,week,month,year'],
    ]);

    $query = TokenTransaction::where('child_id', $child->id);

    // Handle date filtering
    if ($request->period) {
      $startDate = match ($request->period) {
        'day' => now()->startOfDay(),
        'week' => now()->startOfWeek(),
        'month' => now()->startOfMonth(),
        'year' => now()->startOfYear(),
      };
      $query->where('timestamp', '>=', $startDate);
    } elseif ($request->start_date) {
      $startDate = Carbon::parse($request->start_date)->startOfDay();
      $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : $startDate->copy()->endOfDay();

      $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    $stats = [
      'total_earned' => (clone $query)->where('amount', '>', 0)->sum('amount'),
      'total_spent' => (clone $query)->where('amount', '<', 0)->sum('amount'),
      'by_category' => (clone $query)->selectRaw('type, COUNT(*) as count, SUM(amount) as total')->groupBy('type')->get()->keyBy('type'),
      'daily_totals' => (clone $query)
        ->selectRaw(
          'DATE(timestamp) as date, SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as earned, SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as spent',
        )
        ->groupBy('date')
        ->orderBy('date', 'desc')
        ->get()
        ->keyBy('date'),
    ];

    return response()->json($stats);
  }
}
