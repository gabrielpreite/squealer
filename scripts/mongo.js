﻿/*
File: mongo.js
Author: Fabio Vitali
Version: 1.0
Last change on: 10 April 2021


Copyright (c) 2021 by Fabio Vitali

   Permission to use, copy, modify, and/or distribute this software for any
   purpose with or without fee is hereby granted, provided that the above
   copyright notice and this permission notice appear in all copies.

   THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
   SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
   OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
   CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/
const CryptoJS = require('crypto-js');

/* Dati di prova */
let fn_utente = "/public/data/utente.json"
let fn_canale = "/public/data/canale.json"
let fn_messaggio = "/public/data/messaggio.json"
let fn_notifica = "/public/data/notifica.json"
let fn_chat = "/public/data/chat.json"
let fn_defaults = "/public/data/defaults.json"
let dbname = "db"

const { MongoClient, MongoCredentials } = require("mongodb");
const fs = require('fs').promises;
const template = require(global.rootDir + '/scripts/tpl.js');

/* ========================== */
/*                            */
/*           SCHEDULE         */
/*                            */
/* ========================== */

exports.daily = async function (dry, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	try {
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		/* [1] RESET QUOTA */

		console.log("[D1] Inizio reset quota")
		let def_file = await fs.readFile(rootDir + fn_defaults, 'utf8')
		let def_json = JSON.parse(def_file)
		const DEF_G = def_json.quota_default.g
		const DEF_S = def_json.quota_default.s
		const DEF_M = def_json.quota_default.m

		let result = []
		await mongo.db(dbname)
			.collection("utente")
			.find()
			.project({ _id: 0 })
			.forEach((r) => {
				result.push(r)
			});

		result.forEach((user) => {
			let new_quota = { "g": parseInt(user.quota.g), "s": parseInt(user.quota.s), "m": parseInt(user.quota.m) }
			console.log("[D1] quota utente " + user.username + ": " + JSON.stringify(user.quota))
			let differenza = DEF_G - user.quota.g //quota necessaria per tornare al valore di default
			//console.log("differenza = " + typeof differenza)
			if (differenza > 0) { //la quota non e' gia' piena
				console.log("[D1] richiedo " + differenza + " quota")
				differenza = Math.min(differenza, user.quota.s)
				console.log("[D1] ottenuta " + differenza + " dalla quota settimanale")
				new_quota.s -= differenza
				new_quota.g += differenza
				console.log("[D1] nuova quota utente " + user.username + ": " + JSON.stringify(new_quota))

				if (!dry) {
					console.log("[D1] applico nuova quota")
					mongo.db(dbname)
						.collection("utente")
						.updateOne(
							{ username: user.username },
							{ $set: { quota: new_quota } }
						)
				}
			}
		})
		console.log("[D1] Fine reset quota")

		/* [2] CALCOLO SQUEAL POP/IMPOP/CONTR */

		console.log("[D2] Inizio calcolo etichette")
		result = []
		await mongo.db(dbname)
			.collection("messaggio")
			.find({visualizzazioni: {$gt: 50}})
			.project({ _id: 0 })
			.forEach((r) => {
				result.push(r)
			});

		result.forEach((squeal) => {
			let visual = squeal.visualizzazioni
			let reac_pos = squeal.reazioni.positive.concordo.length + squeal.reazioni.positive.mi_piace.length + squeal.reazioni.positive.adoro.length
			let reac_neg = squeal.reazioni.negative.sono_contrario.length + squeal.reazioni.negative.mi_disgusta.length + squeal.reazioni.negative.odio.length
			let mc = 0.25 * visual
			console.log("[D2] squeal " + squeal.post_id + ", visual " + visual + ", positive " + reac_pos + ", negative " + reac_neg + ", massa critica " + mc)

			let etichetta = null
			if (reac_pos > mc && reac_neg > mc) {
				console.log("[D2] squeal controverso")
				etichetta = "controverso"
			} else if (reac_pos > mc) {
				console.log("[D2] squeal popolare")
				etichetta = "popolare"
			} else if (reac_neg > mc) {
				console.log("[D2] squeal impopolare")
				etichetta = "impopolare"
			}

			if (!dry) {//applico modifiche
				console.log("[D2] applico modifiche")
				if (etichetta !== null) {
					console.log("[D2] setto categoria " + etichetta)
					mongo.db(dbname)
						.collection("messaggio")
						.updateOne(
							{ post_id: squeal.post_id },
							{ $set: { categoria: etichetta } }
						)
					if (etichetta === "controverso" && squeal.categoria !== "controverso") { //aggiungo il post al canale $CONTROVERSO
						console.log("[D2] aggiungo post controverso al canale")
						mongo.db(dbname)
							.collection("messaggio")
							.updateOne(
								{ post_id: squeal.post_id },
								{ $push: { destinatari: "$CONTROVERSO" } }
							)
					}

					//notifico l'utente del cambiamento di categoria
					if (etichetta !== squeal.categoria) { // solo se la categoria e' cambiata
						console.log("[D2] invio notifica ad utente")
						add_notifica(squeal.utente, "popolarita", squeal.post_id, credentials, etichetta, null)
					}
				}
			}
		})
		console.log("[D2] Fine calcolo etichette")

		/* [3] RICALCOLO QUOTA PER POPOLARITA' */

		console.log("[D3] Inizio ricalcolo quota popolarita")
		result = []
		await mongo.db(dbname)
			.collection("utente")
			.find()
			.project({ _id: 0 })
			.forEach((r) => {
				result.push(r)
			});

		result.forEach((user) => {
			let pop = user.popolarita.valori[user.popolarita.valori.length - 1]
			let bonus = (Math.floor(pop / 10) / 100) * DEF_G //1% +- per ogni 10 di popolarita
			console.log("[D3] utente " + user.username + ", popolarita " + pop + ", caratteri bonus/malus " + bonus)
			if (!dry && bonus != 0) {
				console.log("[D3] aggiorno quota")
				user_update_quota(user.username, { qnt: bonus, acquisto: false }, credentials)
				console.log("[D3] invio notifica")
				add_notifica(user.username, "quota", null, credentials, bonus, null)
			}
		})

		console.log("[D3] Fine ricalcolo quota popolarita")
		return "ok"
	} catch (e) {
		console.log(e)
	}
}

exports.weekly = async function (dry, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	try {
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		/* [1] RESET QUOTA */
		console.log("[W1] Inizio reset quota")
		let def_file = await fs.readFile(rootDir + fn_defaults, 'utf8')
		let def_json = JSON.parse(def_file)
		const DEF_G = def_json.quota_default.g
		const DEF_S = def_json.quota_default.s
		const DEF_M = def_json.quota_default.m

		let result = []
		await mongo.db(dbname)
			.collection("utente")
			.find()
			.project({ _id: 0 })
			.forEach((r) => {
				result.push(r)
			});

		result.forEach((user) => {
			let new_quota = { "g": parseInt(user.quota.g), "s": parseInt(user.quota.s), "m": parseInt(user.quota.m) }
			console.log("[W1] quota utente " + user.username + ": " + JSON.stringify(user.quota))
			let differenza = DEF_S - user.quota.s //quota necessaria per tornare al valore di default
			if (differenza > 0) { //la quota non e' gia' piena
				console.log("[W1] richiedo " + differenza + " quota")
				differenza = Math.min(differenza, user.quota.m)
				console.log("[W1] ottenuta " + differenza + " dalla quota mensile")
				new_quota.m -= differenza
				new_quota.s += differenza
				console.log("[W1] nuova quota utente " + user.username + ": " + JSON.stringify(new_quota))

				if (!dry) {
					console.log("[W1] applico nuova quota")
					mongo.db(dbname)
						.collection("utente")
						.updateOne(
							{ username: user.username },
							{ $set: { quota: new_quota } }
						)
				}
			}
		})
		console.log("[W1] Fine reset quota")

		/* [2] CALCOLO POPOLARITA' UTENTE */

		console.log("[W2] inizio calcolo popolarita")

		//trovo intervallo settimanale
		let curr_date = new Date();
		let first_date = new Date(curr_date)
		first_date.setDate(curr_date.getDate() - 7)
		const options = {
			day: '2-digit',
			month: '2-digit',
		};
		let intervallo = first_date.toLocaleDateString("it-IT", options);
		intervallo += " - "

		let second_date = new Date(curr_date)
		second_date.setDate(curr_date.getDate() - 1)
		intervallo += second_date.toLocaleDateString("it-IT", options)

		console.log("[W2] intervallo settimanale: " + intervallo)

		async function processUsers(result) {
			for (const user of result) {
				console.log("[W2] utente " + user.username);
				let pop = 0;

				await new Promise((resolve, reject) => {
					mongo
						.db(dbname)
						.collection("messaggio")
						.find({ utente: user.username })
						.project({ _id: 0 })
						.forEach((r) => {
							console.log("[W2] post_id " +r.post_id +" di " +user.username +" con categoria " +r.categoria);
							if (r.categoria === "popolare") {
								pop += 1;
							}
							if (r.categoria === "impopolare") {
								pop -= 1;
							}
						}, () => {
							resolve();
						});
				});

				console.log("[W2] popolarita' totale: " + pop);

				if (!dry) {
					console.log("[W2] aggiungo record popolarita");
					await mongo.db(dbname).collection("utente").updateOne(
						{ username: user.username },
						{
							$push: {
								"popolarita.settimane": intervallo,
								"popolarita.valori": pop,
							},
						}
					);
				}
			}
		}

		processUsers(result);

		console.log("[W2] fine calcolo popolarita")

		return "ok"
	} catch (e) {
		console.log(e)
	}
}

