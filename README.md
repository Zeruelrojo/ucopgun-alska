# ucopgun-alska
Información útil generada a partir de las facturas electrónicas XML proporcionadas por el SAT (Sistema de administración tributaria) de México para propósitos de declaración de impuestos tanto mensual como anual.

primera version (iniciando)

INSTALACIÓN:

- descargue e instale Node JS en su computadora en la version 12 de preferencia (https://nodejs.org/es/).
    - dentro del instalador se encuentra el programa npm que se instala junto a Node JS, este es necesario.
- descargue el programa (boton color verde en esta misma pagina [https://github.com/Zeruelrojo/ucopgun-alska])
    - opcionalmente puede utilizar git y clonar el repositorio con el siguiente comando de emulador de terminal o cmd:
    git clone https://github.com/Zeruelrojo/ucopgun-alska

- una vez descargado en Windows abra cmd (con su teclado escriba WIN+R al mismo tiempo y luego escriba "cmd" sin las comillas)
- en Linux utilice el emulador de terminal de su preferencia.
- navegue a traves de las carpetas utilizando el comando cd, por ejemplo:
    - para Windows "cd C:\ejemplo1\ejemplo2\ejemplo3"
    - para Linux "cd /ejemplo1/ejemplo2/ejemplo3"
- sitúese en la ubicación del programa (dentro de la carpeta del mismo) y escriba el siguiente comando:
npm install
- observará que iniciara un proceso, por favor espere a que concluya el proceso, si se interrumpe solamente vuelva a ingresar el mismo comando (npm install)

EJECUCIÓN

- una vez concluido, en la misma carpeta agregue una carpeta llamada "temp" y otra llamada "xml" y dentro de "xml" COPIE sus facturas xml (enfasis en copiar, puede cometer el error en mover las facturas a esta carpeta).
- para iniciar el procesamento de las facturas ejecute los siguientes comandos (considere que XXXXX es su RFC SIN HOMOCLAVE):
	- EN LINUX:
		- export ucopgun_alska_RFC=XXXXX
	- EN WINDOWS:
		- set ucopgun_alska_RFC=XXXXX
	- npm run start
- el programa generará un archivo llamado "informe.json", dicho archivo se puede abrir con un simple bloc de notas.

DESCRIPCIÓN DEL INFORME:

apartado anual:
 - se denota por tener solamente el numero del año, este es un acumulado de suma anual de todas las facturas del año, no considera años anteriores.
 ```json
	"2020": {
		"Ingresos_Brutos": xxxx.xxxx,
		"Gastos_Brutos": xxxx.xxxx,
		"totalIVATrasladado": xxxx.xxxx,
		"totalISRTrasladado": xxxx,
		"totalIVARetenido": xxxx,
		"totalISRRetenido": xxxx
	}
```

apartado historial:
- son las facturas en si, ordenadas en orden descendente respecto al tiempo
- tambien considere que el rol se refiere a emisor o receptor de factura, en este caso es receptor
 ```json
	"historial": [
		{
			"Fecha": "2020-01-01T00:00:01",
			"NoCertificado": "xxxxxxxxxxxxxxxxxxxxx",
			"Moneda": "xxx",
			"FormaPago": "xx",
			"MetodoPago": "xxx",
			"TipoDeComprobante": "x",
			"Total": xxx,
			"SubTotal": xxx,
			"Rol": "RECEPTOR",
			"totalIVATrasladado": xxx
		},
        ...
```

apartado mensual:
- notese que contiene concatenado el año y el mes en cuestión, contiene ademas de las caracteristicas de la anualidad, el acumulado hasta la fecha en cuestion, en este caso es enero del 2020.
 ```json
	"2020_Enero": {
		"Ingresos_Brutos": xxx,
		"Ingresos_del_año_hasta_ahora": xxx,
		"Gastos_Brutos": xxx,
		"Gastos_del_año_hasta_ahora": xxx,
		"totalIVATrasladado": xxx,
		"totalISRTrasladado": xxx,
		"totalIVARetenido": xxx,
		"totalISRRetenido": xxx,
		"totalIVATrasladado_del_año_hasta_ahora": xxx,
		"totalISRTrasladado_del_año_hasta_ahora": xxx,
		"totalIVARetenido_del_año_hasta_ahora": xxx,
		"totalISRRetenido_del_año_hasta_ahora": xxx
	}
```

El programa se encuentra aun en pruebas, lo expongo con el proposito de mejorar el programa y facilitar a los usuarios no experimentados en contabilidad a realizar declaraciones anuales y mensuales.

Queda bajo la responsabilidad del usuario el uso de este programa y queda advertido de su inestabilidad y la posibilidad de la generación de información no confiable.

Preguntas, sugerencias, comentarios, reporte de errores, xyz mi contacto es el siguiente:
ananper_sasur@outlook.com

espero apoyar en lo posible.