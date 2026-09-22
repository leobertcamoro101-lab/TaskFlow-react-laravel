<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddSecurityHeaders
{
    /**
     * Attach a restrictive Content-Security-Policy (and a few related
     * security headers) to every response.
     *
     * This API only ever returns JSON, so the policy is intentionally
     * locked down: no scripts, styles, frames, or embedded content of
     * any kind should ever execute in the context of this origin. That
     * still matters here because:
     *  - Laravel's debug error page (APP_DEBUG=true) renders full HTML
     *    with inline scripts/styles if an exception escapes a request.
     *  - A misconfigured or future route could start returning HTML.
     *  - Browsers apply CSP to any response they load, JSON or not, so
     *    a directly-visited or framed endpoint is still covered.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('Content-Security-Policy', implode('; ', [
            "default-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'none'",
            "form-action 'none'",
        ]));

        // Defense-in-depth alongside the CSP above.
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'no-referrer');

        return $response;
    }
}
