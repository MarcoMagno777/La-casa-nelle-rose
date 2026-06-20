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

$sendPasswordResetEmail = static function (string $email, string $resetLink): bool {
    if (!getenv('SMTP_HOST')) {
        return false;
    }

    $companyEmail = getenv('COMPANY_EMAIL') ?: 'info@lacasanellerose.com';
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
    $mail->setFrom($companyEmail, 'La Casa nelle Rose');
    $mail->addAddress($email);
    $mail->Subject = 'Reimposta la password';
    $mail->Body = "Abbiamo ricevuto una richiesta di reset password.\n\nApri questo link entro 60 minuti:\n{$resetLink}\n\nSe non hai richiesto tu il reset, ignora questa email.";
    $mail->send();

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
    $adminPassword = getenv('ADMIN_PASSWORD') ?: 'Admin123!';

    if (!hash_equals($adminUsername, $username) || !hash_equals($adminPassword, $password)) {
        return $json($response, ['error' => 'Invalid credentials'], 401);
    }

    return $json($response, ['token' => Auth::adminTokenFor($adminUsername), 'username' => $adminUsername]);
});

$app->get('/api/admin/stats', function (Request $request, Response $response) use ($json, $requireAdmin) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    $db = Database::connection();
    $total = (int) $db->query('SELECT COUNT(*) FROM site_visits')->fetchColumn();
    $today = (int) $db->query('SELECT COUNT(*) FROM site_visits WHERE DATE(created_at) = CURRENT_DATE')->fetchColumn();
    $furniture = (int) $db->query('SELECT COUNT(*) FROM furniture')->fetchColumn();

    return $json($response, ['totalVisits' => $total, 'todayVisits' => $today, 'furnitureCount' => $furniture]);
});

$app->get('/api/admin/furniture', function (Request $request, Response $response) use ($json, $requireAdmin, $normalizeFurniture) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    $statement = Database::connection()->query('SELECT * FROM furniture ORDER BY created_at DESC');
    return $json($response, array_map($normalizeFurniture, $statement->fetchAll()));
});

$app->post('/api/admin/furniture', function (Request $request, Response $response) use ($json, $requireAdmin, $storeUploadedImages, $furniturePayload) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    $data = $furniturePayload($request);
    $images = $storeUploadedImages($request->getUploadedFiles());
    if (in_array('', $data, true) || count($images) === 0) {
        return $json($response, ['error' => 'Invalid data'], 422);
    }

    $db = Database::connection();
    $statement = $db->prepare(
        'INSERT INTO furniture (name, description, placement, category, period, images)
         VALUES (:name, :description, :placement, :category, :period, :images)'
    );
    $statement->execute([...$data, 'images' => json_encode($images, JSON_UNESCAPED_SLASHES)]);

    return $json($response, ['id' => (int) $db->lastInsertId()], 201);
});

$app->post('/api/admin/furniture/{id}', function (Request $request, Response $response, array $args) use ($json, $requireAdmin, $storeUploadedImages, $furniturePayload) {
    $admin = $requireAdmin($request, $response);
    if ($admin instanceof Response) return $admin;

    $db = Database::connection();
    $id = (int) $args['id'];
    $current = $db->prepare('SELECT images FROM furniture WHERE id = :id');
    $current->execute(['id' => $id]);
    $row = $current->fetch();
    if (!$row) return $json($response, ['error' => 'Not found'], 404);

    $data = $furniturePayload($request);
    if (in_array('', $data, true)) {
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

    Database::connection()->prepare('DELETE FROM furniture WHERE id = :id')->execute(['id' => (int) $args['id']]);
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

$app->post('/api/auth/register', function (Request $request, Response $response) use ($json) {
    $db = Database::connection();
    $data = (array) $request->getParsedBody();
    $username = trim((string) ($data['username'] ?? ''));
    $email = filter_var((string) ($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $password = (string) ($data['password'] ?? '');

    if ($username === '' || !$email || strlen($password) < 8) {
        return $json($response, ['error' => 'Invalid data'], 422);
    }

    try {
        $statement = $db->prepare('INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password_hash)');
        $statement->execute([
            'username' => $username,
            'email' => $email,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);
    } catch (Throwable) {
        return $json($response, ['error' => 'User already exists'], 409);
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
    if (!$sent && (getenv('APP_ENV') ?: 'production') !== 'production') {
        $payload['resetLink'] = $resetLink;
    }

    return $json($response, $payload);
});

$app->post('/api/auth/password-reset/confirm', function (Request $request, Response $response) use ($json) {
    $db = Database::connection();
    $data = (array) $request->getParsedBody();
    $email = filter_var((string) ($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $token = (string) ($data['token'] ?? '');
    $password = (string) ($data['password'] ?? '');

    if (!$email || $token === '' || strlen($password) < 8) {
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
    $statement = $db->prepare('SELECT id FROM favorites WHERE user_id = :user_id AND furniture_id = :furniture_id');
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

    $companyEmail = getenv('COMPANY_EMAIL') ?: 'info@lacasanellerose.com';
    if (getenv('SMTP_HOST')) {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = getenv('SMTP_HOST');
        $mail->Port = (int) (getenv('SMTP_PORT') ?: 587);
        $mail->SMTPAuth = true;
        $mail->Username = getenv('SMTP_USERNAME');
        $mail->Password = getenv('SMTP_PASSWORD');
        $mail->setFrom($companyEmail, 'La Casa nelle Rose');
        $mail->addAddress($companyEmail);
        $mail->Subject = $subject;
        $mail->Body = $message;
        $mail->send();
    }

    return $json($response, ['status' => 'sent']);
});

$app->run();
