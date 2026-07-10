<?php

declare(strict_types=1);

use App\Auth;
use App\Database;
use PHPMailer\PHPMailer\PHPMailer;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();
$app->addErrorMiddleware((getenv('APP_ENV') ?: 'production') !== 'production', true, true);

$json = static function (Response $response, mixed $payload, int $status = 200): Response {
    $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
};

$requireUser = static function (Request $request, Response $response) use ($json): int|Response {
    $userId = Auth::userIdFrom($request);
    return $userId ?: $json($response, ['error' => 'Unauthorized'], 401);
};

$requireAdmin = static function (Request $request, Response $response) use ($json): bool|Response {
    return Auth::isAdmin($request) ? true : $json($response, ['error' => 'Unauthorized'], 401);
};

$normalizeFurniture = static function (array $row): array {
    $row['id'] = (int) $row['id'];
    $row['liked'] = isset($row['liked']) ? (bool) $row['liked'] : false;
    $row['images'] = json_decode($row['images'], true) ?: [];
    return $row;
};

$storeUploadedImages = static function (array $uploadedFiles): array {
    $images = [];
    $targetDir = __DIR__ . '/uploads';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0775, true);
    }

    $files = $uploadedFiles['images'] ?? [];
    if ($files && !is_array($files)) {
        $files = [$files];
    }

    foreach ($files as $file) {
        if (!$file || $file->getError() !== UPLOAD_ERR_OK) continue;

        $mediaType = $file->getClientMediaType();
        $extension = match ($mediaType) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => null,
        };
        if (!$extension) continue;

        $filename = bin2hex(random_bytes(16)) . '.' . $extension;
        $file->moveTo($targetDir . '/' . $filename);
        $images[] = '/uploads/' . $filename;
    }

    return $images;
};

$storeUploadedImage = static function (array $uploadedFiles, string $key): ?string {
    $targetDir = __DIR__ . '/uploads';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0775, true);
    }

    $file = $uploadedFiles[$key] ?? null;
    if (!$file || is_array($file) || $file->getError() !== UPLOAD_ERR_OK) {
        return null;
    }

    $mediaType = $file->getClientMediaType();
    $extension = match ($mediaType) {
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        default => null,
    };
    if (!$extension) return null;

    $filename = 'hero-' . $key . '-' . bin2hex(random_bytes(10)) . '.' . $extension;
    $file->moveTo($targetDir . '/' . $filename);
    return '/uploads/' . $filename;
};

$settingsPath = static fn (): string => __DIR__ . '/uploads/site-settings.json';

$defaultSiteSettings = static fn (): array => [
    'homeHeroImage' => '/assets/hero-la-casa-nelle-rose.png',
    'catalogHeroImage' => '',
];

$readSiteSettings = static function () use ($settingsPath, $defaultSiteSettings): array {
    $settings = $defaultSiteSettings();
    $path = $settingsPath();
    if (!is_file($path)) return $settings;

    $stored = json_decode((string) file_get_contents($path), true);
    if (!is_array($stored)) return $settings;

    return [
        'homeHeroImage' => is_string($stored['homeHeroImage'] ?? null) && $stored['homeHeroImage'] !== '' ? $stored['homeHeroImage'] : $settings['homeHeroImage'],
        'catalogHeroImage' => is_string($stored['catalogHeroImage'] ?? null) ? $stored['catalogHeroImage'] : $settings['catalogHeroImage'],
    ];
};

