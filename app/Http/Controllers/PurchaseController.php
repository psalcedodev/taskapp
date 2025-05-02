<?php

namespace App\Http\Controllers;

use App\Http\Requests\RejectPurchaseRequest; // Use specific request for reject
use App\Models\Purchase;
use App\Models\Child; // Needed for token logic context
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // For transactions
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
// use App\Services\PurchaseProcessingService; // Recommended: Move complex logic here

class PurchaseController extends Controller
{
  /**
   * Display a listing of purchase history for the parent's children.
   */
  public function index(Request $request): InertiaResponse
  {
    $user = Auth::user();
    $query = Purchase::whereHas('child', fn($q) => $q->where('user_id', $user->id))
      ->with(['child:id,name', 'shopItem:id,name']) // Eager load basic info
      ->orderBy('requested_at', 'desc');

    // --- TODO: Add filtering based on $request query params ---
    // e.g., filter by child_id, status

    $purchases = $query->paginate(20); // Paginate results

    return Inertia::render('Purchases/Index', [
      'purchases' => $purchases,
      // Pass filter values back if needed
    ]);
  }

  /**
   * Display the specified purchase details (API for modal).
   */
  public function show(Purchase $purchase): JsonResponse
  {
    $this->authorize('view', $purchase); // Use PurchasePolicy
    $purchase->load(['child:id,name', 'shopItem']); // Load details
    return response()->json($purchase);
  }

  /**
   * Approve a pending purchase.
   */
  public function approve(Purchase $purchase /*, PurchaseProcessingService $service */): JsonResponse
  {
    $this->authorize('update', $purchase); // Or custom 'approve' policy method

    if ($purchase->status !== 'pending_approval') {
      return response()->json(['message' => 'Purchase is not pending approval.'], 422);
    }

    // --- Delegate to Service is Recommended ---
    // $updatedPurchase = $service->approve($purchase);
    // --- Manual Logic (Example - Use Service for better structure) ---
    try {
      DB::transaction(function () use ($purchase) {
        $child = $purchase->child;
        if ($child->token_balance < $purchase->token_cost_at_purchase) {
          throw new \App\Exceptions\PurchaseException('Insufficient tokens to approve purchase.'); // Need custom Exception
        }

        // Deduct tokens first
        $deducted = $child->deductTokens(
          $purchase->token_cost_at_purchase,
          'purchase',
          $purchase, // Link transaction to purchase
          "Purchased: {$purchase->shopItem->name}",
          true, // Ensure balance check happens
        );

        if (!$deducted) {
          // This should ideally be caught by the balance check above, but double-check
          throw new \App\Exceptions\PurchaseException('Token deduction failed.');
        }

        // Update purchase status
        $purchase->status = 'approved';
        $purchase->processed_at = now();
        $purchase->parent_notes = null; // Clear any previous rejection notes
        $purchase->save();
      });
    } catch (\App\Exceptions\PurchaseException | \Exception $e) {
      report($e);
      return response()->json(['message' => $e->getMessage() ?? 'Failed to approve purchase.'], 422);
    }
    // --- End Manual Logic Example ---

    return response()->json($purchase->refresh()->load(['child:id,name', 'shopItem:id,name']));
  }

  /**
   * Reject a pending purchase.
   */
  public function reject(Purchase $purchase): JsonResponse
  {
    $this->authorize('update', $purchase); // Or custom 'reject' policy method

    if ($purchase->status !== 'pending_approval') {
      return response()->json(['message' => 'Purchase is not pending approval.'], 422);
    }

    // $validated = $request->validated(); // Gets 'parent_notes'

    $purchase->status = 'rejected';
    $purchase->processed_at = now();
    // $purchase->parent_notes = $validated['parent_notes'] ?? null;
    $purchase->save();

    return response()->json($purchase->refresh()->load(['child:id,name', 'shopItem:id,name']));
  }

  /**
   * Revert an approved purchase (refund tokens).
   */
  public function revert(Purchase $purchase /*, PurchaseProcessingService $service */): JsonResponse
  {
    $this->authorize('update', $purchase); // Or custom 'revert' policy method

    // Typically only revert 'approved' purchases
    if ($purchase->status !== 'approved') {
      return response()->json(['message' => 'Only approved purchases can be reverted.'], 422);
    }

    // --- Delegate to Service is Recommended ---
    // $updatedPurchase = $service->revert($purchase);
    // --- Manual Logic (Example - Use Service) ---
    try {
      DB::transaction(function () use ($purchase) {
        $child = $purchase->child;

        // Refund tokens
        $refunded = $child->addTokens(
          $purchase->token_cost_at_purchase,
          'revert', // Transaction type
          $purchase,
          "Reverted purchase: {$purchase->shopItem->name}",
        );

        if (!$refunded) {
          throw new \Exception('Token refund failed.');
        }

        // Update purchase status
        $purchase->status = 'reverted';
        $purchase->processed_at = now();
        // Optionally add a note: $purchase->parent_notes = 'Reverted by parent.';
        $purchase->save();
      });
    } catch (\Exception $e) {
      report($e);
      return response()->json(['message' => $e->getMessage() ?? 'Failed to revert purchase.'], 500);
    }
    // --- End Manual Logic Example ---

    return response()->json($purchase->refresh()->load(['child:id,name', 'shopItem:id,name']));
  }

  /**
   * Remove the specified resource from storage. (Use with caution)
   */
  public function destroy(Purchase $purchase): Response
  {
    $this->authorize('delete', $purchase); // Use PurchasePolicy

    // Deleting purchase history might not be desirable. Consider soft deletes if needed.
    $purchase->delete();

    return response()->noContent(); // 204 No Content
  }
}
