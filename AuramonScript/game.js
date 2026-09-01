class MenuEscena extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuEscena' });
    }

    preload() {
        // No cargamos el fondo con Phaser: usamos la etiqueta <img> en el HTML
    }

    create() {
        // Colocamos el título y el botón; el fondo lo aporta la etiqueta <img> en el HTML
     

        // Overlay helpers: crear y mostrar archivos de acción
        const ensureOverlay = () => {
            if (document.getElementById('action-overlay')) return;
            const overlay = document.createElement('div');
            overlay.id = 'action-overlay';
            overlay.style = 'position:fixed;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;z-index:99999;';
            overlay.innerHTML = `
                <div id="action-box" style="background:#111;color:#fff;padding:20px;max-width:720px;width:90%;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.7);">
                    <button id="action-close" style="float:right;background:#222;color:#fff;border:0;padding:6px 10px;border-radius:6px;cursor:pointer;margin-left:8px;">Cerrar</button>
                    <pre id="action-content" style="white-space:pre-wrap;max-height:60vh;overflow:auto;margin-top:10px;font-family:monospace;"></pre>
                </div>
            `;
            document.body.appendChild(overlay);
            document.getElementById('action-close').onclick = () => { overlay.remove(); };
        };

        const showActionFile = async (path) => {
            ensureOverlay();
            const contentEl = document.getElementById('action-content');
            contentEl.textContent = 'Cargando...';
            try {
                const res = await fetch(path);
                if (!res.ok) throw new Error('No se pudo cargar ' + path + ' (' + res.status + ')');
                const text = await res.text();
                contentEl.textContent = text;
            } catch (err) {
                contentEl.textContent = 'Error al cargar acción:\n' + err.message;
            }
        };

        // Opciones del menú: Continuar, Auramons, Comenzar (cargar archivos de actions/)
        const opciones = [
            { text: 'Comenzar partida', y: 360, file: 'actions/comenzar.txt' },
            { text: 'Continuar partida', y: 240, file: 'actions/continuar.txt' },
            { text: 'Auramons', y: 300, file: 'actions/auramons.txt' }
        ];

        opciones.forEach(opt => {
            // Crear gráfico redondeado como fondo del botón (más pequeño)
            const width = 240;
            const height = 36;
            const radius = 8;

            // Posicionar el menú hacia la derecha del lienzo
            const menuX = this.scale.width * 0.78;
            const container = this.add.container(menuX, opt.y);

            const g = this.add.graphics();
            g.fillStyle(0x16c79a, 1);
            g.fillRoundedRect(-width/2, -height/2, width, height, radius);

            const txt = this.add.text(0, 0, opt.text, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5);

            container.add([g, txt]);
            container.setSize(width, height);
            container.setInteractive(new Phaser.Geom.Rectangle(-width/2, -height/2, width, height), Phaser.Geom.Rectangle.Contains, true);

            container.on('pointerover', () => {
                g.clear();
                g.fillStyle(0x00fff0, 1);
                g.fillRoundedRect(-width/2, -height/2, width, height, radius);
                txt.setColor('#1a1a2e');
            });

            container.on('pointerout', () => {
                g.clear();
                g.fillStyle(0x16c79a, 1);
                g.fillRoundedRect(-width/2, -height/2, width, height, radius);
                txt.setColor('#ffffff');
            });

            container.on('pointerdown', () => { if (opt.file) showActionFile(opt.file); else if (opt.onClick) opt.onClick(); });
        });
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-container', // Vincula el juego al contenedor superior
    pixelArt: true,
    transparent: true,        // Permite ver la etiqueta img de fondo
    scene: [MenuEscena],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 480
    }
};

const juego = new Phaser.Game(config);

