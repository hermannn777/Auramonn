<?php
declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_NAME = 'auramon';
const DB_USER = 'root';
const DB_PASS = '';
const SESSION_DAYS = 30;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            respond(500, ['message' => 'No se pudo conectar con la base de datos.']);
        }
    }
    return $pdo;
}

function respond(int $status, array $data): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function readJson(): array
{
    $data = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($data) ? $data : [];
}

/* Devuelve el id del entrenador dueño del token "Authorization: Bearer ...". */
function authUser(PDO $pdo): int
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $header = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');

    if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/', $header, $match)) {
        respond(401, ['message' => 'Sesión no válida.']);
    }

    $stmt = $pdo->prepare('SELECT id_entrenador FROM sesiones WHERE token = ? AND expira > NOW()');
    $stmt->execute([$match[1]]);
    $row = $stmt->fetch();

    if (!$row) {
        respond(401, ['message' => 'Sesión expirada.']);
    }
    return (int) $row['id_entrenador'];
}
