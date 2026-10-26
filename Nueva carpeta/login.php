<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['message' => 'Método no permitido.']);
}

$data = readJson();
$username = trim((string) ($data['username'] ?? ''));
$password = (string) ($data['password'] ?? '');

$pdo = db();

$stmt = $pdo->prepare('SELECT id_entrenador, password_hash FROM entrenadores WHERE username = ?');
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    respond(401, ['message' => 'Usuario o contraseña incorrectos.']);
}

$id = (int) $user['id_entrenador'];
$token = bin2hex(random_bytes(32));

$pdo->prepare('DELETE FROM sesiones WHERE id_entrenador = ? AND expira < NOW()')->execute([$id]);
$pdo->prepare('INSERT INTO sesiones (token, id_entrenador, expira) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ' . SESSION_DAYS . ' DAY))')
    ->execute([$token, $id]);

respond(200, ['token' => $token, 'username' => $username]);
