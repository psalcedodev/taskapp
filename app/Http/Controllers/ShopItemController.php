<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShopItemRequest;
use App\Http\Requests\UpdateShopItemRequest;
use App\Models\ShopItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ShopItemController extends Controller
{
    /**
     * Display a listing of the shop items for the authenticated parent.
     */
    public function index(): InertiaResponse
    {
        $shopItems = Auth::user()
            ->shopItems()
            ->orderBy('created_at', 'desc') // Or order by name, cost, etc.
            ->get();

        return Inertia::render('ShopItems/Index', [
            'shopItems' => $shopItems,
        ]);
    }

    /**
     * Show the form for creating a new resource. (Likely unused for modals)
     */
    public function create()
    {
        abort(404); // Or return JSON data needed for create modal
    }

    /**
     * Store a newly created shop item in storage.
     * Returns the created item as JSON.
     */
    public function store(StoreShopItemRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Associate with the logged-in user (parent)
        $shopItem = Auth::user()->shopItems()->create($validated);

        // Return the newly created item as JSON
        return response()->json($shopItem, 201); // 201 Created
    }

    /**
     * Display the specified shop item.
     * Acts as an API endpoint returning JSON.
     */
    public function show(ShopItem $shopItem): JsonResponse
    {
        $this->authorize('view', $shopItem); // Use ShopItemPolicy

        return response()->json($shopItem);
    }

    /**
     * Show the form for editing the specified resource. (Likely unused for modals)
     */
    public function edit(ShopItem $shopItem)
    {
        $this->authorize('update', $shopItem); // Still good practice
        abort(404); // Or return JSON data needed for edit modal (usually via show route)
    }

    /**
     * Update the specified shop item in storage.
     * Returns the updated item as JSON.
     */
    public function update(UpdateShopItemRequest $request, ShopItem $shopItem): JsonResponse
    {
        // Authorization often handled by UpdateShopItemRequest or uncomment below
        // $this->authorize('update', $shopItem);

        $validated = $request->validated();

        $shopItem->update($validated);

        return response()->json($shopItem->fresh()); // Return updated item
    }

    /**
     * Remove the specified shop item from storage.
     * Returns No Content response.
     */
    public function destroy(ShopItem $shopItem): Response
    {
        $this->authorize('delete', $shopItem); // Use ShopItemPolicy

        // Consider what happens to Purchase history if an item is deleted.
        // The onDelete('cascade') in migration handles DB level.
        // You might want soft deletes instead for ShopItem.
        $shopItem->delete();

        return response()->noContent(); // 204 No Content
    }
}
