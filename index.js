/**
 * 
 * declaracion mensual
 * https://ptscdecprov.clouda.sat.gob.mx/
 * 
 * facturas:
 * https://portalcfdi.facturaelectronica.sat.gob.mx/
 */


const fs = require("fs");
const XMLProcessing = require("./core/XMLProcessing");

(async () => {
	cargarXML = new XMLProcessing();
	// cargarXML.setDebugModeOn();
	if(process.env.ucopgun_alska_RFC == undefined)
		console.log("RFC NO DEFINIDO, asigne variable ucopgun_alska_RFC");
	else{
		await cargarXML.defineRFCEjecutorSinHomoclave(process.env.ucopgun_alska_RFC);
		// await cargarXML.loadFile("xml/eeaf0a0f-d4d8-473f-9c2a-332712df8bb2.xml")
		// const file = await cargarXML.ConvertXMLToJSON();
		// await cargarXML.comprobarRuta();
		// fs.writeFileSync("temp/naturalFile.json", JSON.stringify(file, null, "\t"));
		// await cargarXML.UbicarContenedor();
		// console.log(cargarXML.getResultSet());
		// cargarXML.saveInfo();

		await cargarXML.ejecuteForAllFilesInXMLFolder("xml");
	}

})();