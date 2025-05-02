<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use Illuminate\Http\Request;

class ParentPurchaseController extends Controller
{
  public function approve(Purchase $purchase)
  {
    return app(PurchaseController::class)->approve($purchase);
  }

  public function reject(Purchase $purchase)
  {
    return app(PurchaseController::class)->reject($purchase);
  }

  public function revert(Purchase $purchase)
  {
    return app(PurchaseController::class)->revert($purchase);
  }

  public function purchaseHistory($child_id)
  {
    return app(ShopController::class)->purchaseHistory($child_id);
  }
}
