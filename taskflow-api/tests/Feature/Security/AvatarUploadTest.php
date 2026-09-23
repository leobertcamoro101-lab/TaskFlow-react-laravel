<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * UpdateProfileRequest restricts 'avatar' to mimes:jpeg,jpg,png,gif,webp
 * (deliberately excluding svg, which can carry inline <script>) capped at
 * 2MB. These tests pin that behavior down.
 */
class AvatarUploadTest extends TestCase
{
    use RefreshDatabase;

    private function profilePayload(): array
    {
        return [
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'birthday' => '1990-01-01',
            'gender' => 'female',
            'email' => 'ada-profile@example.com',
        ];
    }

    public function test_a_non_image_file_is_rejected(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->put('/api/profile', $this->profilePayload() + [
            'avatar' => UploadedFile::fake()->create('shell.php', 10, 'application/x-php'),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('avatar');
        $this->assertNull($user->fresh()->avatar);
    }

    public function test_an_oversized_image_is_rejected(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->put('/api/profile', $this->profilePayload() + [
            // The rule caps this at 2048 KB. create() (rather than image(),
            // which needs the GD extension to render real pixels) is enough
            // here since Laravel's fake uploads trust the declared MIME type
            // in test mode — we're exercising the size rule, not GD.
            'avatar' => UploadedFile::fake()->create('avatar.jpg', 3000, 'image/jpeg'),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('avatar');
    }

    public function test_a_valid_image_replaces_the_previous_avatar(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['avatar' => 'avatars/old.jpg']);
        Storage::disk('public')->put('avatars/old.jpg', 'old-avatar-bytes');

        Sanctum::actingAs($user);

        $response = $this->put('/api/profile', $this->profilePayload() + [
            'avatar' => UploadedFile::fake()->create('new-avatar.jpg', 100, 'image/jpeg'),
        ]);

        $response->assertOk();

        $user->refresh();
        $this->assertNotNull($user->avatar);
        $this->assertNotSame('avatars/old.jpg', $user->avatar);
        Storage::disk('public')->assertExists($user->avatar);
        Storage::disk('public')->assertMissing('avatars/old.jpg');
    }
}
