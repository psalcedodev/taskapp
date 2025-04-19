<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException; // Use for clear error response

class AuthController extends Controller
{
  /**
   * Revalidate the current authenticated user's password.
   *
   * Handles Inertia POST request and redirects on success.
   *
   * @param Request $request
   * @return RedirectResponse
   * @throws ValidationException
   */
  public function revalidatePassword(Request $request): RedirectResponse
  {
    $request->validate([
      'password' => ['required', 'string'],
    ]);

    $user = Auth::user();

    // Check if the provided password matches the user's current password
    if (!$user || !Hash::check($request->password, $user->password)) {
      // Use ValidationException for a standard error structure
      throw ValidationException::withMessages([
        'password' => ['The provided password does not match our records.'],
      ]);
      // Alternatively, you could return a JSON response directly:
      // return response()->json(['message' => 'Incorrect password.'], 422);
    }

    // Password is correct.
    // Regenerate session, mark password confirmed timestamp
    // Note: password.confirm middleware might handle timestamp automatically,
    // but regenerating session ID after password confirmation is good practice.
    $request->session()->regenerate();
    $request->session()->put('auth.password_confirmed_at', time());

    // *** Return a redirect to the dashboard route ***
    return redirect()->route('dashboard')->with('success', 'Password confirmed.');
  }

  // You can add other auth-related API methods here if needed later
  // (e.g., login, logout, register if building a SPA auth flow)
}