$writeSiteSettings = static function (array $settings) use ($settingsPath): void {
    $path = $settingsPath();
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    file_put_contents($path, json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
};

$realizationsPath = static fn (): string => __DIR__ . '/uploads/realizations.json';

$defaultRealizations = static fn (): array => [
    [
        'name' => 'Villa Rose',
        'place' => 'Casa indipendente, colline fiorentine',
        'description' => 'Un intervento pensato per dare continuita alla zona giorno, usando mobili chiari, tessuti naturali e pezzi francesi con patina vissuta.',
        'rooms' => [
            [
                'id' => 'villa-rose-soggiorno',
                'room' => 'Soggiorno',
                'place' => 'Zona giorno',
                'before' => '/assets/realizzazioni/soggiorno-prima.png',
                'after' => '/assets/realizzazioni/soggiorno-dopo.png',
                'note' => 'Un ambiente spoglio e poco definito trasformato con divano in lino, specchiera antica e mobili chiari di gusto provenzale.',
            ],
            [
                'id' => 'villa-rose-pranzo',
                'room' => 'Sala da pranzo',
                'place' => 'Zona pranzo',
                'before' => '/assets/realizzazioni/pranzo-prima.png',
                'after' => '/assets/realizzazioni/pranzo-dopo.png',
                'note' => 'La stessa casa prosegue nella sala da pranzo con tavolo antico, sedute leggere e una credenza grigio perla.',
            ],
        ],
    ],
    [
        'name' => 'Maison Claire',
        'place' => 'Terratetto, centro storico',
        'description' => 'Una casa compatta, resa piu luminosa attraverso arredi proporzionati, sedute leggere e superfici in bianco e grigio perla.',
        'rooms' => [
            [
                'id' => 'maison-claire-camera',
                'room' => 'Camera ospiti',
                'place' => 'Zona notte',
                'before' => '/assets/realizzazioni/camera-prima.png',
                'after' => '/assets/realizzazioni/camera-dopo.png',
                'note' => 'La stanza ospiti viene resa piu morbida con legni chiari, tessili naturali e piccoli complementi francesi.',
            ],
        ],
    ],
    [
        'name' => 'Casa del Cortile',
        'place' => 'Appartamento, piano nobile',
        'description' => 'Un progetto piu intimo, dove la camera viene ammorbidita con legni decapati, lino e piccoli dettagli decorativi.',
        'rooms' => [
            [
                'id' => 'casa-del-cortile-camera',
                'room' => 'Camera matrimoniale',
                'place' => 'Zona notte',
                'before' => '/assets/realizzazioni/camera-prima.png',
                'after' => '/assets/realizzazioni/camera-dopo.png',
                'note' => 'Una camera essenziale diventa piu morbida e raccolta con armadio decapato, tessili naturali e comodini scolpiti.',
            ],
            [
                'id' => 'casa-del-cortile-soggiorno',
                'room' => 'Piccolo soggiorno',
                'place' => 'Zona lettura',
                'before' => '/assets/realizzazioni/soggiorno-prima.png',
                'after' => '/assets/realizzazioni/soggiorno-dopo.png',
                'note' => 'Un angolo lettura viene armonizzato con specchiera, sedute chiare e oggetti scelti per legare la stanza al resto della casa.',
            ],
        ],
    ],
];

$readRealizations = static function () use ($realizationsPath, $defaultRealizations): array {
    $path = $realizationsPath();
    if (!is_file($path)) return $defaultRealizations();

    $stored = json_decode((string) file_get_contents($path), true);
    return is_array($stored) ? $stored : $defaultRealizations();
};

$writeRealizations = static function (array $realizations) use ($realizationsPath): void {
    $path = $realizationsPath();
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    file_put_contents($path, json_encode(array_values($realizations), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
};

$furniturePayload = static function (Request $request): array {
    $data = (array) $request->getParsedBody();
    return [
        'name' => trim((string) ($data['name'] ?? '')),
        'description' => trim((string) ($data['description'] ?? '')),
        'placement' => trim((string) ($data['placement'] ?? '')),
        'category' => trim((string) ($data['category'] ?? '')),
        'period' => trim((string) ($data['period'] ?? '')),
    ];
};

$isValidFurniturePayload = static fn (array $data): bool => $data['name'] !== ''
    && $data['description'] !== ''
    && $data['category'] !== '';

$isValidPassword = static function (string $password): bool {
    $length = strlen($password);
    return $length >= 8
        && $length <= 20
        && preg_match('/[0-9]/', $password)
        && preg_match('/[^A-Za-z0-9]/', $password);
};

$sendPasswordResetEmail = static function (string $email, string $resetLink): bool {
    if (!getenv('SMTP_HOST') || !getenv('SMTP_USERNAME') || !getenv('SMTP_PASSWORD')) {
        return false;
    }

    try {
        $smtpUsername = getenv('SMTP_USERNAME');
        $companyEmail = getenv('COMPANY_EMAIL') ?: $smtpUsername;
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = getenv('SMTP_HOST');
        $mail->Port = (int) (getenv('SMTP_PORT') ?: 587);
        $mail->SMTPAuth = true;
        $mail->Username = $smtpUsername;
        $mail->Password = getenv('SMTP_PASSWORD');
        if ((getenv('SMTP_SECURE') ?: 'tls') !== '') {
            $mail->SMTPSecure = getenv('SMTP_SECURE') ?: 'tls';
        }
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($companyEmail, 'La Casa nelle Rose');
        $mail->addAddress($email);
        $mail->Subject = 'Reimposta la password';
        $mail->Body = "Abbiamo ricevuto una richiesta di reset password.\n\nApri questo link entro 60 minuti:\n{$resetLink}\n\nSe non hai richiesto tu il reset, ignora questa email.";
        $mail->send();
    } catch (Throwable $exception) {
        error_log('Password reset email failed: ' . $exception->getMessage());
        return false;
    }

    return true;
};

$app->options('/{routes:.+}', fn (Request $request, Response $response) => $response);

$app->add(function (Request $request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', getenv('APP_URL') ?: '*')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
});

$app->post('/api/visits', function (Request $request, Response $response) use ($json) {
    $data = (array) $request->getParsedBody();
    $path = substr(trim((string) ($data['path'] ?? '/')), 0, 255);
    if (str_starts_with($path, '/admin')) {
        return $json($response, ['status' => 'ignored']);
    }

    $ip = $request->getServerParams()['REMOTE_ADDR'] ?? '';
    $ua = substr($request->getHeaderLine('User-Agent'), 0, 255);
    Database::connection()
        ->prepare('INSERT INTO site_visits (path, user_agent, ip_hash) VALUES (:path, :user_agent, :ip_hash)')
        ->execute([
            'path' => $path ?: '/',
            'user_agent' => $ua ?: null,
            'ip_hash' => $ip ? hash('sha256', $ip . (getenv('JWT_SECRET') ?: 'local-dev-secret-change-me')) : null,
        ]);

    return $json($response, ['status' => 'recorded'], 201);
});

$app->post('/api/admin/login', function (Request $request, Response $response) use ($json) {
    $data = (array) $request->getParsedBody();
    $username = trim((string) ($data['username'] ?? ''));
    $password = (string) ($data['password'] ?? '');
    $adminUsername = getenv('ADMIN_USERNAME') ?: 'admin';
    $adminPasswordHash = getenv('ADMIN_PASSWORD_HASH') ?: '$2y$10$78u.lpYeOywm59Ak8sfTn.kdOGVsB0/yzNFO22br3ZlOro42bEnaG';

    if (!hash_equals($adminUsername, $username) || !password_verify($password, $adminPasswordHash)) {
        return $json($response, ['error' => 'Invalid credentials'], 401);
    }

    return $json($response, ['token' => Auth::adminTokenFor($adminUsername), 'username' => $adminUsername]);
});

$app->get('/api/site-settings', function (Request $request, Response $response) use ($json, $readSiteSettings) {
    return $json($response, $readSiteSettings());
});

$app->get('/api/realizations', function (Request $request, Response $response) use ($json, $readRealizations) {
    return $json($response, $readRealizations());
});

$app->post('/api/admin/site-settings', function (Request $request, Response $response) use ($json, $requireAdmin, $readSiteSettings, $writeSiteSettings, $storeUploadedImage) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    $settings = $readSiteSettings();
    $uploadedFiles = $request->getUploadedFiles();
    $homeHeroImage = $storeUploadedImage($uploadedFiles, 'homeHeroImage');
    $catalogHeroImage = $storeUploadedImage($uploadedFiles, 'catalogHeroImage');

    if ($homeHeroImage) {
        $settings['homeHeroImage'] = $homeHeroImage;
    }
    if ($catalogHeroImage) {
        $settings['catalogHeroImage'] = $catalogHeroImage;
    }

    $writeSiteSettings($settings);
    return $json($response, $settings);
});

$app->post('/api/admin/realizations', function (Request $request, Response $response) use ($json, $requireAdmin, $readRealizations, $writeRealizations, $storeUploadedImage) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    $data = (array) $request->getParsedBody();
    $houseName = trim((string) ($data['houseName'] ?? ''));
    $housePlace = trim((string) ($data['housePlace'] ?? ''));
    $houseDescription = trim((string) ($data['houseDescription'] ?? ''));
    $room = trim((string) ($data['room'] ?? ''));
    $roomPlace = trim((string) ($data['roomPlace'] ?? ''));
    $note = trim((string) ($data['note'] ?? ''));
    $before = $storeUploadedImage($request->getUploadedFiles(), 'beforeImage');
    $after = $storeUploadedImage($request->getUploadedFiles(), 'afterImage');

    if ($houseName === '' || $housePlace === '' || $houseDescription === '' || $room === '' || $roomPlace === '' || $note === '' || !$before || !$after) {
        return $json($response, ['error' => 'Invalid data'], 422);
    }

    $realizations = $readRealizations();
    $roomPayload = [
        'id' => bin2hex(random_bytes(8)),
        'room' => $room,
        'place' => $roomPlace,
        'before' => $before,
        'after' => $after,
        'note' => $note,
    ];

    $houseFound = false;
    foreach ($realizations as &$house) {
        if (($house['name'] ?? '') !== $houseName) continue;
        $house['place'] = $housePlace;
        $house['description'] = $houseDescription;
        $house['rooms'][] = $roomPayload;
        $houseFound = true;
        break;
    }
    unset($house);

    if (!$houseFound) {
        $realizations[] = [
            'name' => $houseName,
            'place' => $housePlace,
            'description' => $houseDescription,
            'rooms' => [$roomPayload],
        ];
    }

    $writeRealizations($realizations);
    return $json($response, $realizations, 201);
});

$app->delete('/api/admin/realizations/{id}', function (Request $request, Response $response, array $args) use ($json, $requireAdmin, $readRealizations, $writeRealizations) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    $roomId = (string) $args['id'];
    $realizations = [];
    foreach ($readRealizations() as $house) {
        $rooms = array_values(array_filter($house['rooms'] ?? [], static fn ($room) => ($room['id'] ?? '') !== $roomId));
        if (count($rooms) === 0) continue;
        $house['rooms'] = $rooms;
        $realizations[] = $house;
    }

    $writeRealizations($realizations);
    return $json($response, $realizations);
});

