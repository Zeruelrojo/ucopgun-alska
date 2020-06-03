const xml2js = require("xml2js");
const fs = require("fs");


class XMLProcessing {

	constructor() {
		this.resultProcess = {};
		this.resultProcess["historial"] = [];
		this.PREPARED = {};
	}

	async defineRFCEjecutorSinHomoclave(RFC) {
		this.RFC = RFC;
	}

	async ConvertXMLToJSON() {
		const parser = new xml2js.Parser();
		try {
			const resultSet = await parser.parseStringPromise(this.file);
			this.resultSet = resultSet;
			return resultSet;
		} catch (err) {
			console.log(err);
		}
	}

	async loadFile(path) {
		const file = fs.readFileSync(path, "utf8");
		this.path = path;
		this.file = file;
		return file;
	}

	async UbicarContenedor() {
		// SumarTotalImpuestoTrasladado(XMLProcessing.IVA);

		let date = new Date(this.resultSet["cfdi:Comprobante"]["$"]["Fecha"]);
		this.month = await this.convertMonthNumberToMonthString((date.getUTCMonth() + 1));

		this.year = date.getUTCFullYear();
		if (this.resultProcess[this.year] == undefined) this.resultProcess[this.year] = {};
		if (this.resultProcess[this.year + "_" + this.month] == undefined) this.resultProcess[this.year + "_" + this.month] = {};


		if (this.resultProcess[this.year]["Ingresos_Brutos"] == undefined) this.resultProcess[this.year]["Ingresos_Brutos"] = 0;
		if (this.resultProcess[this.year + "_" + this.month]["Ingresos_Brutos"] == undefined) this.resultProcess[this.year + "_" + this.month]["Ingresos_Brutos"] = 0;
		if (this.resultProcess[this.year + "_" + this.month]["Ingresos_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year + "_" + this.month]["Ingresos_del_año_hasta_ahora"] = this.resultProcess[this.year]["Ingresos_Brutos"];
		if (this.resultProcess[this.year]["Gastos_Brutos"] == undefined) this.resultProcess[this.year]["Gastos_Brutos"] = 0;
		if (this.resultProcess[this.year + "_" + this.month]["Gastos_Brutos"] == undefined) this.resultProcess[this.year + "_" + this.month]["Gastos_Brutos"] = 0;
		if (this.resultProcess[this.year + "_" + this.month]["Gastos_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year + "_" + this.month]["Gastos_del_año_hasta_ahora"] = this.resultProcess[this.year]["Gastos_Brutos"];
		if (this.resultSet["cfdi:Comprobante"]["cfdi:Emisor"][0]["$"]["Rfc"].includes(this.RFC)) {
			this.resultProcess[this.year]["Ingresos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"]["SubTotal"]);
			this.resultProcess[this.year + "_" + this.month]["Ingresos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"]["SubTotal"]);
			this.resultProcess[this.year + "_" + this.month]["Ingresos_del_año_hasta_ahora"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"]["SubTotal"]);
		} else if (this.resultSet["cfdi:Comprobante"]["cfdi:Receptor"][0]["$"]["Rfc"].includes(this.RFC)) {
			this.resultProcess[this.year]["Gastos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"]["SubTotal"]);
			this.resultProcess[this.year + "_" + this.month]["Gastos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"]["SubTotal"]);
			this.resultProcess[this.year + "_" + this.month]["Gastos_del_año_hasta_ahora"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"]["SubTotal"]);
		}

		this.PREPARED["Fecha"] = this.resultSet["cfdi:Comprobante"]["$"]["Fecha"];
		this.PREPARED["NoCertificado"] = this.resultSet["cfdi:Comprobante"]["$"]["NoCertificado"];
		this.PREPARED["Moneda"] = this.resultSet["cfdi:Comprobante"]["$"]["Moneda"];
		this.PREPARED["FormaPago"] = this.resultSet["cfdi:Comprobante"]["$"]["FormaPago"];
		this.PREPARED["MetodoPago"] = this.resultSet["cfdi:Comprobante"]["$"]["MetodoPago"];
		this.PREPARED["TipoDeComprobante"] = this.resultSet["cfdi:Comprobante"]["$"]["TipoDeComprobante"];
		this.PREPARED["Total"] = parseFloat(this.resultSet["cfdi:Comprobante"]["$"]["Total"]);
		this.PREPARED["SubTotal"] = parseFloat(this.resultSet["cfdi:Comprobante"]["$"]["SubTotal"]);
		if (this.resultSet["cfdi:Comprobante"]["cfdi:Emisor"][0]["$"]["Rfc"].includes(this.RFC)) {
			this.PREPARED["Rol"] = "EMISOR";
		} else if (this.resultSet["cfdi:Comprobante"]["cfdi:Receptor"][0]["$"]["Rfc"].includes(this.RFC)) {
			this.PREPARED["Rol"] = "RECEPTOR";
		}

		if (this.tipoRuta == 1) {
			for (let indexConceptos = 0; indexConceptos < this.resultSet["cfdi:Comprobante"]["cfdi:Conceptos"].length; indexConceptos++) {
				const elementConceptos = this.resultSet["cfdi:Comprobante"]["cfdi:Conceptos"][indexConceptos];
				for (let indexConcepto = 0; indexConcepto < elementConceptos["cfdi:Concepto"].length; indexConcepto++) {
					const elementConcepto = elementConceptos["cfdi:Concepto"][indexConcepto];
					if (elementConcepto["cfdi:Impuestos"] == undefined) {
						const contenedor = elementConcepto["$"];
						await this.ProcesarTotales(contenedor, "sin impuestos");
					} else {
						for (let indexImpuestos = 0; indexImpuestos < elementConcepto["cfdi:Impuestos"].length; indexImpuestos++) {
							const elementImpuestos = elementConcepto["cfdi:Impuestos"][indexImpuestos];
							for (let indexTraslados = 0; indexTraslados < elementImpuestos["cfdi:Traslados"].length; indexTraslados++) {
								const elementTraslados = elementImpuestos["cfdi:Traslados"][indexTraslados];
								for (let indexTraslado = 0; indexTraslado < elementTraslados["cfdi:Traslado"].length; indexTraslado++) {
									const elementTraslado = elementTraslados["cfdi:Traslado"][indexTraslado];
									const contenedor = elementTraslado["$"];
									await this.ProcesarTotales(contenedor, "trasladados");
								}
							}
							if (elementImpuestos["cfdi:Retenciones"] != undefined) {
								for (let indexRetenciones = 0; indexRetenciones < elementImpuestos["cfdi:Retenciones"].length; indexRetenciones++) {
									const elementRetenciones = elementImpuestos["cfdi:Retenciones"][indexRetenciones];
									for (let indexRetencion = 0; indexRetencion < elementRetenciones["cfdi:Retencion"].length; indexRetencion++) {
										const elementRetencion = elementRetenciones["cfdi:Retencion"][indexRetencion];
										const contenedor = elementRetencion["$"];
										await this.ProcesarTotales(contenedor, "retenciones");
									}
								}
							}
						}
					}
				}
			}
			this.tipoRuta = undefined;
			this.resultProcess["historial"].push(this.PREPARED);
			this.PREPARED = {};
			return true;
		} else if (this.tipoRuta == 2) {
			const contenedor = this.resultSet["cfdi:Comprobante"]["$"];
			await this.ProcesarTotales(contenedor);
			this.tipoRuta = undefined;
			this.resultProcess["historial"].push(this.PREPARED);
			this.PREPARED = {};
			return true;
		} else {
			this.tipoRuta = undefined;
			this.PREPARED = {};
			return false;
		}

	}

	async comprobarRuta() {
		this.tipoRuta = undefined;
		try {
			if (this.resultSet["cfdi:Comprobante"]["cfdi:Conceptos"][0]["cfdi:Concepto"][0]["cfdi:Impuestos"][0]["cfdi:Traslados"][0]["cfdi:Traslado"][0]["$"] == undefined
				&& this.resultSet["cfdi:Comprobante"]["cfdi:Conceptos"][0]["cfdi:Concepto"][0]["cfdi:Impuestos"][0]["cfdi:Retenciones"][0]["cfdi:Retencion"][0]["$"] == undefined) {
				throw new Error("valor no existente");
			}
			this.tipoRuta = 1;
		} catch (err) {
			try {
				if (this.RFC == undefined && this.resultSet["cfdi:Comprobante"]["cfdi:Conceptos"][0]["cfdi:Concepto"][0]["$"]["ClaveProdServ"] == undefined) { throw new Error("valor no existente"); };
				if (this.RFC == undefined && this.resultSet["cfdi:Comprobante"]["cfdi:Conceptos"][0]["cfdi:Concepto"][0]["$"]["ClaveUnidad"] == undefined) { throw new Error("valor no existente"); };
				this.tipoRuta = 2;
			} catch (err) {
				this.tipoRuta = undefined;
				this.error = err.stack;
				return false;
			}
		}
	}

	async ProcesarTotales(contenedor, tipoMovimiento) {
		if (this.resultProcess[this.year]["totalIVATrasladado"] == undefined) this.resultProcess[this.year]["totalIVATrasladado"] = 0;
		if (this.resultProcess[this.year]["totalISRTrasladado"] == undefined) this.resultProcess[this.year]["totalISRTrasladado"] = 0;
		if (this.resultProcess[this.year]["totalIVARetenido"] == undefined) this.resultProcess[this.year]["totalIVARetenido"] = 0;
		if (this.resultProcess[this.year]["totalISRRetenido"] == undefined) this.resultProcess[this.year]["totalISRRetenido"] = 0;


		if (this.resultProcess[this.year + "_" + this.month]["totalIVATrasladado"] == undefined) this.resultProcess[this.year + "_" + this.month]["totalIVATrasladado"] = 0;
		if (this.resultProcess[this.year + "_" + this.month]["totalISRTrasladado"] == undefined) this.resultProcess[this.year + "_" + this.month]["totalISRTrasladado"] = 0;
		if (this.resultProcess[this.year + "_" + this.month]["totalIVARetenido"] == undefined) this.resultProcess[this.year + "_" + this.month]["totalIVARetenido"] = 0;
		if (this.resultProcess[this.year + "_" + this.month]["totalISRRetenido"] == undefined) this.resultProcess[this.year + "_" + this.month]["totalISRRetenido"] = 0;

		if (this.resultProcess[this.year + "_" + this.month]["totalIVATrasladado_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year + "_" + this.month]["totalIVATrasladado_del_año_hasta_ahora"] = this.resultProcess[this.year]["totalIVATrasladado"];
		if (this.resultProcess[this.year + "_" + this.month]["totalISRTrasladado_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year + "_" + this.month]["totalISRTrasladado_del_año_hasta_ahora"] = this.resultProcess[this.year]["totalISRTrasladado"];
		if (this.resultProcess[this.year + "_" + this.month]["totalIVARetenido_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year + "_" + this.month]["totalIVARetenido_del_año_hasta_ahora"] = this.resultProcess[this.year]["totalIVARetenido"];
		if (this.resultProcess[this.year + "_" + this.month]["totalISRRetenido_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year + "_" + this.month]["totalISRRetenido_del_año_hasta_ahora"] = this.resultProcess[this.year]["totalISRRetenido"];

		if (this.tipoRuta == 1) {
			if (tipoMovimiento == "trasladados") {
				if (contenedor["Impuesto"] == "002") {
					this.resultProcess[this.year]["totalIVATrasladado"] += parseFloat(contenedor["Importe"]);
					this.resultProcess[this.year + "_" + this.month]["totalIVATrasladado"] += parseFloat(contenedor["Importe"]);
					this.resultProcess[this.year + "_" + this.month]["totalIVATrasladado_del_año_hasta_ahora"] += parseFloat(contenedor["Importe"]);
					this.PREPARED["totalIVATrasladado"] = parseFloat(contenedor["Importe"]);
				} else if (contenedor["Impuesto"] == "001") {
					this.resultProcess[this.year]["totalISRTrasladado"] += parseFloat(contenedor["Importe"]);
					this.resultProcess[this.year + "_" + this.month]["totalISRTrasladado"] += parseFloat(contenedor["Importe"]);
					this.resultProcess[this.year + "_" + this.month]["totalISRTrasladado_del_año_hasta_ahora"] += parseFloat(contenedor["Importe"]);
					this.PREPARED["totalISRTrasladado"] = parseFloat(contenedor["Importe"]);
				}
			} else if (tipoMovimiento == "retenciones") {
				if (contenedor["Impuesto"] == "002") {
					this.resultProcess[this.year]["totalIVARetenido"] += parseFloat(contenedor["Importe"]);
					this.resultProcess[this.year + "_" + this.month]["totalIVARetenido"] += parseFloat(contenedor["Importe"]);
					this.resultProcess[this.year + "_" + this.month]["totalIVARetenido_del_año_hasta_ahora"] += parseFloat(contenedor["Importe"]);
					this.PREPARED["totalIVARetenido"] = parseFloat(contenedor["Importe"]);
				} else if (contenedor["Impuesto"] == "001") {
					this.resultProcess[this.year]["totalISRRetenido"] += parseFloat(contenedor["Importe"]);
					this.resultProcess[this.year + "_" + this.month]["totalISRRetenido"] += parseFloat(contenedor["Importe"]);
					this.resultProcess[this.year + "_" + this.month]["totalISRRetenido_del_año_hasta_ahora"] += parseFloat(contenedor["Importe"]);
					this.PREPARED["totalISRRetenido"] = parseFloat(contenedor["Importe"]);
				}
			}
		}
	}

	async getResultSet() {
		return this.resultProcess;
	}

	async saveInfo() {
		fs.writeFileSync("temp/informe.json", JSON.stringify(this.resultProcess, null, "\t"));
	}

	async convertMonthNumberToMonthString(number) {
		if (number == 1) return "Enero";
		else if (number == 2) return "Febrero";
		else if (number == 3) return "Marzo";
		else if (number == 4) return "Abril";
		else if (number == 5) return "Mayo";
		else if (number == 6) return "Junio";
		else if (number == 7) return "Julio";
		else if (number == 8) return "Agosto";
		else if (number == 9) return "Septiembre";
		else if (number == 10) return "Octubre";
		else if (number == 11) return "Noviembre";
		else if (number == 12) return "Diciembre";
	}

	async ejecuteForAllFilesInXMLFolder(myFolder) {
		const files = fs.readdirSync(myFolder);
		const myListFiles = [];
		for (let indexFiles = 0; indexFiles < files.length; indexFiles++) {
			const elementFile = files[indexFiles];
			await this.loadFile("xml/" + elementFile);
			const resultSet = await this.ConvertXMLToJSON();
			myListFiles.push({ file: elementFile, Fecha: resultSet["cfdi:Comprobante"]["$"]["Fecha"] })
		}

		let isChange = false;
		do {
			isChange = false;
			for (let indexFiles = 0; indexFiles < myListFiles.length - 1; indexFiles++) {
				if (new Date(myListFiles[indexFiles]["Fecha"]) > new Date(myListFiles[indexFiles + 1]["Fecha"])) {
					var temp = myListFiles[indexFiles];
					myListFiles[indexFiles] = myListFiles[indexFiles + 1];
					myListFiles[indexFiles + 1] = temp;
					isChange = true;
				}

			}
		}
		while (isChange);


		const date1 = new Date("2019-07-12T04:26:47");
		const date2 = new Date("2019-01-24T11:12:29");
		console.log(date1 > date2);

		for (let indexFiles = 0; indexFiles < myListFiles.length; indexFiles++) {
			const elementFile = myListFiles[indexFiles].file;
			await this.loadFile("xml/" + elementFile);
			const jsonFile = await this.ConvertXMLToJSON();
			try {
				await this.comprobarRuta();
				await this.UbicarContenedor();
				if (this.error) {
					console.log("Falla al procesar", elementFile);
					if (this.resultProcess["ERRORES"] == undefined) this.resultProcess["ERRORES"] = [];
					this.resultProcess["ERRORES"].push({ path: this.path, error: this.error.toString() });
					fs.writeFileSync("temp/" + elementFile + ".json", JSON.stringify(jsonFile, null, "\t"));
					this.error = undefined;
				} else {
					console.log("Procesado: ", elementFile);
				}
			} catch (err) {
				console.log("Falla al procesar", elementFile);
				fs.writeFileSync("temp/" + elementFile + ".json", JSON.stringify(jsonFile, null, "\t"));
				console.log(err);
			}
		}
		await this.saveInfo();
	}
}



module.exports = XMLProcessing;