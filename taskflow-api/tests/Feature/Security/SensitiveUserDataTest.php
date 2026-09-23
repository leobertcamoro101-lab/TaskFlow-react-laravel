<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * User::$hidden already excludes 'password' and 'remember_token' from JSON
 * serialization. These tests guard against a regression (e.g. someone
 * refactoring the model or a controller into $user->toArray() with
 * $hidden bypassed) letting the hash leak into an API response.
 */
class SensitiveUserDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_authenticated_user_endpoint_never_exposes_the_password_hash(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/me');

        $response->assertOk();
        $this->assertArrayNotHasKey('password', $response->json());
        $this->assertArrayNotHasKey('remember_token', $response->json());
    }

    public function test_registration_never_exposes_the_password_hash(): void
    {
        // register() runs Password::uncompromised(), which would otherwise
        // make a real HTTP call to the HIBP API.
        Http::fake();

        $response = $this->postJson('/api/register', [
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'birthday' => '1990-01-01',
            'gender' => 'female',
            'email' => 'ada@example.com',
            'password' => 'Tqz9!vKxr2#pL',
        ]);

        $response->assertStatus(201);
        $this->assertArrayNotHasKey('password', $response->json('user'));
        $this->assertArrayNotHasKey('remember_token', $response->json('user'));
    }
}