$app->get('/api/admin/stats', function (Request $request, Response $response) use ($json, $requireAdmin) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    $db = Database::adminConnection();
    $totalStatement = $db->prepare('SELECT COUNT(*) FROM site_visits');
    $totalStatement->execute();
    $total = (int) $totalStatement->fetchColumn();
    $todayStatement = $db->prepare('SELECT COUNT(*) FROM site_visits WHERE created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL 1 DAY');
    $todayStatement->execute();
    $today = (int) $todayStatement->fetchColumn();
    $furnitureStatement = $db->prepare('SELECT COUNT(*) FROM furniture');
    $furnitureStatement->execute();
    $furniture = (int) $furnitureStatement->fetchColumn();

    return $json($response, ['totalVisits' => $total, 'todayVisits' => $today, 'furnitureCount' => $furniture]);
});

$app->get('/api/admin/furniture', function (Request $request, Response $response) use ($json, $requireAdmin, $normalizeFurniture) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    $statement = Database::adminConnection()->prepare('SELECT * FROM furniture ORDER BY created_at DESC');
    $statement->execute();
    return $json($response, array_map($normalizeFurniture, $statement->fetchAll()));
});

$app->post('/api/admin/furniture', function (Request $request, Response $response) use ($json, $requireAdmin, $storeUploadedImages, $furniturePayload, $isValidFurniturePayload) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    $data = $furniturePayload($request);
    $images = $storeUploadedImages($request->getUploadedFiles());
    if (!$isValidFurniturePayload($data) || count($images) === 0) {
        return $json($response, ['error' => 'Invalid data'], 422);
    }

    $db = Database::adminConnection();
    $statement = $db->prepare(
        'INSERT INTO furniture (name, description, placement, category, period, images)
         VALUES (:name, :description, :placement, :category, :period, :images)'
    );
    $statement->execute([...$data, 'images' => json_encode($images, JSON_UNESCAPED_SLASHES)]);

    return $json($response, ['id' => (int) $db->lastInsertId()], 201);
});

