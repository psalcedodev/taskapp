<?php

namespace App\Policies;

use App\Models\Purchase;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PurchasePolicy
{
    // Check if user owns the child associated with the purchase
    private function userOwnsPurchaseChild(User $user, Purchase $purchase): bool
    {
        // Ensure child relationship is loaded or handle potential N+1
        return $user->id === $purchase->child->user_id;
    }

    public function viewAny(User $user): bool
    {
        return true;
    } // Controller filters
    public function view(User $user, Purchase $purchase): bool
    {
        return $this->userOwnsPurchaseChild($user, $purchase);
    }
    // public function create(User $user): bool { return false; } // Child creates via ChildShopController
    public function update(User $user, Purchase $purchase): bool
    {
        return $this->userOwnsPurchaseChild($user, $purchase);
    } // Used for approve/reject/revert
    public function delete(User $user, Purchase $purchase): bool
    {
        return $this->userOwnsPurchaseChild($user, $purchase);
    }
    // public function approve(...) { return $this->update(...); } // Could add specific methods
    // public function reject(...) { return $this->update(...); }
    // public function revert(...) { return $this->update(...); }
}
