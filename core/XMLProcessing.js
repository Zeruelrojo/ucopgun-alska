const xml2js = require("xml2js");
const fs = require("fs");


class XMLProcessing {

	constructor() {
		this.resultProcess = {};
		this.resultProcess["historial"] = [];
		this.PREPARED = {};
		this.debug = false;
	}

	async setDebugModeOn() {
		this.debug = true;
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

		let date = new Date(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonFecha]);
		this.month = await this.convertMonthNumberToMonthString((date.getUTCMonth() + 1));

		this.year = date.getUTCFullYear();

		this.PREPARED["Fecha"] = this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonFecha];
		this.PREPARED["NoCertificado"] = this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonNoCertificado];
		this.PREPARED["Archivo"] = this.path;
		this.PREPARED["TipoFactura"] = this.tipoRuta;
		this.PREPARED["Moneda"] = this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonMoneda];
		this.PREPARED["FormaPago"] = this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonFormaPago];
		this.PREPARED["MetodoPago"] = this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonMetodoPago];
		this.PREPARED["TipoDeComprobante"] = this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonTipoDeComprobante];
		this.PREPARED["Total"] = parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonTotal]);
		this.PREPARED["SubTotal"] = parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
		if (this.resultSet["cfdi:Comprobante"]["cfdi:Emisor"][0]["$"][this.resultSetJsonEmisorRfc].includes(this.RFC)) {
			this.PREPARED["Rol"] = "EMISOR";
			this.PREPARED["Contraparte"] = this.resultSet["cfdi:Comprobante"]["cfdi:Receptor"][0]["$"][this.resultSetJsonReceptorNombre];
		} else if (this.resultSet["cfdi:Comprobante"]["cfdi:Receptor"][0]["$"][this.resultSetJsonReceptorRfc].includes(this.RFC)) {
			this.PREPARED["Rol"] = "RECEPTOR";
			this.PREPARED["Contraparte"] = this.resultSet["cfdi:Comprobante"]["cfdi:Emisor"][0]["$"][this.resultSetJsonEmisorNombre];
		} else {
			console.log("ERROR, NINGUN RFC CONCUERDA CON LA FACTURA,", this.path)
			console.log("VERIFIQUE QUE EL RFC SE ENCUENTRE DEBIDAMENTE ASIGNADO EN ucopgun_alska_RFC")
			console.log("RFC ACTUALMENTE ASIGNADA: ", process.env.ucopgun_alska_RFC)
			console.log("CANCELANDO PROCESO")
			process.exit(1)
		}

		if (this.resultProcess[this.year] == undefined) this.resultProcess[this.year] = {};
		if (this.resultProcess[this.year]["Total"] == undefined) this.resultProcess[this.year]["Total"] = {};
		if (this.resultProcess[this.year][this.month] == undefined) this.resultProcess[this.year][this.month] = {};

		if (this.resultProcess[this.year]["Total"]["Ingresos_Brutos"] == undefined) this.resultProcess[this.year]["Total"]["Ingresos_Brutos"] = 0;
		if (this.resultProcess[this.year][this.month]["Ingresos_Brutos"] == undefined) this.resultProcess[this.year][this.month]["Ingresos_Brutos"] = 0;
		if (this.resultProcess[this.year][this.month]["Ingresos_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year][this.month]["Ingresos_del_año_hasta_ahora"] = this.resultProcess[this.year]["Total"]["Ingresos_Brutos"];
		if (this.resultProcess[this.year]["Total"]["Gastos_Brutos"] == undefined) this.resultProcess[this.year]["Total"]["Gastos_Brutos"] = 0;
		if (this.resultProcess[this.year][this.month]["Gastos_Brutos"] == undefined) this.resultProcess[this.year][this.month]["Gastos_Brutos"] = 0;
		if (this.resultProcess[this.year][this.month]["Gastos_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year][this.month]["Gastos_del_año_hasta_ahora"] = this.resultProcess[this.year]["Total"]["Gastos_Brutos"];

		if (this.resultSet["cfdi:Comprobante"]["cfdi:Emisor"][0]["$"][this.resultSetJsonEmisorRfc].includes(this.RFC)) {
			this.resultProcess[this.year]["Total"]["Ingresos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
			this.resultProcess[this.year][this.month]["Ingresos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
			this.resultProcess[this.year][this.month]["Ingresos_del_año_hasta_ahora"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
		} else if (this.resultSet["cfdi:Comprobante"]["cfdi:Receptor"][0]["$"][this.resultSetJsonReceptorRfc].includes(this.RFC)) {
			this.resultProcess[this.year]["Total"]["Gastos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
			this.resultProcess[this.year][this.month]["Gastos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
			this.resultProcess[this.year][this.month]["Gastos_del_año_hasta_ahora"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
		}



		if (this.resultProcess[this.year + "_CONTRAPARTES"] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"] = {};
		if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]] = {};
		if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"] = {};
		if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month] = {};

		if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"]["Ingresos_Brutos"] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"]["Ingresos_Brutos"] = 0;
		if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Ingresos_Brutos"] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Ingresos_Brutos"] = 0;
		if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Ingresos_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Ingresos_del_año_hasta_ahora"] = this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"]["Ingresos_Brutos"];
		if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"]["Gastos_Brutos"] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"]["Gastos_Brutos"] = 0;
		if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Gastos_Brutos"] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Gastos_Brutos"] = 0;
		if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Gastos_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Gastos_del_año_hasta_ahora"] = this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"]["Gastos_Brutos"];

		if (this.resultSet["cfdi:Comprobante"]["cfdi:Emisor"][0]["$"][this.resultSetJsonEmisorRfc].includes(this.RFC)) {
			this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"]["Ingresos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
			this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Ingresos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
			this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Ingresos_del_año_hasta_ahora"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
		} else if (this.resultSet["cfdi:Comprobante"]["cfdi:Receptor"][0]["$"][this.resultSetJsonReceptorRfc].includes(this.RFC)) {
			this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"]["Gastos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
			this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Gastos_Brutos"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
			this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month]["Gastos_del_año_hasta_ahora"] += parseFloat(this.resultSet["cfdi:Comprobante"]["$"][this.resultSetJsonSubTotal]);
		}

		let returnerBoolean = false



		// this.resultSet["cfdi:Comprobante"]["cfdi:Conceptos"][index1]["cfdi:Concepto"][index2]["cfdi:Impuestos"] (undefined es sin impuesto)
		// this.resultSet["cfdi:Comprobante"]["cfdi:Conceptos"][index1]["cfdi:Concepto"][index2]["cfdi:Impuestos"][index3]["cfdi:Traslados"][index4]["cfdi:Traslado"][index5]["$"]["importe"]

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
									if (this.PREPARED["Rol"] == "EMISOR" && elementImpuestos["cfdi:Retenciones"] == undefined) {
										await this.ProcesarTotales(contenedor, "retenciones");
									} else {
										await this.ProcesarTotales(contenedor, "trasladados");
									}
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
			returnerBoolean = true
		} else
			if (this.tipoRuta == 3) {
				if (this.resultSet["cfdi:Comprobante"]["cfdi:Impuestos"] == undefined) {
					const contenedor = this.resultSet["cfdi:Comprobante"]["cfdi:Impuestos"]["$"];
					await this.ProcesarTotales(contenedor, "sin impuestos");
				} else {
					for (let indexImpuestos = 0; indexImpuestos < this.resultSet["cfdi:Comprobante"]["cfdi:Impuestos"].length; indexImpuestos++) {
						const elementImpuestos = this.resultSet["cfdi:Comprobante"]["cfdi:Impuestos"][indexImpuestos];
						for (let indexTraslados = 0; indexTraslados < elementImpuestos["cfdi:Traslados"].length; indexTraslados++) {
							const elementTraslados = elementImpuestos["cfdi:Traslados"][indexTraslados];
							for (let indexTraslado = 0; indexTraslado < elementTraslados["cfdi:Traslado"].length; indexTraslado++) {
								const elementTraslado = elementTraslados["cfdi:Traslado"][indexTraslado];
								const contenedor = elementTraslado["$"];
								if (this.PREPARED["Rol"] == "EMISOR" && elementImpuestos["cfdi:Retenciones"] == undefined) {
									await this.ProcesarTotales(contenedor, "retenciones");
								} else {
									await this.ProcesarTotales(contenedor, "trasladados");
								}
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
				this.tipoRuta = undefined;
				this.resultProcess["historial"].push(this.PREPARED);
				returnerBoolean = true
			} else if (this.tipoRuta == 2) {
				const contenedor = this.resultSet["cfdi:Comprobante"]["$"];
				await this.ProcesarTotales(contenedor);
				this.tipoRuta = undefined;
				this.resultProcess["historial"].push(this.PREPARED);
				returnerBoolean = true
			} else {
				this.tipoRuta = undefined;
				returnerBoolean = false
			}

		this.PREPARED = {};

		return returnerBoolean;

	}

	async comprobarRuta() {
		this.tipoRuta = undefined;
		try {
			if (this.resultSet["cfdi:Comprobante"]["cfdi:Impuestos"][0]["cfdi:Traslados"][0]["cfdi:Traslado"][0]["$"] == undefined
				&& this.resultSet["cfdi:Comprobante"]["cfdi:Impuestos"][0]["cfdi:Retenciones"][0]["cfdi:Retencion"][0]["$"] == undefined) {
				throw new Error("valor no existente");
			}
			this.tipoRuta = 3;
		} catch (err) {
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
	}

	async comprobarVariables() {
		//this.resultSetJson
		this.verificado([this.resultSet["cfdi:Comprobante"]["$"]], "NoCertificado", ["noCertificado", "nocertificado"]);
		this.verificado([this.resultSet["cfdi:Comprobante"]["$"]], "Fecha", ["fecha"]);
		this.verificado([this.resultSet["cfdi:Comprobante"]["cfdi:Receptor"][0]["$"]], "Rfc", ["RFC", "rfc"], "Receptor");
		this.verificado([this.resultSet["cfdi:Comprobante"]["cfdi:Emisor"][0]["$"]], "Rfc", ["RFC", "rfc"], "Emisor");
		this.verificado([this.resultSet["cfdi:Comprobante"]["cfdi:Receptor"][0]["$"]], "Nombre", ["nombre"], "Receptor");
		this.verificado([this.resultSet["cfdi:Comprobante"]["cfdi:Emisor"][0]["$"]], "Nombre", ["nombre"], "Emisor");
		this.verificado([this.resultSet["cfdi:Comprobante"]["$"]], "Moneda", ["moneda"]);
		this.verificado([this.resultSet["cfdi:Comprobante"]["$"]], "FormaPago", ["formaPago", "formapago", "formaDePago"]);
		this.verificado([this.resultSet["cfdi:Comprobante"]["$"]], "MetodoPago", ["metodoPago", "metodoPago", "metodoDePago"]);
		this.verificado([this.resultSet["cfdi:Comprobante"]["$"]], "TipoDeComprobante", ["tipoDeComprobante", "tipodecomprobante"]);
		this.verificado([this.resultSet["cfdi:Comprobante"]["$"]], "Total", ["total"]);
		this.verificado([this.resultSet["cfdi:Comprobante"]["$"]], "SubTotal", ["subTotal", "subtotal"]);
	}

	async verificado(rutaPadre, palabraClave, variaciones, prefijo) {
		let prefix = "";
		if (prefijo != undefined) {
			prefix = prefijo;
		}
		let entra = false;
		for (let indexRuta = 0; indexRuta < rutaPadre.length; indexRuta++) {
			entra = false;
			const elementRuta = rutaPadre[indexRuta];
			this["resultSetJson" + prefix + palabraClave] = "";
			if (elementRuta[palabraClave] != undefined) {
				this["resultSetJson" + prefix + palabraClave] = palabraClave;
				entra = true;
			}
			if (!entra) {
				for (let index = 0; index < variaciones.length; index++) {
					if (elementRuta[variaciones[index]] != undefined) {
						this["resultSetJson" + prefix + palabraClave] = variaciones[index];
						entra = true;
						break;
					}
				}
			}
			if (entra) break;
		}
		if (!entra) {
			this["resultSetJson" + prefix + palabraClave] = palabraClave;
			console.log("No se pudo ubicar la ", palabraClave, " en el comprobante: ", this.path);
		}

	}

	async ProcesarTotales(contenedor, tipoMovimiento) {
		const tiposTotales = ["totalIVATrasladado", "totalISRTrasladado", "totalIVARetenido", "totalISRRetenido", "totalIEPSTrasladado", "totalIEPSRetenido"];

		for (let indexTiposTotales = 0; indexTiposTotales < tiposTotales.length; indexTiposTotales++) {
			const elementTipoTotal = tiposTotales[indexTiposTotales];

			if (this.resultProcess[this.year]["Total"][elementTipoTotal] == undefined) this.resultProcess[this.year]["Total"][elementTipoTotal] = 0;
			if (this.resultProcess[this.year][this.month][elementTipoTotal] == undefined) this.resultProcess[this.year][this.month][elementTipoTotal] = 0;
			if (this.resultProcess[this.year][this.month][elementTipoTotal + "_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year][this.month][elementTipoTotal + "_del_año_hasta_ahora"] = this.resultProcess[this.year]["Total"][elementTipoTotal];
			if (this.PREPARED[elementTipoTotal] == undefined) this.PREPARED[elementTipoTotal] = 0;


			if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"][elementTipoTotal] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"][elementTipoTotal] = 0;
			if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month][elementTipoTotal] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month][elementTipoTotal] = 0;
			if (this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month][elementTipoTotal + "_del_año_hasta_ahora"] == undefined) this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month][elementTipoTotal + "_del_año_hasta_ahora"] = this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"][elementTipoTotal];


		}

		if (this.tipoRuta == 1 || this.tipoRuta == 3) {

			let impuesto = "";
			let tipoTotal = "";
			let importe = "";
			if (contenedor["Impuesto"] != undefined) {
				impuesto = "Impuesto";
			} else if (contenedor["impuesto"] != undefined) {
				impuesto = "impuesto";
			}

			if (contenedor["Importe"] != undefined) {
				importe = "Importe";
			} else if (contenedor["importe"] != undefined) {
				importe = "importe";
			}

			if (tipoMovimiento == "trasladados" && (contenedor[impuesto] == "002" || contenedor[impuesto] == "IVA")) {
				tipoTotal = "totalIVATrasladado";
			} else if (tipoMovimiento == "trasladados" && (contenedor[impuesto] == "001" || contenedor[impuesto] == "ISR")) {
				tipoTotal = "totalISRTrasladado";
			} else if (tipoMovimiento == "trasladados" && (contenedor[impuesto] == "003" || contenedor[impuesto] == "IEPS")) {
				tipoTotal = "totalIEPSTrasladado";
			} else if (tipoMovimiento == "retenciones" && (contenedor[impuesto] == "002" || contenedor[impuesto] == "IVA")) {
				tipoTotal = "totalIVARetenido";
			} else if (tipoMovimiento == "retenciones" && (contenedor[impuesto] == "001" || contenedor[impuesto] == "ISR")) {
				tipoTotal = "totalISRRetenido";
			} else if (tipoMovimiento == "retenciones" && (contenedor[impuesto] == "003" || contenedor[impuesto] == "IEPS")) {
				tipoTotal = "totalIEPSRetenido";
			} else {
				console.log("No se encontro el impuesto de IVA o ISR");
				tipoTotal = "no definido";
			}

			if (tipoTotal != "no definido") {
				if (contenedor["TipoFactor"] != undefined && contenedor["TipoFactor"] == "Exento") {
					console.log("IGNORADO POR IMPUESTO EXENTO:", " en el comprobante: ", this.path)
				} else {
					if (!isNaN(parseFloat(contenedor[importe]))) {
						this.resultProcess[this.year]["Total"][tipoTotal] += parseFloat(contenedor[importe]);
						this.resultProcess[this.year][this.month][tipoTotal] += parseFloat(contenedor[importe]);
						this.resultProcess[this.year][this.month][tipoTotal + "_del_año_hasta_ahora"] += parseFloat(contenedor[importe]);
						this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]]["Total"][tipoTotal] += parseFloat(contenedor[importe]);
						this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month][tipoTotal] += parseFloat(contenedor[importe]);
						this.resultProcess[this.year + "_CONTRAPARTES"][this.PREPARED["Contraparte"]][this.month][tipoTotal + "_del_año_hasta_ahora"] += parseFloat(contenedor[importe]);
						this.PREPARED[tipoTotal] += parseFloat(contenedor[importe]);
					} else {
						console.log("ERROR EN OBTENER CALCULO:", " en el comprobante: ", this.path)
						console.log(tipoTotal, ": ", this.resultProcess[this.year]["Total"][tipoTotal], ", ", parseFloat(contenedor[importe]))
						console.log("Valor que se intenta parsear a punto flotante: ", contenedor[importe])
						console.log("Mas información: ", contenedor)
					}
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
			if (resultSet != undefined) {
				let Fecha = resultSet["cfdi:Comprobante"]["$"]["Fecha"] || resultSet["cfdi:Comprobante"]["$"]["fecha"];
				myListFiles.push({ file: elementFile, Fecha })
			} else {
				console.log("Error al cargar el archivo", ": ", "xml/", elementFile, " removido de la lista para procesar")
			}

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
				await this.comprobarVariables();
				await this.UbicarContenedor();
				if (this.error) {
					console.log("Falla al procesar", elementFile);
					if (this.resultProcess["ERRORES"] == undefined) this.resultProcess["ERRORES"] = [];
					this.resultProcess["ERRORES"].push({ path: this.path, error: this.error.toString() });
					fs.writeFileSync("temp/" + elementFile + ".json", JSON.stringify(jsonFile, null, "\t"));
					this.error = undefined;
				} else {
					if (this.debug) fs.writeFileSync("temp/" + elementFile + ".json", JSON.stringify(jsonFile, null, "\t"));
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