$app->post('/api/admin/furniture/{id}', function (Request $request, Response $response, array $args) use ($json, $requireAdmin, $storeUploadedImages, $furniturePayload, $isValidFurniturePayload) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    $db = Database::adminConnection();
    $id = (int) $args['id'];
    $current = $db->prepare('SELECT images FROM furniture WHERE id = :id');
    $current->execute(['id' => $id]);
    $row = $current->fetch();
    if (!$row) return $json($response, ['error' => 'Not found'], 404);

    $data = $furniturePayload($request);
    if (!$isValidFurniturePayload($data)) {
        return $json($response, ['error' => 'Invalid data'], 422);
    }

    $existingImages = (array) json_decode((string) ($request->getParsedBody()['existingImages'] ?? '[]'), true);
    $existingImages = array_values(array_filter($existingImages, static fn ($image) => is_string($image) && $image !== ''));
    $images = array_merge($existingImages, $storeUploadedImages($request->getUploadedFiles()));
    if (count($images) === 0) {
        $images = json_decode($row['images'], true) ?: [];
    }

    $statement = $db->prepare(
        'UPDATE furniture
         SET name = :name, description = :description, placement = :placement, category = :category, period = :period, images = :images
         WHERE id = :id'
    );
    $statement->execute([...$data, 'images' => json_encode($images, JSON_UNESCAPED_SLASHES), 'id' => $id]);

    return $json($response, ['status' => 'updated']);
});

