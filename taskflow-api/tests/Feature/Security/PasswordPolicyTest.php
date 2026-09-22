<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PasswordPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // register()/updatePassword() share the 'api'/'throttle:6,1' limiters
        // with other test classes' requests to the same routes; clear any
        // hits those left in the (process-wide, array-driver) cache.
        Cache::flush();
    }

    /**
     * Fakes the Have I Been Pwned "range" API that Password::uncompromised()
     * calls, so these tests never make a real network request and can
     * deterministically control whether a given password is reported as
     * breached.
     */
    private function fakePwnedPasswordsApi(string $password, bool $breached): void
    {
        $sha1 = strtoupper(sha1($password));
        $suffix = substr($sha1, 5);

        Http::fake([
            'api.pwnedpasswords.com/*' => Http::response(
                $breached ? "{$suffix}:1337\r\n" : '',
                200
            ),
        ]);
    }

    private function registerPayload(string $password): array
    {
        return [
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'birthday' => '1990-01-01',
            'gender' => 'female',
            'email' => 'ada@example.com',
            'password' => $password,
        ];
    }

    public function test_registration_rejects_a_password_missing_complexity(): void
    {
        $this->fakePwnedPasswordsApi('alllowercase1', false);

        $response = $this->postJson('/api/register', $this->registerPayload('alllowercase1'));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
        $this->assertDatabaseMissing('users', ['email' => 'ada@example.com']);
    }

    public function test_registration_rejects_a_password_found_in_a_known_breach(): void
    {
        $password = 'Correct-Horse-Battery-Staple1!';
        $this->fakePwnedPasswordsApi($password, true);

        $response = $this->postJson('/api/register', $this->registerPayload($password));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
        $this->assertDatabaseMissing('users', ['email' => 'ada@example.com']);
    }

    public function test_registration_accepts_a_strong_unbreached_password(): void
    {
        $password = 'Tqz9!vKxr2#pL';
        $this->fakePwnedPasswordsApi($password, false);

        $response = $this->postJson('/api/register', $this->registerPayload($password));

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'ada@example.com']);
    }

    public function test_password_change_rejects_a_password_found_in_a_known_breach(): void
    {
        $user = User::factory()->create(['password' => Hash::make('OldPassw0rd!')]);
        $password = 'Correct-Horse-Battery-Staple1!';
        $this->fakePwnedPasswordsApi($password, true);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/profile/password', [
            'current_password' => 'OldPassw0rd!',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
        $this->assertTrue(Hash::check('OldPassw0rd!', $user->fresh()->password));
    }

    public function test_password_change_accepts_a_strong_unbreached_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('OldPassw0rd!')]);
        $password = 'Tqz9!vKxr2#pL';
        $this->fakePwnedPasswordsApi($password, false);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/profile/password', [
            'current_password' => 'OldPassw0rd!',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response->assertOk();
        $this->assertTrue(Hash::check($password, $user->fresh()->password));
    }
}