exports.monthly = async function (dry, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	try {
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		/* [1] RESET QUOTA */
		console.log("[M1] Inizio reset quota")
		let def_file = await fs.readFile(rootDir + fn_defaults, 'utf8')
		let def_json = JSON.parse(def_file)
		const DEF_G = def_json.quota_default.g
		const DEF_S = def_json.quota_default.s
		const DEF_M = def_json.quota_default.m

		let result = []
		await mongo.db(dbname)
			.collection("utente")
			.find()
			.project({ _id: 0 })
			.forEach((r) => {
				result.push(r)
			});

		result.forEach((user) => {
			let new_quota = { "g": user.quota.g, "s": user.quota.s, "m": DEF_M }
			console.log("[M1] nuova quota " + user.username + ": " + JSON.stringify(new_quota))

			if (!dry) {
				console.log("[M1] applico nuova quota")
				mongo.db(dbname)
					.collection("utente")
					.updateOne(
						{ username: user.username },
						{ $set: { quota: new_quota } }
					)
			}
		})
		console.log("[M1] Fine reset quota")

		return "ok"
	} catch (e) {
		console.log(e)
	}
}

/* ========================== */
/*                            */
/*           MONGODB          */
/*                            */
/* ========================== */
//chiamate di debug/mantenimento

exports.create = async function (credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	let debug = []
	try {
		//CONNESSIONE
		debug.push(`Trying to connect to MongoDB with user: '${credentials.user}' and site: '${credentials.site}' and a ${credentials.pwd.length}-character long password...`)
		const mongo = new MongoClient(mongouri);
		await mongo.connect();
		debug.push("... managed to connect to MongoDB.")

		//CANCELLO
		debug.push(`Trying to remove all records in table '${dbname}'... `)
		let cleared1 = await mongo.db(dbname)
			.collection("utente")
			.deleteMany()
		debug.push(`... ${cleared1?.deletedCount || 0} records deleted.`)
		debug.push(`Trying to remove all records in table '${dbname}'... `)
		let cleared2 = await mongo.db(dbname)
			.collection("messaggio")
			.deleteMany()
		debug.push(`... ${cleared2?.deletedCount || 0} records deleted.`)
		debug.push(`Trying to remove all records in table '${dbname}'... `)
		let cleared3 = await mongo.db(dbname)
			.collection("canale")
			.deleteMany()
		debug.push(`... ${cleared3?.deletedCount || 0} records deleted.`)
		debug.push(`Trying to remove all records in table '${dbname}'... `)
		let cleared4 = await mongo.db(dbname)
			.collection("notifica")
			.deleteMany()
		debug.push(`... ${cleared4?.deletedCount || 0} records deleted.`)
		debug.push(`Trying to remove all records in table '${dbname}'... `)
		let cleared5 = await mongo.db(dbname)
			.collection("chat")
			.deleteMany()
		debug.push(`... ${cleared5?.deletedCount || 0} records deleted.`)

		//AGGIUNGO UTENTE
		debug.push(`Trying to read file '${fn_utente}'... `)
		let doc1 = await fs.readFile(rootDir + fn_utente, 'utf8')
		let data1 = JSON.parse(doc1)
		debug.push(`... read ${data1.length} records successfully. `)
		debug.push(`Trying to add ${data1.length} new records... `)
		let added1 = await mongo.db(dbname)
			.collection("utente")
			.insertMany(data1);
		debug.push(`... ${added1?.insertedCount || 0} records added.`)

		//AGGIUNGO CANALE
		debug.push(`Trying to read file '${fn_canale}'... `)
		let doc2 = await fs.readFile(rootDir + fn_canale, 'utf8')
		let data2 = JSON.parse(doc2)
		debug.push(`... read ${data2.length} records successfully. `)
		debug.push(`Trying to add ${data2.length} new records... `)
		let added2 = await mongo.db(dbname)
			.collection("canale")
			.insertMany(data2);
		debug.push(`... ${added2?.insertedCount || 0} records added.`)

		//AGGIUNGO MESSAGGIO
		debug.push(`Trying to read file '${fn_messaggio}'... `)
		let doc3 = await fs.readFile(rootDir + fn_messaggio, 'utf8')
		let data3 = JSON.parse(doc3)
		debug.push(`... read ${data3.length} records successfully. `)
		debug.push(`Trying to add ${data3.length} new records... `)
		let added3 = await mongo.db(dbname)
			.collection("messaggio")
			.insertMany(data3);
		debug.push(`... ${added3?.insertedCount || 0} records added.`)

		//AGGIUNGO NOTIFICA
		debug.push(`Trying to read file '${fn_notifica}'... `)
		let doc4 = await fs.readFile(rootDir + fn_notifica, 'utf8')
		let data4 = JSON.parse(doc4)
		debug.push(`... read ${data4.length} records successfully. `)
		debug.push(`Trying to add ${data4.length} new records... `)
		let added4 = await mongo.db(dbname)
			.collection("notifica")
			.insertMany(data4);
		debug.push(`... ${added4?.insertedCount || 0} records added.`)

		//AGGIUNGO CHAT
		debug.push(`Trying to read file '${fn_chat}'... `)
		let doc5 = await fs.readFile(rootDir + fn_chat, 'utf8')
		let data5 = JSON.parse(doc5)
		debug.push(`... read ${data5.length} records successfully. `)
		debug.push(`Trying to add ${data5.length} new records... `)
		let added5 = await mongo.db(dbname)
			.collection("chat")
			.insertMany(data5);
		debug.push(`... ${added5?.insertedCount || 0} records added.`)

		//CHIUDO
		await mongo.close();
		debug.push("Managed to close connection to MongoDB.")

		return {
			message: `<h1>Removed ${(cleared1?.deletedCount + cleared2?.deletedCount + cleared3?.deletedCount + cleared4?.deletedCount + cleared5?.deletedCount) || 0} records, added ${(added1?.insertedCount + added2?.insertedCount + added3?.insertedCount + added4?.insertedCount + added5?.insertedCount) || 0} records</h1>`,
			debug: debug
		}
	} catch (e) {
		e.debug = debug
		return e
	}
}

exports.search_utente = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	try {
		//debug.push(`Trying to connect to MongoDB with user: '${credentials.user}' and site: '${credentials.site}' and a ${credentials.pwd.length}-character long password...`)
		const mongo = new MongoClient(mongouri);
		await mongo.connect();
		//debug.push("... managed to connect to MongoDB.")

		let result = []
		if (q.username === undefined) { //non passo argomenti nel get, ritorno tutta la tabella
			//debug.push("no args found")
			await mongo.db(dbname)
				.collection("utente")
				.find()
				.forEach((r) => {
					result.push(r)
				});
		}
		else { //passo userid nel get, ritorno il record corretto
			//debug.push("found args")
			await mongo.db(dbname)
				.collection("utente")
				.find({ username: q.username })
				.forEach((r) => {
					result.push(r)
				});
		}
		//debug.push(`... managed to query MongoDB. Found ${result.length} results.`)

		//data.result = result
		await mongo.close();
		//debug.push("Managed to close connection to MongoDB.")

		//data.debug = debug
		return result
	} catch (e) {
		//data.debug = debug
		//data.error = e
		return e
	}
}

