<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChildRequest;
use App\Http\Requests\UpdateChildRequest;
use App\Models\Child;
use App\Models\Streak; // Needed to create initial streaks
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash; // For hashing PINs
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ChildController extends Controller
{
    /**
     * Display a listing of the parent's children.
     * Renders the main Inertia page for managing children.
     */
    public function index(): InertiaResponse
    {
        $children = Auth::user()->children()->orderBy('name', 'asc')->get();

        // You might want to load current streak counts here too
        // $children->load('streaks'); // Example

        return Inertia::render('Children/Index', [
            'children' => $children,
        ]);
    }

    /**
     * Show the form for creating a new resource. (Likely unused for modals)
     */
    public function create()
    {
        abort(404); // Or return data needed for create modal if any
    }

    /**
     * Store a newly created child in storage.
     * Creates initial streak records for the child.
     * Returns the created child as JSON.
     */
    public function store(StoreChildRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Hash the PIN before saving
        $validated['pin_hash'] = Hash::make($validated['pin']);
        unset($validated['pin']); // Don't store the plain PIN

        // Create the child associated with the logged-in parent
        $child = Auth::user()->children()->create($validated);

        // Create initial streak records for the new child
        Streak::firstOrCreate(
            ['child_id' => $child->id, 'type' => 'daily_quest'],
            ['current_streak_count' => 0, 'longest_streak_count' => 0, 'last_streak_date' => null],
        );
        Streak::firstOrCreate(
            ['child_id' => $child->id, 'type' => 'weekly_quest'],
            ['current_streak_count' => 0, 'longest_streak_count' => 0, 'last_streak_date' => null],
        );

        // Return the child data (excluding PIN hash)
        // Use fresh() to get all attributes including timestamps etc.
        return response()->json($child->fresh()->makeHidden('pin_hash'), 201);
    }

    /**
     * Display the specified child's data.
     * Acts as an API endpoint returning JSON.
     */
    public function show(Child $child): JsonResponse
    {
        $this->authorize('view', $child); // Use ChildPolicy

        // Exclude PIN hash from the response
        return response()->json($child->makeHidden('pin_hash'));
    }

    /**
     * Show the form for editing the specified resource. (Likely unused for modals)
     */
    public function edit(Child $child)
    {
        $this->authorize('update', $child); // Still good to authorize
        abort(404); // Or return data needed for edit modal (usually fetched via show route)
    }

    /**
     * Update the specified child in storage.
     * Returns the updated child as JSON.
     */
    public function update(UpdateChildRequest $request, Child $child): JsonResponse
    {
        // Authorization handled by UpdateChildRequest or $this->authorize('update', $child);
        $validated = $request->validated();

        // Hash the PIN only if a new one was provided
        if (isset($validated['pin'])) {
            $validated['pin_hash'] = Hash::make($validated['pin']);
            unset($validated['pin']); // Don't store plain PIN
        }

        $child->update($validated);

        // Return updated child data (excluding PIN hash)
        return response()->json($child->fresh()->makeHidden('pin_hash'));
    }

    /**
     * Remove the specified child from storage.
     * Returns No Content response.
     */
    public function destroy(Child $child): Response
    {
        $this->authorize('delete', $child); // Use ChildPolicy

        // Related data (assignments, purchases, tokens, streaks, pauses)
        // should be deleted automatically via DB cascade constraints.
        $child->delete();

        return response()->noContent(); // 204 No Content
    }

    // --- TODO: Add methods for Manual Token Adjustments? ---
    // public function adjustTokens(Request $request, Child $child) { ... }
    // Needs its own route, request validation, authorization
}
