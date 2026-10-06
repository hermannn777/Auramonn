class MenuEscena extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuEscena' });
    }

    preload() {
        // AQUÍ SE CARGA LA IMAGEN DEL BOTÓN:
        // Asegúrate de guardar la imagen de la placa dorada en tu carpeta 'imagenes'
        // con el nombre exacto: 'boton_auramon.png'
        this.load.image('boton_estilo', 'imagenes/boton_auramon.png');
    }

    create() {
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

        // Opciones del menú alineadas de forma vertical
        const opciones = [
            { text: 'Continuar partida', y: 180, file: 'actions/continuar.txt' },
            { text: 'Auramons', y: 270, file: 'actions/auramons.txt' },
            { text: 'Comenzar partida', y: 360, file: 'actions/comenzar.txt' }
        ];

        opciones.forEach(opt => {
            // Posicionamos las placas hacia la derecha del lienzo para dejar ver el fondo
            const menuX = this.scale.width * 0.65;
            const container = this.add.container(menuX, opt.y);

            // Añadimos la imagen del botón cargada en el preload
            const botonImg = this.add.image(0, 0, 'boton_estilo');
            
            // Forzamos el tamaño para que se ajuste de forma homogénea a las tres opciones
            botonImg.setDisplaySize(320, 65);

            // Configuramos el texto centrado con estilo de alta fantasía
            const txt = this.add.text(0, 0, opt.text.toUpperCase(), {
                fontSize: '16px',
                fontFamily: 'serif',
                fontWeight: 'bold',
                color: '#f3e5ab' // Color dorado suave
            }).setOrigin(0.5);

            container.add([botonImg, txt]);
            
            // Establecemos las dimensiones exactas del contenedor para el click
            container.setSize(320, 65);
            container.setInteractive(new Phaser.Geom.Rectangle(-160, -32.5, 320, 65), Phaser.Geom.Rectangle.Contains, true);

            // Efectos interactivos al pasar el ratón (Cambio de brillo y escalado)
            container.on('pointerover', () => {
                botonImg.setTint(0x00fff0); // Destello color cian místico (Aura)
                txt.setColor('#ffffff');
                txt.setScale(1.05);
            });

            container.on('pointerout', () => {
                botonImg.clearTint(); // Restaura la imagen a su estado original
                txt.setColor('#f3e5ab');
                txt.setScale(1);
            });

            container.on('pointerdown', () => { 
                if (opt.file) showActionFile(opt.file); 
                else if (opt.onClick) opt.onClick(); 
            });
        });
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    pixelArt: true,
    transparent: true, // Esto quita el recuadro negro del medio y deja ver el fondo HTML
    scene: [MenuEscena],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 480
    }
};

const juego = new Phaser.Game(config);
