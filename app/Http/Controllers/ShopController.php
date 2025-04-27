<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Purchase;
use App\Models\ShopItem;
use App\Models\TokenTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ShopController extends Controller
{
  public function listItems(Request $request)
  {
    $items = ShopItem::available()
      ->where('is_active', true)
      ->where('user_id', auth()->id())
      ->get()
      ->map(function ($item) {
        return [
          'id' => $item->id,
          'name' => $item->name,
          'description' => $item->description,
          'image_path' => $item->image_path,
          'token_cost' => $item->token_cost,
          'stock' => $item->stock,
          'is_active' => $item->is_active,
          'is_limited_time' => $item->is_limited_time,
          'available_from' => $item->available_from,
          'available_until' => $item->available_until,
        ];
      });

    return response()->json($items);
  }

  public function purchase(Request $request)
  {
    $request->validate([
      'child_id' => 'required|exists:children,id',
      'shop_item_id' => 'required|exists:shop_items,id',
    ]);

    $child = Child::findOrFail($request->child_id);
    $item = ShopItem::findOrFail($request->shop_item_id);

    // Check if item is available
    if (!$item->is_active) {
      return response()->json(['message' => 'This item is not available.'], 400);
    }

    if ($item->stock !== null && $item->stock <= 0) {
      return response()->json(['message' => 'This item is out of stock.'], 400);
    }

    if ($item->is_limited_time) {
      $now = now();
      if ($item->available_from && $item->available_from > $now) {
        return response()->json(['message' => 'This item is not yet available.'], 400);
      }
      if ($item->available_until && $item->available_until < $now) {
        return response()->json(['message' => 'This item is no longer available.'], 400);
      }
    }

    // Check if child has enough tokens
    if ($child->token_balance < $item->token_cost) {
      return response()->json(['message' => 'Not enough tokens to purchase this item.'], 400);
    }

    try {
      DB::beginTransaction();

      // Set purchase status
      $status = $item->needs_approval ? 'pending' : 'approved';

      // Create purchase record
      $purchase = Purchase::create([
        'child_id' => $child->id,
        'shop_item_id' => $item->id,
        'token_cost_at_purchase' => $item->token_cost,
        'status' => $status,
      ]);

      // Create token transaction (polymorphic)
      TokenTransaction::create([
        'child_id' => $child->id,
        'amount' => -$item->token_cost,
        'type' => 'purchase',
        'description' => "Purchased {$item->name}",
        'related_type' => get_class($purchase),
        'related_id' => $purchase->id,
      ]);

      // Update child's token balance
      $child->decrement('token_balance', $item->token_cost);

      // Update item stock if applicable
      if ($item->stock !== null) {
        $item->decrement('stock');
      }

      DB::commit();

      return response()->json([
        'message' => 'Purchase successful!',
        'new_balance' => $child->fresh()->token_balance,
        'purchase_status' => $status,
      ]);
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Purchase failed: ' . $e->getMessage());
      return response()->json(['message' => 'Failed to complete purchase. Please try again.'], 500);
    }
  }

  public function purchaseHistory($childId)
  {
    $purchases = \App\Models\Purchase::with('shopItem')
      ->where('child_id', $childId)
      ->orderByDesc('created_at')
      ->get()
      ->map(function ($purchase) {
        return [
          'id' => $purchase->id,
          'item_name' => $purchase->shopItem->name,
          'item_image' => $purchase->shopItem->image_path,
          'item_description' => $purchase->shopItem->description,
          'token_cost' => $purchase->token_cost,
          'purchased_at' => $purchase->created_at->toDateTimeString(),
        ];
      });
    return response()->json($purchases);
  }
}
