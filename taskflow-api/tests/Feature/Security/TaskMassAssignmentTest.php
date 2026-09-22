<?php

namespace Tests\Feature\Security;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskMassAssignmentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Model-level guard: 'user_id' was removed from Task::$fillable, so
     * mass-assigning it (fill()/create() with an array) must be silently
     * ignored regardless of what any controller does with the value.
     */
    public function test_the_task_model_does_not_mass_assign_user_id(): void
    {
        $task = new Task([
            'title' => 'Direct fill attempt',
            'user_id' => 999999,
        ]);

        $this->assertSame('Direct fill attempt', $task->title);
        $this->assertNull($task->user_id);
    }

    public function test_creating_a_task_ignores_a_client_supplied_user_id(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        Sanctum::actingAs($owner);

        $response = $this->postJson('/api/tasks', [
            'title' => 'Ship the report',
            'user_id' => $otherUser->id,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tasks', [
            'title' => 'Ship the report',
            'user_id' => $owner->id,
        ]);
        $this->assertDatabaseMissing('tasks', [
            'title' => 'Ship the report',
            'user_id' => $otherUser->id,
        ]);
    }

    public function test_updating_a_task_cannot_reassign_it_to_another_user(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $task = $owner->tasks()->create(['title' => 'Original title']);

        Sanctum::actingAs($owner);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'title' => 'Retitled',
            'user_id' => $otherUser->id,
        ]);

        $response->assertOk();

        $task->refresh();
        $this->assertSame('Retitled', $task->title);
        $this->assertSame($owner->id, $task->user_id);
    }
}
