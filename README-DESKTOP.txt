COBRA FÁCIL V5 DESKTOP - WINDOWS

ANTES DE INSTALAR:
1. Abrí la versión actual en Chrome.
2. Entrá en Configuración.
3. Presioná "Descargar respaldo".
4. Guardá el archivo JSON. La aplicación de escritorio usa un almacenamiento distinto del navegador.

INSTALACIÓN DEL PROYECTO:
1. Descomprimí este ZIP.
2. Copiá todo y reemplazá los archivos dentro de:
   C:\Users\gerar\Proyectos\cobra-facil-v2
3. Abrí CMD y ejecutá:
   cd C:\Users\gerar\Proyectos\cobra-facil-v2
   npm install

PRUEBA COMO APLICACIÓN:
   npm start

Se abrirá Cobra Fácil en su propia ventana, sin Chrome.

CREAR INSTALADOR:
   npm run make

Cuando termine, el instalador estará dentro de:
   C:\Users\gerar\Proyectos\cobra-facil-v2\out\make\squirrel.windows\x64\

El archivo se llamará:
   Cobra-Facil-Setup.exe

PRIMER INICIO DEL PROGRAMA:
1. Abrí Configuración.
2. Elegí "Restaurar una copia".
3. Seleccioná el archivo JSON que guardaste desde Chrome.
4. A partir de ese momento, los datos quedarán guardados en Cobra Fácil Desktop.

NOTA DE WINDOWS:
Como el instalador no tiene firma digital paga, Windows puede mostrar "Editor desconocido".
Elegí "Más información" y luego "Ejecutar de todas formas" solamente si el instalador fue creado en tu propia computadora.
