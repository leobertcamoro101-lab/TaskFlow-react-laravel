<?php

namespace Tests\Feature\Security;

use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    /**
     * AddSecurityHeaders is registered as a global (append) middleware in
     * bootstrap/app.php, so it should run on every response — including
     * ones the app never expected to render HTML, like a validation error.
     */
    public function test_a_public_api_response_includes_the_security_headers(): void
    {
        // Deliberately invalid payload: we only care about the headers on
        // the resulting 422, not the validation outcome itself.
        $response = $this->postJson('/api/login', []);

        $response->assertHeader(
            'Content-Security-Policy',
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
        );
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('Referrer-Policy', 'no-referrer');
    }

    public function test_an_unauthenticated_response_also_includes_the_security_headers(): void
    {
        $response = $this->getJson('/api/tasks');

        $response->assertStatus(401);
        $response->assertHeader('Content-Security-Policy');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('Referrer-Policy', 'no-referrer');
    }
}
