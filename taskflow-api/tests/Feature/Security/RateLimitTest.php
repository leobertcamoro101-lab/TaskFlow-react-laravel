<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // RateLimiter hits are tracked in the cache store (the 'array'
        // driver in testing), which is one in-process array shared across
        // the whole test run. Clear it so an earlier test's hits against
        // the same route can't make this test's count start non-zero.
        Cache::flush();
    }

    /**
     * routes/api.php adds a route-specific throttle:10,1 to PUT
     * /profile/password on top of the general 'api' limiter, because it's
     * the one endpoint that lets a caller repeatedly guess a password
     * (current_password) against a token they already hold.
     */
    public function test_the_password_change_endpoint_is_rate_limited_at_ten_per_minute(): void
    {
        // The request body goes through UpdatePasswordRequest validation
        // (including Password::uncompromised(), an HTTP call) before the
        // route handler ever checks current_password, so fake that call.
        Http::fake();

        $user = User::factory()->create(['password' => Hash::make('OldPassw0rd!')]);
        Sanctum::actingAs($user);

        $payload = [
            'current_password' => 'wrong-password',
            'password' => 'still-not-a-valid-password',
            'password_confirmation' => 'still-not-a-valid-password',
        ];

        for ($i = 1; $i <= 10; $i++) {
            $response = $this->putJson('/api/profile/password', $payload);
            $this->assertNotEquals(429, $response->status(), "Request {$i} was throttled too early.");
        }

        $this->putJson('/api/profile/password', $payload)->assertStatus(429);
    }

    /**
     * Everything behind auth:sanctum shares the 'api' limiter registered in
     * AppServiceProvider (60 requests/minute, keyed by user id) — before
     * this fix, these routes had no rate limiting at all.
     */
    public function test_protected_routes_are_rate_limited_at_sixty_per_minute(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        for ($i = 1; $i <= 60; $i++) {
            $response = $this->getJson('/api/tasks');
            $this->assertNotEquals(429, $response->status(), "Request {$i} was throttled too early.");
        }

        $this->getJson('/api/tasks')->assertStatus(429);
    }
}
