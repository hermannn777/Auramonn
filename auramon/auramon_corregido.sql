-- Auramon: Valle de la Sincronía - esquema corregido (MariaDB 10.4 / XAMPP)
-- Las tablas del volcado original estaban vacías, por lo que se recrean sin pérdida de datos.

CREATE DATABASE IF NOT EXISTS `auramon` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `auramon`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `sesiones`, `desbloqueados`, `mochilas`, `equipo`, `guardados`,
    `movimientos`, `pokemones`, `objetos`, `tipos`, `entrenadores`;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------
-- Catálogos
-- ---------------------------------------------------------
CREATE TABLE `tipos` (
    `id_tipo` int(11) NOT NULL AUTO_INCREMENT,
    `nombre` varchar(50) NOT NULL,
    PRIMARY KEY (`id_tipo`),
    UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pokemones` (
    `id_pokemon` int(11) NOT NULL,                -- coincide con imagenes/pokemon_XX.png
    `nombre` varchar(100) NOT NULL,
    `id_tipo_1` int(11) NOT NULL,
    `id_tipo_2` int(11) DEFAULT NULL,
    `hp_base` int(11) NOT NULL,
    `ataque_base` int(11) NOT NULL,
    `defensa_base` int(11) NOT NULL,
    `velocidad_base` int(11) NOT NULL,            -- NUEVO: el motor de combate la usa
    `coste` int(11) NOT NULL DEFAULT 3,           -- NUEVO: coste en el draft
    PRIMARY KEY (`id_pokemon`),
    UNIQUE KEY `nombre` (`nombre`),
    KEY `id_tipo_1` (`id_tipo_1`),
    KEY `id_tipo_2` (`id_tipo_2`),
    CONSTRAINT `pokemones_ibfk_1` FOREIGN KEY (`id_tipo_1`) REFERENCES `tipos` (`id_tipo`),
    CONSTRAINT `pokemones_ibfk_2` FOREIGN KEY (`id_tipo_2`) REFERENCES `tipos` (`id_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `movimientos` (
    `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
    `nombre` varchar(100) NOT NULL,
    `id_tipo` int(11) NOT NULL,
    `potencia` int(11) DEFAULT NULL,
    `precision_atq` int(11) DEFAULT NULL,
    `pp` int(11) NOT NULL,
    PRIMARY KEY (`id_movimiento`),
    UNIQUE KEY `nombre` (`nombre`),
    KEY `id_tipo` (`id_tipo`),
    CONSTRAINT `movimientos_ibfk_1` FOREIGN KEY (`id_tipo`) REFERENCES `tipos` (`id_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `objetos` (
    `id_objeto` int(11) NOT NULL AUTO_INCREMENT,
    `nombre` varchar(100) NOT NULL,
    `descripcion` text DEFAULT NULL,
    `precio` int(11) DEFAULT 0,
    `peso` int(11) NOT NULL DEFAULT 1,            -- NUEVO: peso del sorteo de la tienda
    PRIMARY KEY (`id_objeto`),
    UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------
-- Cuentas y progreso
-- ---------------------------------------------------------
CREATE TABLE `entrenadores` (
    `id_entrenador` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL,
    `password_hash` varchar(255) NOT NULL,
    `medallas` int(11) DEFAULT 0,                 -- máscara de bits: 1 = Raíz, 2 = Centella
    `oleada_maxima` int(11) DEFAULT 0,
    `partidas_jugadas` int(11) NOT NULL DEFAULT 0, -- NUEVO
    `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id_entrenador`),
    UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- NUEVA: tokens de sesión que devuelve el login
CREATE TABLE `sesiones` (
    `token` char(64) NOT NULL,
    `id_entrenador` int(11) NOT NULL,
    `expira` datetime NOT NULL,
    PRIMARY KEY (`token`),
    KEY `id_entrenador` (`id_entrenador`),
    CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`id_entrenador`) REFERENCES `entrenadores` (`id_entrenador`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- NUEVA: Pokémon desbloqueados para siempre (Elenco y draft)
CREATE TABLE `desbloqueados` (
    `id_entrenador` int(11) NOT NULL,
    `id_pokemon` int(11) NOT NULL,
    PRIMARY KEY (`id_entrenador`, `id_pokemon`),
    KEY `id_pokemon` (`id_pokemon`),
    CONSTRAINT `desbloqueados_ibfk_1` FOREIGN KEY (`id_entrenador`) REFERENCES `entrenadores` (`id_entrenador`) ON DELETE CASCADE,
    CONSTRAINT `desbloqueados_ibfk_2` FOREIGN KEY (`id_pokemon`) REFERENCES `pokemones` (`id_pokemon`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `guardados` (
    `id_guardado` int(11) NOT NULL AUTO_INCREMENT,
    `id_entrenador` int(11) NOT NULL,
    `oleada_actual` int(11) DEFAULT 1,
    `puntos_tienda` int(11) DEFAULT 0,            -- dinero de la partida
    `pokebolas` int(11) NOT NULL DEFAULT 5,       -- NUEVO
    `fase` enum('battle','shop') NOT NULL DEFAULT 'battle', -- NUEVO
    `indice_activo` tinyint(4) NOT NULL DEFAULT 0, -- NUEVO: Auramon en campo
    `capturas` int(11) NOT NULL DEFAULT 0,        -- NUEVO
    `capturados` varchar(500) NOT NULL DEFAULT '', -- NUEVO: nombres separados por coma
    `tienda_json` text DEFAULT NULL,              -- NUEVO: ofertas pendientes de la tienda
    `fecha_guardado` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id_guardado`),
    UNIQUE KEY `id_entrenador` (`id_entrenador`),
    CONSTRAINT `guardados_ibfk_1` FOREIGN KEY (`id_entrenador`) REFERENCES `entrenadores` (`id_entrenador`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `equipo` (
    `id_instancia` int(11) NOT NULL AUTO_INCREMENT,
    `id_entrenador` int(11) NOT NULL,
    `id_pokemon` int(11) NOT NULL,
    `mote` varchar(100) DEFAULT NULL,
    `nivel` int(11) DEFAULT 1,
    `hp_actual` int(11) NOT NULL,
    `posicion` tinyint(4) NOT NULL DEFAULT 0,     -- NUEVO: orden en el equipo
    `pp1` int(11) NOT NULL DEFAULT 0,             -- NUEVO: el PP no se restaura entre oleadas
    `pp2` int(11) NOT NULL DEFAULT 0,             -- NUEVO
    `aura_boost` decimal(3,2) NOT NULL DEFAULT 1.00, -- NUEVO: Potenciador Aura
    PRIMARY KEY (`id_instancia`),
    KEY `id_entrenador` (`id_entrenador`),
    KEY `id_pokemon` (`id_pokemon`),
    CONSTRAINT `equipo_ibfk_1` FOREIGN KEY (`id_entrenador`) REFERENCES `entrenadores` (`id_entrenador`) ON DELETE CASCADE,
    CONSTRAINT `equipo_ibfk_2` FOREIGN KEY (`id_pokemon`) REFERENCES `pokemones` (`id_pokemon`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `mochilas` (
    `id_entrenador` int(11) NOT NULL,
    `id_objeto` int(11) NOT NULL,
    `cantidad` int(11) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id_entrenador`, `id_objeto`),
    KEY `id_objeto` (`id_objeto`),
    CONSTRAINT `mochilas_ibfk_1` FOREIGN KEY (`id_entrenador`) REFERENCES `entrenadores` (`id_entrenador`) ON DELETE CASCADE,
    CONSTRAINT `mochilas_ibfk_2` FOREIGN KEY (`id_objeto`) REFERENCES `objetos` (`id_objeto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------
-- Datos iniciales
-- ---------------------------------------------------------
INSERT INTO `tipos` (`id_tipo`, `nombre`) VALUES
    (1, 'Normal'), (2, 'Fire'), (3, 'Water'), (4, 'Grass'), (5, 'Electric'), (6, 'Psychic'),
    (7, 'Ghost'), (8, 'Dragon'), (9, 'Steel'), (10, 'Fairy'), (11, 'Aura'), (12, 'Rock'),
    (13, 'Fighting'), (14, 'Bug'), (15, 'Dark'), (16, 'Flying'), (17, 'Poison');

INSERT INTO `pokemones`
    (`id_pokemon`, `nombre`, `id_tipo_1`, `id_tipo_2`, `hp_base`, `ataque_base`, `defensa_base`, `velocidad_base`, `coste`) VALUES
    (1, 'Charmander', 2, NULL, 39, 52, 43, 65, 3),
    (2, 'Squirtle', 3, NULL, 44, 48, 65, 43, 3),
    (3, 'Bulbasaur', 4, NULL, 45, 49, 49, 45, 3),
    (4, 'Pikachu', 5, NULL, 35, 55, 40, 90, 3),
    (5, 'Rattata', 1, NULL, 30, 56, 35, 72, 3),
    (6, 'Pidgey', 1, 16, 40, 45, 40, 56, 3),
    (7, 'Geodude', 12, NULL, 40, 80, 100, 20, 3),
    (8, 'Machop', 13, NULL, 70, 80, 50, 35, 3),
    (9, 'Abra', 6, NULL, 25, 20, 15, 90, 3),
    (10, 'Gastly', 7, NULL, 30, 35, 30, 80, 3),
    (11, 'Dratini', 8, NULL, 41, 64, 45, 50, 3),
    (12, 'Magnemite', 5, 9, 25, 35, 70, 45, 3),
    (13, 'Clefairy', 10, NULL, 70, 45, 48, 35, 3),
    (14, 'Zubat', 17, 16, 40, 45, 35, 55, 3),
    (15, 'Growlithe', 2, NULL, 55, 70, 45, 60, 3),
    (16, 'Eevee', 1, NULL, 55, 55, 50, 55, 3),
    (17, 'Aurafox', 11, NULL, 60, 75, 60, 80, 6),
    (18, 'Lumiwisp', 7, 11, 55, 70, 55, 85, 6),
    (19, 'Sigilmoth', 14, 11, 65, 80, 60, 70, 6),
    (20, 'Pulsehound', 2, 11, 70, 90, 60, 75, 6),
    (21, 'Noctaura', 15, 11, 65, 85, 65, 80, 6),
    (22, 'Halowyrm', 8, 11, 75, 90, 70, 65, 6),
    (23, 'Zenaur', 6, 11, 70, 80, 70, 85, 6),
    (24, 'Spectraura', 7, 11, 60, 95, 50, 90, 6),
    (25, 'Ferraura', 9, 11, 80, 85, 100, 50, 6),
    (26, 'Vitalis', 10, 11, 90, 65, 80, 60, 6),
    (27, 'Floraviga', 4, 11, 85, 85, 80, 60, 6),
    (28, 'Aurachnid', 5, 11, 75, 95, 70, 95, 6),
    (29, 'Auroryx', 11, NULL, 95, 100, 85, 80, 6),
    (30, 'Chronaura', 3, 11, 80, 80, 80, 75, 6);

-- El orden de los objetos es el que usa la API: 1 pot, 2 rev, 3 ber, 4 aur
INSERT INTO `objetos` (`id_objeto`, `nombre`, `descripcion`, `precio`, `peso`) VALUES
    (1, 'Poción', '+30 HP', 30, 5),
    (2, 'Revivir', 'Revive con 50% HP', 80, 2),
    (3, 'Baya', '+20 HP y +5 PP', 20, 4),
    (4, 'Potenciador Aura', 'Ataques Aura +25% (permanente)', 60, 2);

INSERT INTO `movimientos` (`nombre`, `id_tipo`, `potencia`, `precision_atq`, `pp`)
    SELECT CONCAT('Impacto ', `nombre`), `id_tipo`, 60, 100, 12 FROM `tipos`;
INSERT INTO `movimientos` (`nombre`, `id_tipo`, `potencia`, `precision_atq`, `pp`)
    VALUES ('Placaje', 1, 40, 100, 20);
