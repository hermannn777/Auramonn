RECURSOS DE IMAGEN DE AURAMON
==============================

Coloca tus archivos en las carpetas indicadas. Los nombres deben coincidir
exactamente; se aceptan MP4 para los videos, JPG para la imagen de respaldo,
y PNG para botones y Auramons.
La musica del menu se coloca en audio\musica-menu.mp3 (ver audio\README.txt).
Tamano sugerido: fondos 1600x960, botones 900x180 y Auramons 512x512 con
fondo transparente. Para los botones del menu se recomienda una proporcion
cercana a 5.8:1 (por ejemplo, 1200x208 px); dibuja el boton hasta los bordes
del lienzo para evitar margenes transparentes que lo hagan parecer aplastado.
Los botones del menu se ajustan al espacio disponible.

Pantalla de autenticacion:
  autenticacion\fondo-iniciar-sesion.png Fondo de login con titulo y espacios para usuario/contrasena
  autenticacion\fondo-registro.png      Fondo de registro con titulo y espacios para los tres campos
  autenticacion\boton-iniciar-sesion.png Pestaña "Iniciar Sesion"
  autenticacion\boton-registrarse.png Pestaña "Registrarse"
  autenticacion\entrar.png           Boton para iniciar sesion
  autenticacion\crear-cuenta.png     Boton para crear una cuenta

El nombre del juego y las etiquetas/decoracion de los campos van dibujados en
cada fondo. Los campos reales siguen siendo HTML encima de la imagen para que
se puedan escribir e interactuar con ellos. Usa PNG; como punto de partida,
crea cada fondo en 900x1000 px y cada boton en 600x120 px. Para alinear los
campos interactivos con el arte, primero define en el fondo el tamano y la
posicion de cada area para escribir. Los botones deben incluir su texto.

Fondos:
  fondos\menu.mp4       Video en bucle del menu principal (sin audio)
  fondos\juego.mp4       Video para autenticacion y pantallas de juego
  fondos\juego.jpg       Imagen mostrada mientras el video carga o si no se reproduce

Botones del menu:
  botones\iniciar.png   Boton "Iniciar Partida"
  botones\continuar.png Boton "Continuar"
  botones\auramons.png Boton "Auramons"

Pantalla de seleccion de equipo:
  seleccion\fondo-equipo.png       Fondo de seleccion; deja espacio para titulo, estado, lista y botones
  seleccion\comenzar-oleada.png    Boton "Comenzar Oleada"
  seleccion\volver.png             Boton "Volver"
  combate\atacar.png               Boton "Atacar"
  combate\objeto.png               Boton "Objeto"
  combate\capturar.png             Boton "Capturar"
  combate\huir.png                 Boton "Huir"
  combate\equipo.png               Boton "Equipo"
  combate\fondo-jugador.png        Marco del Auramon del jugador
  combate\fondo-rival.png          Marco del Auramon rival
  combate\fondo-movimientos.png    Marco del registro de movimientos
  El fondo puede ser de 1600x960 px. La lista y sus casillas se dibujan encima
  de forma dinamica para mostrar las especies desbloqueadas y seleccionadas.
  Los cinco botones de combate pueden ser PNG e incluir el texto del boton.
  Los tres fondos de combate se colocan como imagenes detras de la informacion.

Auramons:
  auramons\fondo-pokedex.png
      Fondo decorativo de la Pokedex; deja despejada una zona central para la cuadrícula 6x5
  auramons\cerrar.png
      Imagen del boton para cerrar la Pokedex
  auramons\charmander.png
  auramons\squirtle.png
  auramons\bulbasaur.png
  auramons\pikachu.png
  auramons\rattata.png
  auramons\pidgey.png
  auramons\geodude.png
  auramons\machop.png
  auramons\abra.png
  auramons\gastly.png
  auramons\dratini.png
  auramons\magnemite.png
  auramons\clefairy.png
  auramons\zubat.png
  auramons\growlithe.png
  auramons\eevee.png
  auramons\aurafox.png
  auramons\lumiwisp.png
  auramons\sigilmoth.png
  auramons\pulsehound.png
  auramons\noctaura.png
  auramons\halowyrm.png
  auramons\zenaur.png
  auramons\spectraura.png
  auramons\ferraura.png
  auramons\vitalis.png
  auramons\floraviga.png
  auramons\aurachnid.png
  auramons\auroryx.png
  auramons\chronaura.png

Si una imagen de Auramon todavia no existe, el juego muestra una ilustracion
provisional y despues un emoji como ultimo respaldo. Los fondos y botones
mantienen sus colores de respaldo cuando no hay archivo de imagen.
Para el fondo de la Pokedex, se recomienda un PNG de 1600x1000 px; los 30
espacios para Auramons se dibujan encima de esa imagen y siguen siendo dinamicos.