exports.search_notifica = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	try {
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		let result = []
		await mongo.db(dbname)
			.collection("notifica")
			.find()
			.project({ _id: 0 })
			.forEach((r) => {
				result.push(r)
			});

		return result
	} catch (e) {
		return e
	}
}

exports.search_chat = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	try {
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		let result = []
		await mongo.db(dbname)
			.collection("chat")
			.find()
			.project({ _id: 0 })
			.forEach((r) => {
				result.push(r)
			});

		return result
	} catch (e) {
		return e
	}
}

exports.search_messaggio = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	let debug = []
	let data = { query: q.messaggio_id, result: null }
	try {
		debug.push(`Trying to connect to MongoDB with user: '${credentials.user}' and site: '${credentials.site}' and a ${credentials.pwd.length}-character long password...`)
		const mongo = new MongoClient(mongouri);
		await mongo.connect();
		debug.push("... managed to connect to MongoDB.")

		let result = []
		console.log("replies = "+q.replies)
		console.log(typeof q.replies)
		if (q.replies !== "false") {
			debug.push("with replies")
			await mongo.db(dbname)
				.collection("messaggio")
				.find()
				.project({ _id: 0 })
				.forEach((r) => {
					result.push(r)
				});
		}
		else {
			await mongo.db(dbname)
				.collection("messaggio")
				.find({ risponde_a: null} )
				.project({ _id: 0 })
				.forEach((r) => {
					result.push(r)
				});
		}
		debug.push(`... managed to query MongoDB. Found ${result.length} results.`)

		data.result = result
		await mongo.close();
		debug.push("Managed to close connection to MongoDB.")

		data.debug = debug
		return result
	} catch (e) {
		data.debug = debug
		data.error = e
		return data
	}
}

exports.search_canale = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	let debug = []
	let data = { query: q.nome, result: null }
	try {
		debug.push(`Trying to connect to MongoDB with user: '${credentials.user}' and site: '${credentials.site}' and a ${credentials.pwd.length}-character long password...`)
		const mongo = new MongoClient(mongouri);
		await mongo.connect();
		debug.push("... managed to connect to MongoDB.")

		let result = []
		if (q.nome === undefined) { //non passo argomenti nel get, ritorno tutta la tabella
			debug.push("no args found")
			await mongo.db(dbname)
				.collection("canale")
				.find()
				.forEach((r) => {
					result.push(r)
				});
		}
		else { //passo nome nel get, ritorno il record corretto
			debug.push("found args")
			await mongo.db(dbname)
				.collection("canale")
				.find({ nome: q.nome })
				.forEach((r) => {
					result.push(r)
				});
		}
		debug.push(`... managed to query MongoDB. Found ${result.length} results.`)

		data.result = result
		await mongo.close();
		debug.push("Managed to close connection to MongoDB.")

		data.debug = debug
		return data
	} catch (e) {
		data.debug = debug
		data.error = e
		return data
	}
}

/* ========================== */
/*                            */
/*          RISORSE           */
/*                            */
/* ========================== */

// ========================== USER

