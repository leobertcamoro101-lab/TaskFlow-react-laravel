<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Applied to every authenticated route via 'throttle:api' in routes/api.php.
        // Keyed by user id when authenticated so one user's traffic can't exhaust
        // another's quota, falling back to IP for unauthenticated requests.
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Backs /register, /login, /forgot-password, /reset-password (routes/api.php).
        // Default (6/min) is unchanged from before — this only exists so the E2E
        // suite (e2e/playwright.config.ts) can raise AUTH_THROTTLE_PER_MINUTE for
        // its own run. Every E2E request shares one IP, and a handful of tests
        // each registering a fresh user in beforeEach adds up to more than 6
        // requests within the same minute — that's normal test traffic from one
        // machine, not the brute-force pattern this limiter exists to stop, but
        // both looked identical from the throttle's point of view and a
        // registration getting silently 429'd looked exactly like a UI hang.
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute((int) env('AUTH_THROTTLE_PER_MINUTE', 6))->by($request->ip());
        });

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')
                . '/reset-password?token=' . $token
                . '&email=' . urlencode($notifiable->email);
        });
    }
}
