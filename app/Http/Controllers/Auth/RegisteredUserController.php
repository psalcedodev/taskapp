<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
  /**
   * Show the registration page.
   */
  public function create(): Response
  {
    return Inertia::render('auth/register');
  }

  /**
   * Handle an incoming registration request.
   *
   * @throws \Illuminate\Validation\ValidationException
   */
  public function store(Request $request): RedirectResponse
  {
    $request->validate([
      'name' => 'required|string|max:255',
      'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
      'password' => ['required', 'confirmed', Rules\Password::defaults()],
    ]);

    $user = User::create([
      'name' => $request->name,
      'email' => $request->email,
      'password' => Hash::make($request->password),
    ]);

    event(new Registered($user));

    Auth::login($user);

    return to_route('dashboard');
  }

  public function developerRegisterUser(Request $request)
  {
    $request->validate([
      'name' => 'required|string|max:255',
      'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
      'password' => ['required', 'confirmed', Rules\Password::defaults()],
    ]);

    User::create([
      'name' => $request->name,
      'email' => $request->email,
      'password' => Hash::make($request->password),
    ]);

    return response()->json(['message' => 'User registered successfully'], 200);
  }

  public function deleteUser(Request $request)
  {
    $user = User::find($request->id);
    if ($user) {
      $user->delete();
      return response()->json(['message' => 'User deleted successfully'], 200);
    } else {
      return response()->json(['message' => 'User not found'], 404);
    }
  }
}