// user disable
exports.user_abilitato = async function (q, user_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		result = await mongo.db(dbname)
			.collection("utente")
			.updateOne(
				{username: user_id},
				{ $set: {
						abilitato_flag: (q.set_to === "true" ? true : false)
					}
				}
			)

		await mongo.close();

		if (result.matchedCount == 1) {
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "username non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// user info
exports.user_info = async function (user_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname)
			.collection("utente")
			.find({ username: user_id })
			.project({ img: 1, username: 1, nome: 1, popolarita: 1, acquisti: 1, quota: 1, abilitato_flag: 1, canali_seguiti: 1, utenti_seguiti: 1})
			.forEach((r) => {
				result.push(r)
			});

		await mongo.close();

		if (result.length == 1) {
			response["data"] = result[0]
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "username non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// registra nuovo utente
exports.user_register = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		//controllo l'esistenza dello username
		await mongo.db(dbname)
			.collection("utente")
			.find({ username: q.username })
			.forEach((r) => {
				result.push(r)
			});
		if (result.length > 0) {
			response["risultato"] = "username esistente"
			await mongo.close();
			return response
		}

		//controllo l'esistenza della mail
		await mongo.db(dbname)
			.collection("utente")
			.find({ email: q.email })
			.forEach((r) => {
				result.push(r)
			});
		if (result.length > 0) {
			response["risultato"] = "email esistente"
			await mongo.close();
			return response
		}

		//Cripta la psw
		let psw = CryptoJS.SHA3(q.password);

		await mongo.db(dbname)
			.collection("utente")
			.insertOne(
				{
					img: "default_propic.png",
					nome: q.nome + " " + q.cognome,
					username: q.username,
					email: q.email,
					password: "" + psw,
					quota: {
						"g": 300, "s": 2000, "m": 7500
					},
					acquisti: [],
					popolarita: {},
					canali_seguiti: [],
					utenti_seguiti: [],
					redazione_flag: false,
					verificato_flag: false,
					professional_flag: false,
					abilitato_flag: true,
					manager_of: [],
					managed_by: null
				}
			)

		await mongo.close();

		response["risultato"] == "successo"
		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// cancella utente
exports.user_delete = async function (user_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		result = await mongo.db(dbname)
			.collection("utente")
			.deleteOne({ username: user_id })

		if (result.deletedCount == 1) {
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "username non trovato"
		}

		await mongo.close();
		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// modifica impostazioni utente.
exports.user_update = async function (user_id, q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null };

	try {
		const mongo = new MongoClient(mongouri);
		await mongo.connect();
		let updateResult

		if (q.tipo === "profilo") {
			if (q.path) { //aggiorno anche immagine profilo
				updateResult = await mongo.db(dbname)
					.collection("utente")
					.updateOne(
						{ username: user_id },
						{ $set: { img: q.path, nome: q.nome, bio: q.bio } }
					)
			} else {
				updateResult = await mongo.db(dbname)
					.collection("utente")
					.updateOne(
						{ username: user_id },
						{ $set: { nome: q.nome, bio: q.bio } }
					)
			}

			if (updateResult.matchedCount === 1) {
				response["risultato"] = "successo";
			} else {
				response["risultato"] = "username non trovato";
				console.error(`Nessun documento trovato per l'username ${user_id}`);
			}

		} else if (q.tipo === "account") {
			let old_pwd = CryptoJS.SHA3(q.old_password)
			let new_pwd = q.password
			let found = false

			if (new_pwd == "") {
				new_pwd = old_pwd;
			} else {
				new_pwd = CryptoJS.SHA3(q.password)
			}

			updateResult = await mongo.db(dbname) //controllo se la vecchia pwd corrisponde
				.collection("utente")
				.find({ username: user_id })
				.forEach((el) => {
					if ((el.password + "") === ("" + old_pwd)) {
						found = true
					}
				})
			if (found) { //modifico mail/pwd
				updateResult = await mongo.db(dbname)
					.collection("utente")
					.updateOne(
						{ username: user_id },
						{ $set: { email: q.email, password: "" + new_pwd } }
					)
			}

			if (found) {
				response["risultato"] = "successo";
			} else {
				response["risultato"] = "password non corretta";
				console.error(`Password non corretta`);
			}
		}




		await mongo.close();
		return response;
	} catch (error) {
		console.error("Errore durante l'aggiornamento dell'utente:", error);
		response["errore"] = error.toString();
		return response;
	}
}

// get chat
exports.get_chat = async function (target, q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		let origin = q.current_user

		let id = get_chat_id(origin, target)
		console.log(origin)
		console.log(target)
		console.log(id)

		await mongo.db(dbname)
			.collection("chat")
			.find(
				{ chat_id: id }
			)
			.forEach((r) => {
				result.push(r)
			});

		if (result.length == 1) {
			response["risultato"] = "successo"
			//console.log("successo")
		} else {
			response["risultato"] = "chat non trovata"
			//console.log("errati")
		}

		response["data"] = result[0]
		await mongo.close();
		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// post chat
exports.post_chat = async function (target, q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		let origin = q.current_user
		let id = get_chat_id(origin, target)
		let val = q.text
		let date = new Date()
		let timestamp = date.getTime();

		console.log(origin)
		console.log(target)
		console.log(id)

		result = await mongo.db(dbname)
			.collection("chat")
			.updateOne(
				{ chat_id: id },
				{
					$push: {
						messaggi: {
							text: val,
							timestamp: timestamp,
							user: origin
						}
					}
				}
			)

		if (result.matchedCount == 1) {
			response["risultato"] = "successo"
			//console.log("successo")
		} else { //creo la chat
			await mongo.db(dbname)
				.collection("chat")
				.insertOne(
					{
						"chat_id": id,
						"users": [origin, target],
						"messaggi": [
							{
								"text": val,
								"user": origin,
								"timestamp": timestamp
							}
						]
					}
				)
			response["risultato"] = "successo"
		}

		// notifica chat
		add_notifica(target, "privato", id, credentials, null, origin)

		response["data"] = result[0]
		await mongo.close();
		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}


// login
exports.user_login = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		//Cripta la psw
		let psw = CryptoJS.SHA3(q.password);
		//debug.push(`found args ${q.username} e ${q.password}`)

		await mongo.db(dbname)
			.collection("utente")
			.find({
				$and:
					[
						{ username: q.username },
						{ password: "" + psw }
					]
			}, {
				password: 0
			}
			)
			.forEach((r) => {
				result.push(r)
			});

		if (result.length == 1) {
			response["risultato"] = "successo"
			//console.log("successo")
		} else {
			response["risultato"] = "username/password errati"
			//console.log("errati")
		}

		response["data"] = result[0]
		await mongo.close();
		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// get quota
exports.user_get_quota = async function (user_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname)
			.collection("utente")
			.find({ username: user_id })
			.project({ quota: 1 })
			.forEach((r) => {
				result.push(r)
			});

		await mongo.close();

		if (result.length == 1) {
			response["data"] = result[0]
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "username non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// aggiorna quota
async function user_update_quota(user_id, q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		if (q.acquisto == true) { // caso acquisto quota
			let date = new Date()

			let acquisto = {}
			acquisto["timestamp"] = date.getTime();
			acquisto["quantita"] = parseInt(q.qnt)

			result = await mongo.db(dbname)
				.collection("utente")
				.updateOne(
					{ username: user_id },
					{
						$inc: { 'quota.g': parseInt(q.qnt) },
						$push: { acquisti: acquisto }
					}
				)
		} else if (q.mod){
			result = await mongo.db(dbname)
				.collection("utente")
				.updateOne(
					{ username: user_id },
					{
						$set: {
							"quota.g": q.q_g,
							"quota.s": q.q_s,
							"quota.m": q.q_m
						}
					}
				)
		} else {
			result = await mongo.db(dbname)
				.collection("utente")
				.updateOne(
					{ username: user_id },
					{
						$inc: { 'quota.g': parseInt(q.qnt) },
					}
				)
		} 

		await mongo.close();

		if (result.matchedCount == 1) {
			//response["data"] = result[0]
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "username non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}
exports.user_update_quota = user_update_quota

// toggle follow
exports.user_toggle_follow = async function (user_id, q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = null
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		if (q.tipo == "utente") {
			await mongo.db(dbname)
				.collection("utente")
				.aggregate([
					{
						$match: {
							username: user_id,
						}
					},
					{
						$project: {
							result: {
								$cond: {
									if: { $in: [q.target, "$utenti_seguiti"] }, // controlla se l'utente e' follower
									then: "pull",
									else: "push"
								}
							}
						}
					}
				])
				.toArray()
				.then(async (results) => {
					const pull_list = results.filter((doc) => doc.result === "pull");
					for (const doc of pull_list) { //se e' gia' follower lo rimuovo
						try {
							await mongo.db(dbname)
								.collection("utente")
								.updateOne(
									{ username: user_id },
									{ $pull: { utenti_seguiti: q.target } }
								);
						} catch (error) {
							console.error("Error:", error);
						}
						result = "removed"
					}

					const push_list = results.filter((doc) => doc.result === "push");
					for (const doc of push_list) { //altrimento lo aggiungo
						try {
							await mongo.db(dbname)
								.collection("utente")
								.updateOne(
									{ username: user_id },
									{ $push: { utenti_seguiti: q.target } }
								);
						} catch (error) {
							console.error("Error:", error);
						}
						result = "added"
						//invio notifica di follow
						add_notifica(q.target, "follow", user_id, credentials, null, null)
					}
				})
				.catch((error) => {
					console.error("Error:", error);
				});

		} else if (q.tipo == "canale") {
			await mongo.db(dbname)
				.collection("utente")
				.aggregate([
					{
						$match: {
							username: user_id,
						}
					},
					{
						$project: {
							result: {
								$cond: {
									if: { $in: [{ $literal: q.target }, "$canali_seguiti"] }, // controlla se l'utente e' follower
									then: "pull",
									else: "push"
								}
							}
						}
					}
				])
				.toArray()
				.then(async (results) => {
					const pull_list = results.filter((doc) => doc.result === "pull");
					for (const doc of pull_list) { //se e' gia' follower lo rimuovo
						//console.log("pulling "+q.target)
						try {
							await mongo.db(dbname)
								.collection("utente")
								.updateOne(
									{ username: user_id },
									{ $pull: { canali_seguiti: q.target } }
								);
						} catch (error) {
							console.error("Error:", error);
						}
						result = "removed"
					}

					const push_list = results.filter((doc) => doc.result === "push");
					for (const doc of push_list) { //altrimento lo aggiungo
						//console.log("pushing "+q.target)
						try {
							await mongo.db(dbname)
								.collection("utente")
								.updateOne(
									{ username: user_id },
									{ $push: { canali_seguiti: q.target } }
								);
						} catch (error) {
							console.error("Error:", error);
						}
						result = "added"
					}
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		}

		await mongo.close();

		if (result !== null) {
			response["risultato"] = result
		} else {
			response["risultato"] = "username/canale non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// get user feed
exports.user_feed = async function (user_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		let canali_seguiti = []
		let utenti_seguiti = []
		await mongo.db(dbname)
			.collection("utente")
			.find({ username: user_id })
			.project({ canali_seguiti: 1, utenti_seguiti: 1 })
			.forEach((r) => {
				canali_seguiti.push(r["canali_seguiti"])
				utenti_seguiti.push(r["utenti_seguiti"])
			});
		canali_seguiti = canali_seguiti[0] //da fixare
		utenti_seguiti = utenti_seguiti[0]


		/*console.log("ottenuti canali seguiti da "+user_id)
		canali_seguiti.forEach((element) => console.log(element))
		console.log("ottenuti utenti seguiti da "+user_id)
		utenti_seguiti.forEach((element) => console.log(element))*/

		//canali_seguiti.push("@"+user_id) //l'utente non vede i propri post
		//console.log("aggiunto utente")

		//debug

		await mongo.db(dbname) // feed da canali
			.collection("messaggio")
			.aggregate([
				{
					$match: {
						$or: [
							{ destinatari: { $in: canali_seguiti } },
						]
					}
				},
				{
					$lookup: {
						from: "utente", // nome seconda tabella
						localField: "utente", // nome chiave in prima tabella (corrente)
						foreignField: "username", // nome chiave in seconda tabella
						as: "utenteData" // rename del record ottenuto (da seconda tabella)
					}
				},
				{
					$unwind: "$utenteData" // Unwind the joined data (if necessary)
				},
				{
					"$replaceRoot": { //ricrea la "root" della struttura ottenuta
						"newRoot": {
							"$mergeObjects": [ //unisce i campi di messaggio al singolo campo utente.nome
								"$$ROOT", //campi originali in messaggio
								{ nome: "$utenteData.nome" },
								{ img: "$utenteData.img" }
							]
						}
					}
				},
				{
					$project: { //rimuove la struttura contenente tutti i campi di utente (serve solo nome)
						utenteData: 0
					}
				},
				{
					$lookup: {
						from: "messaggio",
						localField: "post_id",
						foreignField: "risponde_a",
						as: "risposte"
					}
				},
				{
					$addFields: {
						numRisposte: { $size: "$risposte" }
					}
				},
				{
					$project: {
						risposte: 0
					}
				},
				{
					$sort: {
						timestamp: -1 // Sort by timestamp in descending order
					}
				},
				{
					$limit: 100 // Limit the result to 100 records
				}
			])
			.forEach((r) => {
				result.push(r)
			});

		/*console.log("post in canali seguiti:")
		result.forEach((element) => console.log(element))
		console.log("cerco post bacheca utenti seguiti")*/

		await mongo.db(dbname) // feed da utenti
			.collection("messaggio")
			.aggregate([
				{
					$match: {
						$or: [
							{ utente: { $in: utenti_seguiti } },
						],
						tipo_destinatari: null,
						risponde_a: null
					}
				},
				{
					$lookup: {
						from: "utente", // nome seconda tabella
						localField: "utente", // nome chiave in prima tabella (corrente)
						foreignField: "username", // nome chiave in seconda tabella
						as: "utenteData" // rename del record ottenuto (da seconda tabella)
					}
				},
				{
					$unwind: "$utenteData" // Unwind the joined data (if necessary)
				},
				{
					"$replaceRoot": { //ricrea la "root" della struttura ottenuta
						"newRoot": {
							"$mergeObjects": [ //unisce i campi di messaggio al singolo campo utente.nome
								"$$ROOT", //campi originali in messaggio
								{ nome: "$utenteData.nome" },
								{ img: "$utenteData.img" }
							]
						}
					}
				},
				{
					$project: { //rimuove la struttura contenente tutti i campi di utente (serve solo nome)
						utenteData: 0
					}
				},
				{
					$lookup: {
						from: "messaggio",
						localField: "post_id",
						foreignField: "risponde_a",
						as: "risposte"
					}
				},
				{
					$addFields: {
						numRisposte: { $size: "$risposte" }
					}
				},
				{
					$project: {
						risposte: 0
					}
				},
				{
					$sort: {
						timestamp: -1 // Sort by timestamp in descending order
					}
				},
				{
					$limit: 100 // Limit the result to 100 records
				}
			])
			.forEach((r) => {
				result.push(r)
			});

		// debug
		/*console.log("post in bacheca di utenti seguiti")
		result.forEach((element) => console.log(element))*/

		let canali_ufficiali = [] // ottengo la lista di canali ufficiali
		await mongo.db(dbname)
			.collection("canale")
			.find({ ufficiale: true })
			.forEach((el) => {
				canali_ufficiali.push(el.nome)
			})

		await mongo.db(dbname) // feed da canali ufficiali
			.collection("messaggio")
			.aggregate([
				{
					$match: {
						destinatari: { $in: canali_ufficiali },
					}
				},
				{
					$lookup: {
						from: "utente", // nome seconda tabella
						localField: "utente", // nome chiave in prima tabella (corrente)
						foreignField: "username", // nome chiave in seconda tabella
						as: "utenteData" // rename del record ottenuto (da seconda tabella)
					}
				},
				{
					$unwind: "$utenteData" // Unwind the joined data (if necessary)
				},
				{
					"$replaceRoot": { //ricrea la "root" della struttura ottenuta
						"newRoot": {
							"$mergeObjects": [ //unisce i campi di messaggio al singolo campo utente.nome
								"$$ROOT", //campi originali in messaggio
								{ nome: "$utenteData.nome" },
								{ img: "$utenteData.img" }
							]
						}
					}
				},
				{
					$project: { //rimuove la struttura contenente tutti i campi di utente (serve solo nome)
						utenteData: 0
					}
				},
				{
					$lookup: {
						from: "messaggio",
						localField: "post_id",
						foreignField: "risponde_a",
						as: "risposte"
					}
				},
				{
					$addFields: {
						numRisposte: { $size: "$risposte" }
					}
				},
				{
					$project: {
						risposte: 0
					}
				},
				{
					$sort: {
						timestamp: -1 // Sort by timestamp in descending order
					}
				},
				{
					$limit: 100 // Limit the result to 100 records
				}
			])
			.forEach((r) => {
				if (!(result.some(e => e.post_id == r.post_id))) { //aggiungo post da canali ufficiali evitando duplicati
					r["suggerito"] = true
					result.push(r)
				}
			});

		// aumento le visual dei post ottenuti
		var id_arr = []
		result.forEach((el) => id_arr.push(el.post_id))
		await mongo.db(dbname)
			.collection("messaggio")
			.updateMany(
				{ post_id: { $in: id_arr } },
				{ $inc: { visualizzazioni: 1 } }
			)

		await mongo.close();

		response["data"] = result
		response["risultato"] = "successo"

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// get smm dell'utente
exports.user_get_managed_by = async function (user_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname)
			.collection("utente")
			.find({ username: user_id })
			.project({ managed_by: 1 })
			.forEach((r) => {
				result.push(r)
			});

		await mongo.close();

		if (result.length == 1) {
			response["data"] = result[0]["managed_by"]
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "username non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// aggiorna smm dell'utente
exports.user_set_managed_by = async function (user_id, q, credentials) {
	//q.current_smm: vecchio smm | "null"
	//q.new_smm: nuovo smm | "null"
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		//modifico il vecchio smm (se esiste)
		if (q.current_smm !== "null") {
			result = await mongo.db(dbname)
				.collection("utente")
				.updateOne(
					{ username: q.current_smm },
					{ $pull: { manager_of: user_id } }
				)

			//console.log("rimosso vecchio (pull)")

			await mongo.db(dbname)
				.collection("utente")
				.updateOne(
					{ username: user_id },
					{ $set: { managed_by: null } }
				)

			//console.log("rimosso vecchio (set null)")
		}

		//aggiungo il nuovo smm (se esiste)
		if (q.new_smm !== "null") {
			result = await mongo.db(dbname)
				.collection("utente")
				.updateOne(
					{ username: user_id },
					{ $set: { managed_by: q.new_smm } }
				)

			//console.log("aggiunto nuovo (set)")

			await mongo.db(dbname)
				.collection("utente")
				.updateOne(
					{ username: q.new_smm },
					{ $push: { manager_of: user_id } }
				)

			//console.log("aggiunto nuovo (push)")
		}

		await mongo.close();
		if (result.matchedCount == 1) {
			response["data"] = result[0]
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "username non trovato"
		}

		return response
	} catch (e) {
		console.log(e)
	}
}

// get account gestiti dall'utente
exports.user_manager_of = async function (user_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname)
			.collection("utente")
			.find({ username: user_id })
			.project({ manager_of: 1 })
			.forEach((r) => {
				result.push(r)
			});

		await mongo.close();

		if (result.length == 1) {
			response["data"] = result[0]["manager_of"]
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "username non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// get canali gestiti dall'utente, insieme al ruolo
exports.user_my_channels = async function (user_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname)
			.collection("canale")
			.find({ proprieta: user_id })
			.forEach((r) => {
				result.push({ "canale": r.nome, "ruolo": "proprietario" })
			});

		await mongo.db(dbname)
			.collection("canale")
			.find(
				{ mod: { $elemMatch: { $eq: user_id } } }
			)
			.forEach((r) => {
				result.push({ "canale": r.nome, "ruolo": "mod" })
			});

		await mongo.close();

		response["data"] = result
		response["risultato"] = "successo"

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// ========================== SQUEAL

// get squeal by id
exports.get_squeal = async function (squeal_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname) // TODO nome ai post, regole di visibilita', ordine
			.collection("messaggio")
			.aggregate([
				{ $match: { post_id: squeal_id } },
				{
					$lookup: {
						from: "utente", // nome seconda tabella
						localField: "utente", // nome chiave in prima tabella (corrente)
						foreignField: "username", // nome chiave in seconda tabella
						as: "utenteData" // rename del record ottenuto (da seconda tabella)
					}
				},
				{ $unwind: "$utenteData" },// Unwind the joined data (if necessary)
				{
					"$replaceRoot": { //ricrea la "root" della struttura ottenuta
						"newRoot": {
							"$mergeObjects": [ //unisce i campi di messaggio al singolo campo utente.nome
								"$$ROOT", //campi originali in messaggio
								{ nome: "$utenteData.nome" },
								{ img: "$utenteData.img" }
							]
						}
					}
				},
				{ $project: { utenteData: 0 } }, //rimuove la struttura contenente tutti i campi di utente (serve solo nome)
				{
					$lookup: {
						from: "messaggio",
						localField: "post_id",
						foreignField: "risponde_a",
						as: "risposte"
					}
				},
				{ $addFields: { numRisposte: { $size: "$risposte" } } },
				{ $project: { risposte: 0 } }
			])
			.forEach((r) => {
				result.push(r)
			});

		await mongo.close();

		if (result.length == 1) {
			response["data"] = result[0]
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "squeal non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// add post
exports.add_squeal = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		//controlli su campi situazionali
		let risposta
		try {
			risposta = q.post_id
		} catch (e) {
			risposta = null
		}

		let tipo_destinatari
		try {
			tipo_destinatari = q.tipo_destinatari
		} catch (e) {
			tipo_destinatari = null
		}

		let newDocumentId
		let quota_usata

		//console.log(q.tipo)
		if (q.contenuto == "testo") {//caso testo
			quota_usata = q.textarea.length
			await mongo.db(dbname)
				.collection("messaggio")
				.insertOne(
					{
						risponde_a: risposta,
						corpo: q.textarea,
						contenuto: "testo",
						destinatari: q.destinatari,
						tipo_destinatari: tipo_destinatari,
						utente: q.user_id,
						timestamp: q.timestamp,
						visualizzazioni: 0,
						reazioni: {
							positive: {
								concordo: [],
								mi_piace: [],
								adoro: []
							},
							negative: {
								sono_contrario: [],
								mi_disgusta: [],
								odio: []
							}
						},
						categoria: null,
						automatico: false
					}
				)
				.then(async (result) => {
					newDocumentId = result.insertedId;
					await mongo.db(dbname)
						.collection("messaggio")
						.updateOne(
							{ _id: newDocumentId },
							{ $set: { post_id: String(newDocumentId) } }
						);
				})
				.catch((error) => {
					console.error("Error:", error);
				});

			// notifica di menzione
			const regex = /@([^[\s.,:;!?]+)/g

			const matches = [...q.textarea.matchAll(regex)];

			if (matches.length > 0) {
				for (const match of matches) {
					//console.log(match[1])
					let found = false
					await mongo.db(dbname)
						.collection("utente")
						.find({ username: match[1] })
						.forEach((el) => {
							found = true
						})
					if (found) { //la menzione e' un utente esistente
						add_notifica(match[1], "menzione", String(newDocumentId), credentials, null, q.user_id)
					}
				}
			}
		} else if (q.contenuto == "img") {//caso immagine
			quota_usata = 120
			await mongo.db(dbname)
				.collection("messaggio")
				.insertOne(
					{
						risponde_a: risposta,
						corpo: q.path,
						contenuto: "img",
						destinatari: q.destinatari,
						tipo_destinatari: tipo_destinatari,
						utente: q.user_id,
						timestamp: q.timestamp,
						visualizzazioni: 0,
						reazioni: {
							positive: {
								concordo: [],
								mi_piace: [],
								adoro: []
							},
							negative: {
								sono_contrario: [],
								mi_disgusta: [],
								odio: []
							}
						},
						categoria: null,
						automatico: false
					}
				)
				.then(async (result) => {
					newDocumentId = result.insertedId;
					await mongo.db(dbname)
						.collection("messaggio")
						.updateOne(
							{ _id: newDocumentId },
							{ $set: { post_id: String(newDocumentId) } }
						);
				})
				.catch((error) => {
					console.error("Error:", error);
				});

		} else if (q.contenuto == "map") {//caso mappa
			quota_usata = 120
			await mongo.db(dbname)
				.collection("messaggio")
				.insertOne(
					{
						risponde_a: risposta,
						corpo: q.textarea,
						contenuto: "map",
						destinatari: q.destinatari,
						tipo_destinatari: tipo_destinatari,
						utente: q.user_id,
						timestamp: q.timestamp,
						visualizzazioni: 0,
						reazioni: {
							positive: {
								concordo: [],
								mi_piace: [],
								adoro: []
							},
							negative: {
								sono_contrario: [],
								mi_disgusta: [],
								odio: []
							}
						},
						categoria: null,
						automatico: false
					}
				)
				.then(async (result) => {
					newDocumentId = result.insertedId;
					await mongo.db(dbname)
						.collection("messaggio")
						.updateOne(
							{ _id: newDocumentId },
							{ $set: { post_id: String(newDocumentId) } }
						);
				})
				.catch((error) => {
					console.error("Error:", error);
				});

		}

		// notifica commento all'autore del post
		if (!(risposta == null)) {
			let autore_originale
			await mongo.db(dbname)
				.collection("messaggio")
				.find({ post_id: risposta })
				.project({ utente: 1 })
				.forEach((el) => {
					autore_originale = el.utente
				})
			add_notifica(autore_originale, "risposta", String(newDocumentId), credentials, null, q.user_id)
		}

		//aggiorno la quota
		await mongo.db(dbname)
			.collection("utente")
			.updateOne(
				{ username: q.user_id },
				{ $inc: { "quota.g": (-quota_usata) } }
			);

		await mongo.close();

		response["data"] = String(newDocumentId)
		response["risultato"] = "successo"

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// cancella squeal
exports.delete_squeal = async function (squeal_id, allowed_users, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = true
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		result = await mongo.db(dbname)
			.collection("messaggio")
			.find({ post_id: squeal_id })
			.forEach((el) => {
				if (allowed_users.indexOf(el.utente) == -1) {
					result = false
				}
			})

		if (result) { // se l'utente ha permessi sul post
			result = await mongo.db(dbname)
				.collection("messaggio")
				.deleteOne({ post_id: squeal_id })

			if (result.deletedCount == 1) {
				response["risultato"] = "successo"
			} else {
				response["risultato"] = "squeal non trovato"
			}
		} else {
			response["risultato"] = "errore di permessi"
		}

		await mongo.close();
		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// get squeal replies
exports.get_squeal_replies = async function (squeal_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname)
			.collection("messaggio")
			.aggregate([
				{
					$match: {
						risponde_a: squeal_id
					}
				},
				{
					$lookup: {
						from: "utente", // nome seconda tabella
						localField: "utente", // nome chiave in prima tabella (corrente)
						foreignField: "username", // nome chiave in seconda tabella
						as: "utenteData" // rename del record ottenuto (da seconda tabella)
					}
				},
				{
					$unwind: "$utenteData" // Unwind the joined data (if necessary)
				},
				{
					"$replaceRoot": { //ricrea la "root" della struttura ottenuta
						"newRoot": {
							"$mergeObjects": [ //unisce i campi di messaggio al singolo campo utente.nome
								"$$ROOT", //campi originali in messaggio
								{ nome: "$utenteData.nome" },
								{ img: "$utenteData.img" }
							]
						}
					}
				},
				{
					$project: { //rimuove la struttura contenente tutti i campi di utente (serve solo nome)
						utenteData: 0
					}
				}
			])
			.sort({ timestamp: -1 }) // Sort by timestamp in descending order
			.limit(100)
			.forEach((r) => {
				result.push(r)
			});

		response["risultato"] = "successo"
		response["data"] = result
		await mongo.close();
		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// modifica reaction
exports.set_reaction = async function (squeal_id, q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = {}
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname)
			.collection("messaggio")
			.find({ post_id: squeal_id })
			.forEach((r) => {
				result = r
			});

		if (result == {}) {
			response["risultato"] = "squeal non trovato"
			await mongo.close()
			return response
		}

		if (q.reac == "adoro") {
			if (result.reazioni.positive.adoro.includes(q.userid)) {
				const indice = result.reazioni.positive.adoro.indexOf(q.userid);
				result.reazioni.positive.adoro.splice(indice, 1);
			} else {
				result.reazioni.positive.adoro.push(q.userid)
			}
		} else {
			if (result.reazioni.positive.adoro.includes(q.userid)) {
				const indice = result.reazioni.positive.adoro.indexOf(q.userid);
				result.reazioni.positive.adoro.splice(indice, 1);
			}
		}

		if (q.reac == "mi_disgusta") {
			if (result.reazioni.negative.mi_disgusta.includes(q.userid)) {
				const indice = result.reazioni.negative.mi_disgusta.indexOf(q.userid);
				result.reazioni.negative.mi_disgusta.splice(indice, 1);
			} else {
				result.reazioni.negative.mi_disgusta.push(q.userid)
			}
		} else {
			if (result.reazioni.negative.mi_disgusta.includes(q.userid)) {
				const indice = result.reazioni.negative.mi_disgusta.indexOf(q.userid);
				result.reazioni.negative.mi_disgusta.splice(indice, 1);
			}
		}

		if (q.reac == "mi_piace") {
			if (result.reazioni.positive.mi_piace.includes(q.userid)) {
				const indice = result.reazioni.positive.mi_piace.indexOf(q.userid);
				result.reazioni.positive.mi_piace.splice(indice, 1);
			} else {
				result.reazioni.positive.mi_piace.push(q.userid)
			}
		} else {
			if (result.reazioni.positive.mi_piace.includes(q.userid)) {
				const indice = result.reazioni.positive.mi_piace.indexOf(q.userid);
				result.reazioni.positive.mi_piace.splice(indice, 1);
			}
		}

		if (q.reac == "odio") {
			if (result.reazioni.negative.odio.includes(q.userid)) {
				const indice = result.reazioni.negative.odio.indexOf(q.userid);
				result.reazioni.negative.odio.splice(indice, 1);
			} else {
				result.reazioni.negative.odio.push(q.userid)
			}
		} else {
			if (result.reazioni.negative.odio.includes(q.userid)) {
				const indice = result.reazioni.negative.odio.indexOf(q.userid);
				result.reazioni.negative.odio.splice(indice, 1);
			}
		}

		if (q.reac == "concordo") {
			if (result.reazioni.positive.concordo.includes(q.userid)) {
				const indice = result.reazioni.positive.concordo.indexOf(q.userid);
				result.reazioni.positive.concordo.splice(indice, 1);
			} else {
				result.reazioni.positive.concordo.push(q.userid)
			}
		} else {
			if (result.reazioni.positive.concordo.includes(q.userid)) {
				const indice = result.reazioni.positive.concordo.indexOf(q.userid);
				result.reazioni.positive.concordo.splice(indice, 1);
			}
		}

		if (q.reac == "sono_contrario") {
			if (result.reazioni.negative.sono_contrario.includes(q.userid)) {
				const indice = result.reazioni.negative.sono_contrario.indexOf(q.userid);
				result.reazioni.negative.sono_contrario.splice(indice, 1);
			} else {
				result.reazioni.negative.sono_contrario.push(q.userid)
			}
		} else {
			if (result.reazioni.negative.sono_contrario.includes(q.userid)) {
				const indice = result.reazioni.negative.sono_contrario.indexOf(q.userid);
				result.reazioni.negative.sono_contrario.splice(indice, 1);
			}
		}

		await mongo.db(dbname)
			.collection("messaggio")
			.updateOne(
				{ post_id: squeal_id },
				{
					$set:
					{
						reazioni: result.reazioni
					}
				}
			)

		await mongo.close();

		response["risultato"] = "successo"

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// ricerca per utente
exports.search_by_user = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }
	let meta = {} //metadati risposta: tipo ricerca, info user/canale
	let post = [] //lista post
	try {
		meta["tipo"] = "utente"
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname)
			.collection("messaggio")
			.aggregate([
				{
					$match:
					{
						utente: q.query,
						risponde_a: null,
						$or: [
							{ tipo_destinatari: "canali" }, //post in canali
							{ tipo_destinatari: null }, //post in bacheca
							{ destinatari: { $in: [q.target] } }, //messaggi privati di cui sei destinatario
							//{ utente: q.target } //messaggi privati mittente
						]
					}
				},
				{
					$lookup: {
						from: "utente", // nome seconda tabella
						localField: "utente", // nome chiave in prima tabella (corrente)
						foreignField: "username", // nome chiave in seconda tabella
						as: "utenteData" // rename del record ottenuto (da seconda tabella)
					}
				},
				{ $unwind: "$utenteData" },// Unwind the joined data (if necessary)
				{
					"$replaceRoot": { //ricrea la "root" della struttura ottenuta
						"newRoot": {
							"$mergeObjects": [ //unisce i campi di messaggio al singolo campo utente.nome
								"$$ROOT", //campi originali in messaggio
								{ nome: "$utenteData.nome" },
								{ img: "$utenteData.img" }
							]
						}
					}
				},
				{ $project: { utenteData: 0 } }, //rimuove la struttura contenente tutti i campi di utente (serve solo nome)
				{
					$lookup: {
						from: "messaggio",
						localField: "post_id",
						foreignField: "risponde_a",
						as: "risposte"
					}
				},
				{ $addFields: { numRisposte: { $size: "$risposte" } } },
				{ $project: { risposte: 0 } },
				{ $sort: { timestamp: -1 } },
				{ $limit: 100 }// Limit the result to 100 records
			])
			.forEach((r) => {
				post.push(r)
			});

		await mongo.db(dbname) // user info
			.collection("utente")
			.find({
				username: q.query
			})
			.project(
				{ username: 1, nome: 1, img: 1, bio: 1, email: 1 }
			)
			.forEach((r) => {
				meta["info"] = r
			});

		let numFollowers = 0
		await mongo.db(dbname) // #follower
			.collection("utente")
			.find(
				{
					utenti_seguiti: { $in: [q.query] }
				}
			)
			.forEach((r) => {
				numFollowers++;
			});
		meta["info"]["num_followers"] = numFollowers

		let isFollower = false
		await mongo.db(dbname) // check se utente segue gia' l'utente/canale
			.collection("utente")
			.find({
				username: q.target,
				utenti_seguiti: { $in: [q.query] }
			})
			.forEach((r) => {
				isFollower = true
			})
		meta["info"]["is_follower"] = isFollower

		await mongo.close();

		response["data"] = { "post": post, "meta": meta }
		response["risultato"] = "successo"

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// ricerca per canale
exports.search_by_channel = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }
	let meta = {} //metadati risposta: tipo ricerca, info user/canale
	let post = [] //lista post
	try {
		let found = false
		meta["tipo"] = "canale"
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname) // TODO regole di visibilita'
			.collection("messaggio")
			.aggregate([
				{
					$match: {
						destinatari: { $in: [q.query] }
					}
				},
				{
					$lookup: {
						from: "utente", // nome seconda tabella
						localField: "utente", // nome chiave in prima tabella (corrente)
						foreignField: "username", // nome chiave in seconda tabella
						as: "utenteData" // rename del record ottenuto (da seconda tabella)
					}
				},
				{
					$unwind: "$utenteData" // Unwind the joined data (if necessary)
				},
				{
					"$replaceRoot": { //ricrea la "root" della struttura ottenuta
						"newRoot": {
							"$mergeObjects": [ //unisce i campi di messaggio al singolo campo utente.nome
								"$$ROOT", //campi originali in messaggio
								{ nome: "$utenteData.nome" },
								{ img: "$utenteData.img" }
							]
						}
					}
				},
				{
					$project: { //rimuove la struttura contenente tutti i campi di utente (serve solo nome)
						utenteData: 0
					}
				},
				{
					$lookup: {
						from: "messaggio",
						localField: "post_id",
						foreignField: "risponde_a",
						as: "risposte"
					}
				},
				{
					$addFields: {
						numRisposte: { $size: "$risposte" }
					}
				},
				{
					$project: {
						risposte: 0
					}
				},
				{
					$sort: {
						timestamp: -1 // Sort by timestamp in descending order
					}
				},
				{
					$limit: 100 // Limit the result to 100 records
				}
			])
			.forEach((r) => {
				post.push(r)
				found = true
			});

		await mongo.db(dbname) // info canale
			.collection("canale")
			.find({
				nome: q.query
			})
			.project(
				{ img: 1, nome: 1, descrizione: 1 }
			)
			.forEach((r) => {
				meta["info"] = r
			});

		let numFollowers = 0
		await mongo.db(dbname) // #follower
			.collection("utente")
			.find(
				{
					canali_seguiti: { $in: [q.query] }
				}
			)
			.forEach((r) => {
				numFollowers++;
			});
		meta["info"]["num_followers"] = numFollowers

		let isFollower = false
		await mongo.db(dbname) // check se utente segue gia' l'utente/canale
			.collection("utente")
			.find({
				username: q.target,
				canali_seguiti: { $in: [q.query] }
			})
			.forEach((r) => {
				isFollower = true
			})
		meta["info"]["is_follower"] = isFollower

		await mongo.close();

		if (found) {
			response["data"] = { "post": post, "meta": meta }
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "canale non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// ricerca per keyword
exports.search_by_keyword = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }
	let meta = {} //metadati risposta: tipo ricerca, info user/canale
	let post = [] //lista post
	try {
		let found = false
		meta["tipo"] = "keyword"
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname) // TODO regole di visibilita'
			.collection("messaggio")
			.aggregate([
				{
					$match: {
						corpo: { $regex: q.query, $options: 'i' },
						risponde_a: null,
						$or: [
							{ tipo_destinatari: "canali" }, //post in canali
							{ tipo_destinatari: null }, //post in bacheca
							{ destinatari: { $in: [q.target] } } //messaggi privati
						]
					}
				},
				{
					$lookup: {
						from: "utente", // nome seconda tabella
						localField: "utente", // nome chiave in prima tabella (corrente)
						foreignField: "username", // nome chiave in seconda tabella
						as: "utenteData" // rename del record ottenuto (da seconda tabella)
					}
				},
				{
					$unwind: "$utenteData" // Unwind the joined data (if necessary)
				},
				{
					"$replaceRoot": { //ricrea la "root" della struttura ottenuta
						"newRoot": {
							"$mergeObjects": [ //unisce i campi di messaggio al singolo campo utente.nome
								"$$ROOT", //campi originali in messaggio
								{ nome: "$utenteData.nome" },
								{ img: "$utenteData.img" }
							]
						}
					}
				},
				{
					$project: { //rimuove la struttura contenente tutti i campi di utente (serve solo nome)
						utenteData: 0
					}
				},
				{
					$lookup: {
						from: "messaggio",
						localField: "post_id",
						foreignField: "risponde_a",
						as: "risposte"
					}
				},
				{
					$addFields: {
						numRisposte: { $size: "$risposte" }
					}
				},
				{
					$project: {
						risposte: 0
					}
				},
				{
					$sort: {
						timestamp: -1 // Sort by timestamp in descending order
					}
				},
				{
					$limit: 100 // Limit the result to 100 records
				}
			])
			.forEach((r) => {
				post.push(r)
				found = true
			});

		await mongo.close();

		if (found) {
			response["data"] = { "post": post, "meta": meta }
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "keyword non trovata"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// ========================== CHANNEL

// channel info
exports.channel_info = async function (channel_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname) // info canale
			.collection("canale")
			.find({
				nome: channel_id
			})
			.project(
				{ img: 1, nome: 1, descrizione: 1 }
			)
			.forEach((r) => {
				result.push(r)
			});

		await mongo.close();

		if (result.length == 1) {
			response["data"] = result[0]
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "canale non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// crea nuovo canale
exports.channel_create = async function (q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		//controllo l'esistenza della mail
		await mongo.db(dbname)
			.collection("canale")
			.find({ nome: q.nome })
			.forEach((r) => {
				result.push(r)
			});
		if (result.length > 0) {
			response["risultato"] = "canale esistente"
			await mongo.close();
			return response
		}

		await mongo.db(dbname)
			.collection("canale")
			.insertOne(
				{
					img: "default_channelpic.png",
					nome: q.nome,
					descrizione: "",
					ufficiale: false,
					proprieta: q.userid,
					mod: [],
					lettura: ["*"],
					scrittura: ["*"],
					abilitato: true
				}
			)

		await mongo.close();

		response["risultato"] = "successo"

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// modifica impostazioni canale
exports.channel_update = async function (channel_id, q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		//todo

		await mongo.close();

		if (result.length == 1) {
			response["data"] = result[0]
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "canale non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// cancella canale
exports.channel_delete = async function (channel_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		result = await mongo.db(dbname)
			.collection("canale")
			.deleteOne({ nome: channel_id })

		if (result.deletedCount == 1) {
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "canale non trovato"
		}

		await mongo.close();
		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// controlla se l'utente ha permessi sul canale
exports.channel_auth = async function (channel_id, q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = { "lettura": false, "scrittura": false }
		let found = false
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		//console.log(channel_id);
		//console.log(q);
		await mongo.db(dbname)
			.collection("canale")
			.find({
				nome: channel_id
			})
			.forEach((r) => {
				found = true
				if (r.lettura == "*" || r.lettura.indexOf(q.userid) != -1) {
					result["lettura"] = "true"
				}
				if (r.scrittura == "*" || r.scrittura.indexOf(q.userid) != -1) {
					result["scrittura"] = "true"
				}
			});

		await mongo.close();

		if (found) {
			response["data"] = result
			response["risultato"] = "successo"
		} else {
			response["risultato"] = "canale non trovato"
		}

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// ========================== NOTIFICATION

// get notifiche dell'utente
exports.get_notifications = async function (user_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname)
			.collection("notifica")
			.find({
				utente: user_id,
				letta: false
			})
			.forEach((r) => {
				result.push(r)
			});

		await mongo.close();

		response["data"] = result
		response["risultato"] = "successo"

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

// segna notifica come letta
exports.mark_notification = async function (notification_id, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let response = { "data": null, "risultato": null, "errore": null }

	try {
		let result = []
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname)
			.collection("notifica")
			.updateOne(
				{ not_id: notification_id },
				{
					$set: { letta: true }
				}
			)

		await mongo.close();

		response["risultato"] = "successo"

		return response
	} catch (e) {
		//response["errore"] = e.toString()
	}
}

/* ========================== */
/*                            */
/*         SUPPORTO           */
/*                            */
/* ========================== */
function get_chat_id(user1, user2) {
	const [first, second] = [user1, user2].sort();
	const result = `${first}_${second}`;
	return result;
}


async function add_notifica(target, tipo, ref_id, credentials, bonus, origin) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let notifica = {}
	try {
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		notifica["utente"] = target
		notifica["tipo"] = tipo
		notifica["ref_id"] = ref_id
		notifica["letta"] = false

		let date = new Date()
		notifica["timestamp"] = date.getTime();

		if (tipo == "menzione") {
			notifica["testo"] = `${origin} sta parlando di te!`
			await mongo.db(dbname)
				.collection("notifica")
				.insertOne(notifica)
				.then(async (result) => {
					const newDocumentId = result.insertedId;
					await mongo.db(dbname)
						.collection("notifica")
						.updateOne(
							{ _id: newDocumentId },
							{ $set: { not_id: String(newDocumentId) } }
						);
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		} else if (tipo == "follow") {
			notifica["testo"] = `${ref_id} ha iniziato a seguirti!`
			await mongo.db(dbname)
				.collection("notifica")
				.insertOne(notifica)
				.then(async (result) => {
					const newDocumentId = result.insertedId;
					await mongo.db(dbname)
						.collection("notifica")
						.updateOne(
							{ _id: newDocumentId },
							{ $set: { not_id: String(newDocumentId) } }
						);
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		} else if (tipo == "risposta") {
			notifica["testo"] = `${origin} ha commentato un tuo post!`
			await mongo.db(dbname)
				.collection("notifica")
				.insertOne(notifica)
				.then(async (result) => {
					const newDocumentId = result.insertedId;
					await mongo.db(dbname)
						.collection("notifica")
						.updateOne(
							{ _id: newDocumentId },
							{ $set: { not_id: String(newDocumentId) } }
						);
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		} else if (tipo == "privato") {
			notifica["testo"] = `${origin} ti ha mandato un messaggio privato!`
			await mongo.db(dbname)
				.collection("notifica")
				.insertOne(notifica)
				.then(async (result) => {
					const newDocumentId = result.insertedId;
					await mongo.db(dbname)
						.collection("notifica")
						.updateOne(
							{ _id: newDocumentId },
							{ $set: { not_id: String(newDocumentId) } }
						);
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		} else if (tipo == "quota") {
			if (bonus > 0)
				notifica["testo"] = `Sei popolare! Oggi avrai ${bonus} caratteri bonus :)`
			else
				notifica["testo"] = `Sei impopolare... Oggi avrai ${bonus} caratteri in meno :(`
			await mongo.db(dbname)
				.collection("notifica")
				.insertOne(notifica)
				.then(async (result) => {
					const newDocumentId = result.insertedId;
					await mongo.db(dbname)
						.collection("notifica")
						.updateOne(
							{ _id: newDocumentId },
							{ $set: { not_id: String(newDocumentId) } }
						);
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		} else if (tipo == "popolarita") {
			notifica["testo"] = "Un tuo post e' diventato " + bonus
			await mongo.db(dbname)
				.collection("notifica")
				.insertOne(notifica)
				.then(async (result) => {
					const newDocumentId = result.insertedId;
					await mongo.db(dbname)
						.collection("notifica")
						.updateOne(
							{ _id: newDocumentId },
							{ $set: { not_id: String(newDocumentId) } }
						);
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		}
	} catch (e) {
		return e
	}
}