<?php

declare(strict_types=1);

namespace App;

use PDO;

final class Database
{
    public static function connection(): PDO
    {
        return self::makeConnection(
            getenv('DB_USERNAME') ?: 'app_user',
            getenv('DB_PASSWORD') ?: 'app_password'
        );
    }

    public static function adminConnection(): PDO
    {
        return self::makeConnection(
            getenv('DB_ADMIN_USERNAME') ?: 'admin_user',
            getenv('DB_ADMIN_PASSWORD') ?: 'admin_password'
        );
    }

    private static function makeConnection(string $username, string $password): PDO
    {
        $host = getenv('DB_HOST') ?: 'mysql';
        $port = getenv('DB_PORT') ?: '3306';
        $database = getenv('DB_DATABASE') ?: 'antiquites';

        return new PDO(
            "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4",
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    }
}
