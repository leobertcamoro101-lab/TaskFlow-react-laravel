<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// Public auth routes (rate-limited: 6 attempts/minute per IP to prevent brute-force)
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');

// Protected routes (rate-limited: 60 requests/minute per user, see AppServiceProvider)
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    // Tighter limit here: this is the one endpoint that lets a caller repeatedly
    // guess a password (current_password) against a token they already hold.
    Route::put('/profile/password', [AuthController::class, 'updatePassword'])->middleware('throttle:10,1');
    Route::apiResource('tasks', TaskController::class);
});