$app->delete('/api/admin/furniture/{id}', function (Request $request, Response $response, array $args) use ($json, $requireAdmin) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    Database::adminConnection()->prepare('DELETE FROM furniture WHERE id = :id')->execute(['id' => (int) $args['id']]);
    return $json($response, ['status' => 'deleted']);
});

$app->get('/api/furniture', function (Request $request, Response $response) use ($json, $normalizeFurniture) {
    $db = Database::connection();
    $params = $request->getQueryParams();
    $query = trim((string) ($params['q'] ?? ''));
    $category = trim((string) ($params['category'] ?? ''));
    $userId = Auth::userIdFrom($request);

    $sql = 'SELECT f.*, EXISTS(SELECT 1 FROM favorites fav WHERE fav.furniture_id = f.id AND fav.user_id = :user_id) AS liked
            FROM furniture f WHERE 1 = 1';
    $bindings = ['user_id' => $userId ?: 0];

    if ($query !== '') {
        $sql .= ' AND (f.name LIKE :query OR f.description LIKE :query OR f.placement LIKE :query)';
        $bindings['query'] = '%' . $query . '%';
    }

    if ($category !== '') {
        $sql .= ' AND f.category = :category';
        $bindings['category'] = $category;
    }

    $sql .= ' ORDER BY f.created_at DESC';
    $statement = $db->prepare($sql);
    $statement->execute($bindings);
    $items = array_map($normalizeFurniture, $statement->fetchAll());

    return $json($response, $items);
});

