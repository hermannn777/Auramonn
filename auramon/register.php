<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['message' => 'Método no permitido.']);
}

$data = readJson();
$username = trim((string) ($data['username'] ?? ''));
$password = (string) ($data['password'] ?? '');

if (!preg_match('/^[A-Za-z0-9_]{3,50}$/', $username)) {
    respond(400, ['message' => 'Usuario: 3 a 50 caracteres (letras, números o guion bajo).']);
}
if (strlen($password) < 6) {
    respond(400, ['message' => 'La contraseña debe tener al menos 6 caracteres.']);
}

$pdo = db();

$check = $pdo->prepare('SELECT 1 FROM entrenadores WHERE username = ?');
$check->execute([$username]);
if ($check->fetch()) {
    respond(409, ['message' => 'Ese usuario ya existe.']);
}

try {
    $pdo->beginTransaction();

    $insert = $pdo->prepare('INSERT INTO entrenadores (username, password_hash) VALUES (?, ?)');
    $insert->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
    $id = (int) $pdo->lastInsertId();

    // Pokémon iniciales desbloqueados (los mismos del juego)
    $unlock = $pdo->prepare('INSERT INTO desbloqueados (id_entrenador, id_pokemon) VALUES (?, ?)');
    foreach ([1, 2, 3, 4, 5, 6, 17] as $pokemon) {
        $unlock->execute([$id, $pokemon]);
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    respond(500, ['message' => 'No se pudo crear la cuenta.']);
}

respond(200, ['message' => 'Cuenta creada correctamente.']);
