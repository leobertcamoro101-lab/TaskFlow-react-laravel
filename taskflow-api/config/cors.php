<?php

return [
    'paths' => ['api/*'],
    'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173'))),
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    // No cookie-based auth is in use (the SPA sends a Bearer token from
    // localStorage, not withCredentials cookies), so this stays off to
    // limit what a misconfigured CORS_ALLOWED_ORIGINS could expose.
    'supports_credentials' => false,
];
