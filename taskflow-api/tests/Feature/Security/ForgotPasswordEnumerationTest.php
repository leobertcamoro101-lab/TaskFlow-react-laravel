<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ForgotPasswordEnumerationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    /**
     * /api/forgot-password must respond identically whether or not the
     * email belongs to a real account — the frontend's own copy ("If an
     * account exists for that email...") assumes this. Only the actual
     * side effect (sending the notification) should depend on whether the
     * account exists.
     */
    public function test_the_response_is_identical_for_an_existing_and_a_missing_email(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'real-user@example.com']);

        $existing = $this->postJson('/api/forgot-password', ['email' => 'real-user@example.com']);
        $missing = $this->postJson('/api/forgot-password', ['email' => 'no-such-account@example.com']);

        $existing->assertOk();
        $missing->assertOk();
        $this->assertSame($existing->json('message'), $missing->json('message'));
        $this->assertSame($existing->status(), $missing->status());

        // The uniform response shouldn't mean nothing happened: the real
        // account should still get a reset link, and only that account.
        Notification::assertSentTo($user, ResetPassword::class);
        Notification::assertCount(1);
    }
}
