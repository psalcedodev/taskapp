<?php

namespace App\Policies;

use App\Models\ShopItem;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ShopItemPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Any authenticated user can view their own list
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ShopItem $shopItem): bool
    {
        // User must own the shop item
        return $user->id === $shopItem->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create items for their own shop
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ShopItem $shopItem): bool
    {
        // User must own the shop item
        return $user->id === $shopItem->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ShopItem $shopItem): bool
    {
        // User must own the shop item
        return $user->id === $shopItem->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    // public function restore(User $user, ShopItem $shopItem): bool { ... }

    /**
     * Determine whether the user can permanently delete the model.
     */
    // public function forceDelete(User $user, ShopItem $shopItem): bool { ... }
}