$app->post('/api/auth/register', function (Request $request, Response $response) use ($json, $isValidPassword) {
    $db = Database::connection();
    $data = (array) $request->getParsedBody();
    $username = trim((string) ($data['username'] ?? ''));
    $email = filter_var((string) ($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $password = (string) ($data['password'] ?? '');

    if ($username === '' || !$email || !$isValidPassword($password)) {
        return $json($response, ['error' => 'Invalid credentials'], 422);
    }

    try {
        $statement = $db->prepare('INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password_hash)');
        $statement->execute([
            'username' => $username,
            'email' => $email,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);
    } catch (Throwable) {
        return $json($response, ['error' => 'Invalid credentials'], 409);
    }

    $user = ['id' => (int) $db->lastInsertId(), 'username' => $username, 'email' => $email];
    return $json($response, ['token' => Auth::tokenFor($user, true), 'user' => $user], 201);
});

$app->post('/api/auth/login', function (Request $request, Response $response) use ($json) {
    $db = Database::connection();
    $data = (array) $request->getParsedBody();
    $identifier = trim((string) ($data['identifier'] ?? ''));
    $password = (string) ($data['password'] ?? '');
    $remember = (bool) ($data['remember'] ?? false);

    $statement = $db->prepare('SELECT * FROM users WHERE username = :identifier OR email = :identifier LIMIT 1');
    $statement->execute(['identifier' => $identifier]);
    $user = $statement->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        return $json($response, ['error' => 'Invalid credentials'], 401);
    }

    $payload = ['id' => (int) $user['id'], 'username' => $user['username'], 'email' => $user['email']];
    return $json($response, ['token' => Auth::tokenFor($payload, $remember), 'user' => $payload]);
});

$app->post('/api/auth/password-reset/request', function (Request $request, Response $response) use ($json, $sendPasswordResetEmail) {
    $db = Database::connection();
    $data = (array) $request->getParsedBody();
    $email = filter_var((string) ($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);

    if (!$email) {
        return $json($response, ['error' => 'Invalid data'], 422);
    }

    $statement = $db->prepare('SELECT id, email FROM users WHERE email = :email LIMIT 1');
    $statement->execute(['email' => $email]);
    $user = $statement->fetch();

    if (!$user) {
        return $json($response, ['status' => 'sent']);
    }

    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $expiresAt = (new DateTimeImmutable('+60 minutes'))->format('Y-m-d H:i:s');

    $db->prepare('DELETE FROM password_resets WHERE user_id = :user_id OR expires_at < NOW() OR used_at IS NOT NULL')
        ->execute(['user_id' => (int) $user['id']]);

    $insert = $db->prepare('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (:user_id, :token_hash, :expires_at)');
    $insert->execute([
        'user_id' => (int) $user['id'],
        'token_hash' => $tokenHash,
        'expires_at' => $expiresAt,
    ]);

    $appUrl = rtrim(getenv('APP_URL') ?: 'http://localhost:4200', '/');
    $resetLink = $appUrl . '/login?email=' . rawurlencode($email) . '&reset_token=' . rawurlencode($token);
    $sent = $sendPasswordResetEmail($email, $resetLink);

    $payload = ['status' => 'sent'];
    if (!$sent) {
        return $json($response, ['error' => 'Email service not configured'], 503);
    }

    return $json($response, $payload);
});

$app->post('/api/auth/password-reset/confirm', function (Request $request, Response $response) use ($json, $isValidPassword) {
    $db = Database::connection();
    $data = (array) $request->getParsedBody();
    $email = filter_var((string) ($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $token = (string) ($data['token'] ?? '');
    $password = (string) ($data['password'] ?? '');

    if (!$email || $token === '' || !$isValidPassword($password)) {
        return $json($response, ['error' => 'Invalid data'], 422);
    }

    $tokenHash = hash('sha256', $token);
    $statement = $db->prepare(
        'SELECT pr.id, pr.user_id
         FROM password_resets pr
         INNER JOIN users u ON u.id = pr.user_id
         WHERE u.email = :email
           AND pr.token_hash = :token_hash
           AND pr.used_at IS NULL
           AND pr.expires_at > NOW()
         LIMIT 1'
    );
    $statement->execute(['email' => $email, 'token_hash' => $tokenHash]);
    $reset = $statement->fetch();

    if (!$reset) {
        return $json($response, ['error' => 'Invalid token'], 422);
    }

    $db->beginTransaction();
    try {
        $update = $db->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :id');
        $update->execute([
            'id' => (int) $reset['user_id'],
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);

        $consume = $db->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = :id');
        $consume->execute(['id' => (int) $reset['id']]);
        $db->commit();
    } catch (Throwable) {
        $db->rollBack();
        return $json($response, ['error' => 'Unable to reset password'], 500);
    }

    return $json($response, ['status' => 'updated']);
});

$app->get('/api/me', function (Request $request, Response $response) use ($json, $requireUser) {
    $userId = $requireUser($request, $response);
    if ($userId instanceof Response) return $userId;

    $statement = Database::connection()->prepare('SELECT id, username, email FROM users WHERE id = :id');
    $statement->execute(['id' => $userId]);
    $user = $statement->fetch();

    return $user ? $json($response, $user) : $json($response, ['error' => 'Not found'], 404);
});

$app->get('/api/me/favorites', function (Request $request, Response $response) use ($json, $requireUser) {
    $userId = $requireUser($request, $response);
    if ($userId instanceof Response) return $userId;

    $statement = Database::connection()->prepare(
        'SELECT f.*, 1 AS liked FROM furniture f
         INNER JOIN favorites fav ON fav.furniture_id = f.id
         WHERE fav.user_id = :user_id
         ORDER BY fav.created_at DESC'
    );
    $statement->execute(['user_id' => $userId]);
    $items = array_map(static function (array $row): array {
        $row['id'] = (int) $row['id'];
        $row['liked'] = true;
        $row['images'] = json_decode($row['images'], true) ?: [];
        return $row;
    }, $statement->fetchAll());

    return $json($response, $items);
});

$app->post('/api/me/favorites/{id}', function (Request $request, Response $response, array $args) use ($json, $requireUser) {
    $userId = $requireUser($request, $response);
    if ($userId instanceof Response) return $userId;

    $db = Database::connection();
    $furnitureId = (int) $args['id'];
    $statement = $db->prepare('SELECT 1 FROM favorites WHERE user_id = :user_id AND furniture_id = :furniture_id');
    $statement->execute(['user_id' => $userId, 'furniture_id' => $furnitureId]);

    if ($statement->fetch()) {
        $delete = $db->prepare('DELETE FROM favorites WHERE user_id = :user_id AND furniture_id = :furniture_id');
        $delete->execute(['user_id' => $userId, 'furniture_id' => $furnitureId]);
        return $json($response, ['liked' => false]);
    }

    $insert = $db->prepare('INSERT INTO favorites (user_id, furniture_id) VALUES (:user_id, :furniture_id)');
    $insert->execute(['user_id' => $userId, 'furniture_id' => $furnitureId]);
    return $json($response, ['liked' => true]);
});

$app->post('/api/inquiries', function (Request $request, Response $response) use ($json, $requireUser) {
    $userId = $requireUser($request, $response);
    if ($userId instanceof Response) return $userId;

    $data = (array) $request->getParsedBody();
    $subject = trim((string) ($data['subject'] ?? ''));
    $message = trim((string) ($data['message'] ?? ''));
    $furnitureId = isset($data['furnitureId']) ? (int) $data['furnitureId'] : null;

    if ($subject === '' || $message === '') {
        return $json($response, ['error' => 'Invalid data'], 422);
    }

    $db = Database::connection();
    $statement = $db->prepare('INSERT INTO inquiries (user_id, furniture_id, subject, message) VALUES (:user_id, :furniture_id, :subject, :message)');
    $statement->execute([
        'user_id' => $userId,
        'furniture_id' => $furnitureId,
        'subject' => $subject,
        'message' => $message,
    ]);

    $userStatement = $db->prepare('SELECT username, email FROM users WHERE id = :id LIMIT 1');
    $userStatement->execute(['id' => $userId]);
    $user = $userStatement->fetch() ?: [];
    $userEmail = filter_var((string) ($user['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $userName = trim((string) ($user['username'] ?? 'Cliente'));

    $companyEmail = getenv('COMPANY_EMAIL') ?: 'marcomagno007@gmail.com';
    if ($userEmail && getenv('SMTP_HOST') && getenv('SMTP_USERNAME') && getenv('SMTP_PASSWORD')) {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = getenv('SMTP_HOST');
        $mail->Port = (int) (getenv('SMTP_PORT') ?: 587);
        $mail->SMTPAuth = true;
        $mail->Username = getenv('SMTP_USERNAME');
        $mail->Password = getenv('SMTP_PASSWORD');
        if ((getenv('SMTP_SECURE') ?: 'tls') !== '') {
            $mail->SMTPSecure = getenv('SMTP_SECURE') ?: 'tls';
        }
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($userEmail, $userName);
        $mail->addReplyTo($userEmail, $userName);
        $mail->addAddress($companyEmail);
        $mail->Subject = $subject;
        $mail->Body = "Messaggio da {$userName} <{$userEmail}>:\n\n{$message}";
        $mail->send();
    }

    return $json($response, ['status' => 'sent']);
});

$app->run();
