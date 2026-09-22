<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'birthday' => $validated['birthday'],
            'gender' => $validated['gender'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $tokenResult = $user->createToken('auth-token');

        return response()->json([
            'user' => $user,
            'token' => $tokenResult->plainTextToken,
            'expires_at' => $this->tokenExpiresAt($tokenResult->accessToken),
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        $tokenResult = $user->createToken('auth-token');

        return response()->json([
            'user' => $user,
            'token' => $tokenResult->plainTextToken,
            'expires_at' => $this->tokenExpiresAt($tokenResult->accessToken),
        ]);
    }

    /**
     * The ISO-8601 timestamp this token stops working, based on the
     * sanctum.expiration config (minutes from creation). Null when Sanctum
     * is configured not to expire tokens. Lets the frontend proactively log
     * the user out at the right moment instead of waiting for a 401.
     */
    private function tokenExpiresAt($accessToken): ?string
    {
        $minutes = config('sanctum.expiration');

        if (! $minutes) {
            return null;
        }

        return $accessToken->created_at->copy()->addMinutes($minutes)->toISOString();
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $data = [
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'birthday' => $validated['birthday'],
            'gender' => $validated['gender'],
            'email' => $validated['email'],
        ];

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return response()->json($user);
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = $request->user();

        $request->validated();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    // public function forgotPassword(Request $request)
    // {
    //     $request->validate(['email' => 'required|email']);

    //     $status = Password::sendResetLink($request->only('email'));

    //     if ($status === Password::RESET_LINK_SENT) {
    //         return response()->json(['message' => __($status)]);
    //     }

    //     throw ValidationException::withMessages([
    //         'email' => [__($status)],
    //     ]);
    // }
		
		public function forgotPassword(Request $request)
		{
				$request->validate(['email' => 'required|email']);

				Password::sendResetLink($request->only('email'));

				return response()->json([
						'message' => "If an account exists for that email, we've sent a password reset link.",
				]);
		}

		public function resetPassword(Request $request)
		{
				$request->validate([
						'token' => 'required',
						'email' => 'required|email',
						'password' => 'required|min:8|confirmed',
				]);

				$status = Password::reset(
						$request->only('email', 'password', 'password_confirmation', 'token'),
						function ($user, $password) {
								$user->forceFill(['password' => Hash::make($password)])->save();
						}
				);

				if ($status === Password::PASSWORD_RESET) {
						return response()->json(['message' => __($status)]);
				}

				throw ValidationException::withMessages([
						'email' => [__($status)],
				]);
		}
}