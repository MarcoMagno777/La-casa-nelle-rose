<?php

declare(strict_types=1);

namespace App;

use Psr\Http\Message\ServerRequestInterface as Request;

final class Auth
{
    public static function tokenFor(array $user, bool $remember): string
    {
        $now = time();
        $ttl = $remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8;

        $payload = [
            'iat' => $now,
            'exp' => $now + $ttl,
            'sub' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => 'user',
        ];

        return self::encode($payload);
    }

    public static function adminTokenFor(string $username): string
    {
        $now = time();
        return self::encode([
            'iat' => $now,
            'exp' => $now + 60 * 60 * 8,
            'sub' => 'admin',
            'username' => $username,
            'role' => 'admin',
        ]);
    }

    public static function isAdmin(Request $request): bool
    {
        $payload = self::payloadFrom($request);
        return ($payload['role'] ?? '') === 'admin';
    }

    private static function encode(array $payload): string
    {
        $body = self::base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));
        $signature = self::signature($body);
        return $body . '.' . $signature;
    }

    public static function userIdFrom(Request $request): ?int
    {
        $payload = self::payloadFrom($request);
        return ($payload['role'] ?? '') === 'user' ? (int) $payload['sub'] : null;
    }

    private static function payloadFrom(Request $request): ?array
    {
        $header = $request->getHeaderLine('Authorization');
        if (!str_starts_with($header, 'Bearer ')) return null;

        try {
            [$body, $signature] = explode('.', substr($header, 7), 2);
            if (!hash_equals(self::signature($body), $signature)) return null;

            $payload = json_decode(self::base64UrlDecode($body), true, 512, JSON_THROW_ON_ERROR);
            return (($payload['exp'] ?? 0) >= time()) ? $payload : null;
        } catch (\Throwable) {
            return null;
        }
    }

    private static function secret(): string
    {
        return getenv('JWT_SECRET') ?: 'local-dev-secret-change-me';
    }

    private static function signature(string $body): string
    {
        return self::base64UrlEncode(hash_hmac('sha256', $body, self::secret(), true));
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string
    {
        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }
}
