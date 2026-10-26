<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

const ITEM_IDS = ['pot' => 1, 'rev' => 2, 'ber' => 3, 'aur' => 4];
const MEDALS = ['Raíz' => 1, 'Centella' => 2];

$pdo = db();
$uid = authUser($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    loadProgress($pdo, $uid);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    saveProgress($pdo, $uid, readJson());
} else {
    respond(405, ['message' => 'Método no permitido.']);
}

function clamp($value, int $min, int $max): int
{
    return max($min, min($max, (int) $value));
}

function loadProgress(PDO $pdo, int $uid): never
{
    $stmt = $pdo->prepare('SELECT medallas, oleada_maxima, partidas_jugadas FROM entrenadores WHERE id_entrenador = ?');
    $stmt->execute([$uid]);
    $trainer = $stmt->fetch();

    $stmt = $pdo->prepare('SELECT id_pokemon FROM desbloqueados WHERE id_entrenador = ? ORDER BY id_pokemon');
    $stmt->execute([$uid]);
    $unlocked = array_map(fn($row) => (int) $row['id_pokemon'] - 1, $stmt->fetchAll());

    $medals = [];
    foreach (MEDALS as $name => $bit) {
        if (((int) $trainer['medallas'] & $bit) !== 0) {
            $medals[] = $name;
        }
    }

    $save = [
        'unlocked' => $unlocked,
        'best' => (int) $trainer['oleada_maxima'],
        'medals' => $medals,
        'runs' => (int) $trainer['partidas_jugadas']
    ];

    $stmt = $pdo->prepare('SELECT * FROM guardados WHERE id_entrenador = ?');
    $stmt->execute([$uid]);
    $saved = $stmt->fetch();
    $run = null;

    if ($saved) {
        $stmt = $pdo->prepare('SELECT id_pokemon, nivel, hp_actual, pp1, pp2, aura_boost FROM equipo WHERE id_entrenador = ? ORDER BY posicion');
        $stmt->execute([$uid]);
        $team = array_map(fn($row) => [
            's' => (int) $row['id_pokemon'] - 1,
            'lv' => (int) $row['nivel'],
            'hp' => (int) $row['hp_actual'],
            'pp' => [(int) $row['pp1'], (int) $row['pp2']],
            'ab' => (float) $row['aura_boost']
        ], $stmt->fetchAll());

        $inv = ['pot' => 0, 'rev' => 0, 'ber' => 0, 'aur' => 0];
        $stmt = $pdo->prepare('SELECT id_objeto, cantidad FROM mochilas WHERE id_entrenador = ?');
        $stmt->execute([$uid]);
        foreach ($stmt->fetchAll() as $row) {
            $key = array_search((int) $row['id_objeto'], ITEM_IDS, true);
            if ($key !== false) {
                $inv[$key] = (int) $row['cantidad'];
            }
        }

        $run = [
            'team' => $team,
            'inv' => $inv,
            'balls' => (int) $saved['pokebolas'],
            'money' => (int) $saved['puntos_tienda'],
            'wave' => (int) $saved['oleada_actual'],
            'act' => (int) $saved['indice_activo'],
            'caught' => (int) $saved['capturas'],
            'capNames' => $saved['capturados'] === '' ? [] : explode(',', $saved['capturados']),
            'phase' => $saved['fase'],
            'shop' => $saved['tienda_json'] ? json_decode($saved['tienda_json'], true) : []
        ];
    }

    respond(200, ['save' => $save, 'run' => $run]);
}

function saveProgress(PDO $pdo, int $uid, array $data): never
{
    $save = is_array($data['save'] ?? null) ? $data['save'] : [];
    $run = is_array($data['run'] ?? null) ? $data['run'] : null;

    $mask = 0;
    foreach ((array) ($save['medals'] ?? []) as $name) {
        $mask |= MEDALS[$name] ?? 0;
    }

    try {
        $pdo->beginTransaction();

        $pdo->prepare('UPDATE entrenadores SET medallas = ?, oleada_maxima = ?, partidas_jugadas = ? WHERE id_entrenador = ?')
            ->execute([$mask, clamp($save['best'] ?? 0, 0, 50), clamp($save['runs'] ?? 0, 0, 1000000), $uid]);

        $pdo->prepare('DELETE FROM desbloqueados WHERE id_entrenador = ?')->execute([$uid]);
        $unlock = $pdo->prepare('INSERT IGNORE INTO desbloqueados (id_entrenador, id_pokemon) VALUES (?, ?)');
        foreach ((array) ($save['unlocked'] ?? []) as $index) {
            $unlock->execute([$uid, clamp($index, 0, 29) + 1]);
        }

        $pdo->prepare('DELETE FROM guardados WHERE id_entrenador = ?')->execute([$uid]);
        $pdo->prepare('DELETE FROM equipo WHERE id_entrenador = ?')->execute([$uid]);
        $pdo->prepare('DELETE FROM mochilas WHERE id_entrenador = ?')->execute([$uid]);

        if ($run !== null) {
            $names = array_map(fn($n) => preg_replace('/[^A-Za-z0-9]/', '', (string) $n), (array) ($run['capNames'] ?? []));
            $phase = ($run['phase'] ?? 'battle') === 'shop' ? 'shop' : 'battle';

            $pdo->prepare('INSERT INTO guardados (id_entrenador, oleada_actual, puntos_tienda, pokebolas, fase, indice_activo, capturas, capturados, tienda_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
                ->execute([
                    $uid,
                    clamp($run['wave'] ?? 1, 1, 50),
                    clamp($run['money'] ?? 0, 0, 1000000),
                    clamp($run['balls'] ?? 0, 0, 1000),
                    $phase,
                    clamp($run['act'] ?? 0, 0, 5),
                    clamp($run['caught'] ?? 0, 0, 1000),
                    substr(implode(',', $names), 0, 500),
                    $phase === 'shop' ? json_encode($run['shop'] ?? []) : null
                ]);

            $member = $pdo->prepare('INSERT INTO equipo (id_entrenador, id_pokemon, nivel, hp_actual, posicion, pp1, pp2, aura_boost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            foreach (array_slice((array) ($run['team'] ?? []), 0, 6) as $position => $m) {
                $pp = (array) ($m['pp'] ?? []);
                $member->execute([
                    $uid,
                    clamp($m['s'] ?? 0, 0, 29) + 1,
                    clamp($m['lv'] ?? 1, 1, 100),
                    clamp($m['hp'] ?? 0, 0, 9999),
                    $position,
                    clamp($pp[0] ?? 0, 0, 99),
                    clamp($pp[1] ?? 0, 0, 99),
                    max(1, min(9.99, (float) ($m['ab'] ?? 1)))
                ]);
            }

            $bag = $pdo->prepare('INSERT INTO mochilas (id_entrenador, id_objeto, cantidad) VALUES (?, ?, ?)');
            foreach (ITEM_IDS as $key => $objectId) {
                $amount = clamp($run['inv'][$key] ?? 0, 0, 999);
                if ($amount > 0) {
                    $bag->execute([$uid, $objectId, $amount]);
                }
            }
        }

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        respond(500, ['message' => 'No se pudo guardar el progreso.']);
    }

    respond(200, ['message' => 'Progreso guardado.']);
}
