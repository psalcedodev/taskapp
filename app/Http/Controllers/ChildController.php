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
use Illuminate\Support\Facades\Log;
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

  public function listFamilyChildren(): JsonResponse
  {
    $children = Auth::user()->children()->orderBy('name', 'asc')->get();
    return response()->json($children);
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
    unset($validated['pin']); // Remove the plain PIN

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

    return response()->json($child->fresh(), 201);
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
    $validated = $request->validated();

    // Hash the PIN only if a new one was provided
    if (isset($validated['pin'])) {
      $validated['pin_hash'] = Hash::make($validated['pin']);
      unset($validated['pin']); // Remove the plain PIN
    }

    $child->update($validated);

    return response()->json($child->fresh());
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

  public function verifyPin(Request $request)
  {
    Log::info('verifyPin', ['request' => $request->all()]);
    $request->validate([
      'child_id' => 'required|exists:children,id',
      'pin' => 'required|string|size:4',
    ]);

    // Explicitly select the pin_hash field
    $child = Child::select(['id', 'name', 'token_balance', 'pin_hash'])->findOrFail($request->child_id);

    // Log the raw attributes to see everything including pin_hash
    Log::info('child raw attributes', ['child' => $child->getAttributes()]);

    if (!Hash::check($request->pin, $child->pin_hash)) {
      Log::info('pin hash check failed', [
        'provided_pin' => $request->pin,
        'stored_hash' => $child->pin_hash,
      ]);
      return response()->json(['verified' => false], 401);
    }

    return response()->json([
      'verified' => true,
      'child' => [
        'id' => $child->id,
        'name' => $child->name,
        'token_balance' => $child->token_balance,
      ],
    ]);
  }
}
