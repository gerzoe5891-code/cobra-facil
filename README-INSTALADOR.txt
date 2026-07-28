COBRA FÁCIL V6 - INSTALADOR PROFESIONAL DE WINDOWS

ANTES DE ACTUALIZAR:
1. En Cobra Fácil actual, entrá a Configuración.
2. Descargá un respaldo JSON de tus datos.
3. Guardalo en Documentos o en un pendrive.

INSTALACIÓN DE LOS ARCHIVOS:
1. Descomprimí este ZIP.
2. Copiá TODO el contenido.
3. Pegalo y reemplazalo dentro de:
   C:\Users\gerar\Proyectos\cobra-facil-v2

PREPARAR DEPENDENCIAS:
Abrí CMD y ejecutá:

cd C:\Users\gerar\Proyectos\cobra-facil-v2
npm install

PROBAR LA APLICACIÓN:
npm start

CREAR EL INSTALADOR:
1. Cerrá la aplicación.
2. En la terminal presioná Ctrl + C.
3. Ejecutá:

npm run dist

EL INSTALADOR QUEDARÁ EN:
C:\Users\gerar\Proyectos\cobra-facil-v2\release

ARCHIVO ESPERADO:
Cobra-Facil-Setup-6.0.0.exe

AL INSTALAR:
- Aparecerá un asistente de instalación.
- Permitirá elegir la carpeta.
- Creará acceso directo en el escritorio.
- Creará acceso en el menú Inicio.
- Tendrá desinstalador de Windows.
- Al finalizar podrá abrir Cobra Fácil.

DATOS ANTERIORES:
La app instalada puede tener un almacenamiento distinto.
Entrá en Configuración > Restaurar copia y seleccioná el respaldo JSON.

WINDOWS SMARTSCREEN:
El instalador no tiene firma digital comercial.
Windows puede mostrar "Editor desconocido".
Elegí "Más información" y "Ejecutar de todas formas" solo para el instalador creado en tu propia computadora.
