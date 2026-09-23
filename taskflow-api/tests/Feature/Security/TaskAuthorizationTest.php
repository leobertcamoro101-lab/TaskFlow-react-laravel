<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * TaskController checks task ownership by hand in show/update/destroy
 * (`$task->user_id !== $request->user()->id`) rather than via a policy or
 * route-model scoping. These tests exist so a future refactor of that
 * logic can't silently drop the check and open an IDOR.
 */
class TaskAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_cannot_view_another_users_task(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $task = $owner->tasks()->create(['title' => 'Private task']);

        Sanctum::actingAs($intruder);

        $this->getJson("/api/tasks/{$task->id}")->assertStatus(403);
    }

    public function test_a_user_cannot_update_another_users_task(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $task = $owner->tasks()->create(['title' => 'Private task']);

        Sanctum::actingAs($intruder);

        $this->putJson("/api/tasks/{$task->id}", ['title' => 'Hijacked'])
            ->assertStatus(403);

        $this->assertSame('Private task', $task->fresh()->title);
    }

    public function test_a_user_cannot_delete_another_users_task(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $task = $owner->tasks()->create(['title' => 'Private task']);

        Sanctum::actingAs($intruder);

        $this->deleteJson("/api/tasks/{$task->id}")->assertStatus(403);

        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }

    public function test_the_task_index_only_lists_the_authenticated_users_own_tasks(): void
    {
        $me = User::factory()->create();
        $someoneElse = User::factory()->create();

        $mine = $me->tasks()->create(['title' => 'Mine']);
        $theirs = $someoneElse->tasks()->create(['title' => 'Theirs']);

        Sanctum::actingAs($me);

        $response = $this->getJson('/api/tasks');
        $response->assertOk();

        $ids = collect($response->json())->pluck('id');
        $this->assertTrue($ids->contains($mine->id));
        $this->assertFalse($ids->contains($theirs->id));
    }
}
