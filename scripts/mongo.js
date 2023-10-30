/*
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

/* Dati di prova */
let fn_utente = "/public/data/utente.json"
let fn_canale = "/public/data/canale.json"
let fn_messaggio = "/public/data/messaggio.json"
let dbname = "db"

const { MongoClient } = require("mongodb");
const fs = require('fs').promises ;
const template = require(global.rootDir + '/scripts/tpl.js') ; 

exports.create = async function(credentials) {
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

		//CHIUDO
		await mongo.close();
		debug.push("Managed to close connection to MongoDB.")

		return {
			message: `<h1>Removed ${(cleared1?.deletedCount+cleared2?.deletedCount+cleared3?.deletedCount) || 0} records, added ${(added1?.insertedCount+added2?.insertedCount+added3?.insertedCount) || 0} records</h1>`, 
			debug: debug
		}
	} catch (e) {
		e.debug = debug
		return e
	}
}

exports.search_utente = async function(q,credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	let debug = []
	let data = {query: q.username, result: null}
	try {
		debug.push(`Trying to connect to MongoDB with user: '${credentials.user}' and site: '${credentials.site}' and a ${credentials.pwd.length}-character long password...`)
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		debug.push("... managed to connect to MongoDB.")

		let result = []
		if(q.username === undefined){ //non passo argomenti nel get, ritorno tutta la tabella
			debug.push("no args found")
			await mongo.db(dbname)
						.collection("utente")
						.find()
						.forEach( (r) => { 
							result.push(r) 
						} );
		}
		else{ //passo userid nel get, ritorno il record corretto
			debug.push("found args")
			await mongo.db(dbname)
						.collection("utente")
						.find({username: q.username})
						.forEach( (r) => { 
							result.push(r) 
						} );
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

exports.search_messaggio = async function(q,credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	let debug = []
	let data = {query: q.messaggio_id, result: null}
	try {
		debug.push(`Trying to connect to MongoDB with user: '${credentials.user}' and site: '${credentials.site}' and a ${credentials.pwd.length}-character long password...`)
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		debug.push("... managed to connect to MongoDB.")

		let result = []
		if(q.messaggio_id === undefined){ //non passo argomenti nel get, ritorno tutta la tabella
			debug.push("no args found")
			await mongo.db(dbname)
						.collection("messaggio")
						.find()
						.project({_id:0})
						.forEach( (r) => { 
							result.push(r) 
						} );
		}
		else{ //passo userid nel get, ritorno il record corretto
			debug.push("found args :"+q.messaggio_id)
			console.log("-"+q.messaggio_id+"-")
			console.log(typeof q.messaggio_id)
			await mongo.db(dbname) // TODO nome ai post, regole di visibilita', ordine
					.collection("messaggio")
					.aggregate([
						{ $match: { post_id: q.messaggio_id } },
						{ $lookup: {
							from: "utente", // nome seconda tabella
							localField: "utente", // nome chiave in prima tabella (corrente)
							foreignField: "username", // nome chiave in seconda tabella
							as: "utenteData" // rename del record ottenuto (da seconda tabella)
						} },
						{ $unwind: "$utenteData" },// Unwind the joined data (if necessary)
						{ "$replaceRoot": { //ricrea la "root" della struttura ottenuta
							"newRoot": {
								"$mergeObjects": [ //unisce i campi di messaggio al singolo campo utente.nome
								"$$ROOT", //campi originali in messaggio
								{ nome: "$utenteData.nome" },
								{ img: "$utenteData.img" }
								]
							}
						} },
						{ $project: { utenteData: 0 } }, //rimuove la struttura contenente tutti i campi di utente (serve solo nome)
						{ $lookup: {
							from: "messaggio",
							localField: "post_id",
							foreignField: "risponde_a",
							as: "risposte"
						} },
						{ $addFields: { numRisposte: { $size: "$risposte" } } },
						{ $project: { risposte: 0 } }
					])
					.forEach( (r) => { 
						result.push(r) 
					});	
		}
		debug.push(`... managed to query MongoDB. Found ${result.length} results.`)

		data.result = result
		await mongo.close();
		debug.push("Managed to close connection to MongoDB.")

		data.debug = debug
		console.log("debug: "+debug)
		console.log("result: "+result)
		return result
	} catch (e) {
		data.debug = debug
		data.error = e
		return data
	}
}

exports.search_canale = async function(q,credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	let debug = []
	let data = {query: q.nome, result: null}
	try {
		debug.push(`Trying to connect to MongoDB with user: '${credentials.user}' and site: '${credentials.site}' and a ${credentials.pwd.length}-character long password...`)
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		debug.push("... managed to connect to MongoDB.")

		let result = []
		if(q.nome === undefined){ //non passo argomenti nel get, ritorno tutta la tabella
			debug.push("no args found")
			await mongo.db(dbname)
						.collection("canale")
						.find()
						.forEach( (r) => { 
							result.push(r) 
						} );
		}
		else{ //passo nome nel get, ritorno il record corretto
			debug.push("found args")
			await mongo.db(dbname)
						.collection("canale")
						.find({nome: q.nome})
						.forEach( (r) => { 
							result.push(r) 
						} );
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

exports.user_login = async function(q,credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	let debug = []
	let data = {query: q.username, result: null}
	try {
		debug.push(`Trying to connect to MongoDB with user: '${credentials.user}' and site: '${credentials.site}' and a ${credentials.pwd.length}-character long password...`)
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		debug.push("... managed to connect to MongoDB.")

		let result = []
		//debug.push(`found args ${q.username} e ${q.password}`)
		await mongo.db(dbname)
					.collection("utente")
					.find({$and: 
						[
							{username: q.username},
							{password: q.password}
						]
					},{
						password: 0
					}
					)
					.forEach( (r) => { 
						result.push(r) 
					} );
		debug.push(`... managed to query MongoDB. Found ${result.length} results.`)

		await mongo.close();
		debug.push("Managed to close connection to MongoDB.")
		
		//data.debug = debug;
		if(result.length>0)
			return result[0]
		return undefined
	} catch (e) {
		data.debug = debug
		data.error = e
		return data
	}
}

exports.user_info = async function(q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	try{
		let result = []
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		
		await mongo.db(dbname)
				.collection("utente")
				.find({username: q.username})
				.project({ img: 1, username: 1, nome: 1})
				.forEach( (r) => { 
					result.push(r) 
				} );

		await mongo.close();
		return result[0]
	} catch (e) {
		return e
	}
}

exports.user_exist = async function(q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	try{
		let result = []
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		
		await mongo.db(dbname)
				.collection("utente")
				.find({username: q.username})
				.forEach( (r) => { 
					result.push(r) 
				} );

		await mongo.close();
		return result
	} catch (e) {
		return e
	}
}

exports.email_exist = async function(q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	try{
		let result = []
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		
		await mongo.db(dbname)
				.collection("utente")
				.find({email: q.email})
				.forEach( (r) => { 
					result.push(r) 
				} );

		await mongo.close();
		return result
	} catch (e) {
		return e
	}
}

exports.add_user = async function(q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	try{
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		await mongo.db(dbname)
					.collection("utente")
					.insertOne(
						{
							img: "default_propic.png",
							nome: q.nome + " " + q.cognome,
							username: q.username,
							email: q.email,
							password: q.password,
							quota: {
								"g": 50, "s": 300, "m": 1000
							},
							acquisti: [],
							popolarita: 0,
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
		return
	} catch (e) {
		return e
	}
}

exports.add_post = async function(q, campi, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	try{
		const mongo = new MongoClient(mongouri);
		await mongo.connect();

		/*console.log("destinatari post (mongo) :")
		console.log(q.destinatari)
		console.log("---------")*/


		//controlli su campi situazionali
		let risposta
		try{
			risposta = q.post_id
		}catch(e){
			risposta = null
		}

		let tipo_destinatari
		try{
			tipo_destinatari = q.tipo_destinatari
		}catch(e){
			tipo_destinatari = null
		}

		//console.log(q.tipo)
		if(q.contenuto == "testo"){//caso testo
			await mongo.db(dbname)
						.collection("messaggio")
						.insertOne(
							{
								risponde_a: risposta,
								corpo: q.textarea,
								contenuto: "testo",
								destinatari: q.destinatari,
								tipo_destinatari: tipo_destinatari,
								utente: campi.username,
								timestamp: campi.timestamp,
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
							const newDocumentId = result.insertedId;
							await mongo.db(dbname)
								.collection("messaggio")
								.updateOne(
									{ _id: newDocumentId },
									{ $set: { post_id: String(newDocumentId) } }
								);
							console.log("aggiunto id:"+newDocumentId+"---")
							console.log(typeof newDocumentId)
						})
						.catch((error) => {
							console.error("Error:", error);
						});

		}else if(q.contenuto == "img"){//caso immagine
			await mongo.db(dbname)
						.collection("messaggio")
						.insertOne(
							{
								risponde_a: risposta,
								corpo: campi.path,
								contenuto: "img",
								destinatari: q.destinatari,
								tipo_destinatari: tipo_destinatari,
								utente: campi.username,
								timestamp: campi.timestamp,
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
							const newDocumentId = result.insertedId;
							await mongo.db(dbname)
								.collection("messaggio")
								.updateOne(
									{ _id: newDocumentId },
									{ $set: { post_id: newDocumentId } }
								);
						})
						.catch((error) => {
							console.error("Error:", error);
						});

		}

		await mongo.close();
		return
	} catch (e) {
		return e
	}
}

exports.user_feed = async function(q, campi, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	try{
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		//console.log("dentro mongo con user "+campi.username)
		//il feed e' composto da canali e account seguiti

		let canali_seguiti = []
		let utenti_seguiti = []
		await mongo.db(dbname)
			.collection("utente")
			.find({username: campi.username})
			.project({ canali_seguiti: 1, utenti_seguiti: 1})
			.forEach( (r) => { 
				canali_seguiti.push(r["canali_seguiti"])
				utenti_seguiti.push(r["utenti_seguiti"])
			} );
		canali_seguiti = canali_seguiti[0] //da fixare
		utenti_seguiti = utenti_seguiti[0]

		/*console.log("ottenuti canali seguiti da "+campi.username)
		canali_seguiti.forEach((element) => console.log(element))
		console.log("ottenuti utenti seguiti da "+campi.username)
		utenti_seguiti.forEach((element) => console.log(element))*/

		//canali_seguiti.push("@"+campi.username) //l'utente non vede i propri post
		//console.log("aggiunto utente")

		//debug

		let result = []

		await mongo.db(dbname)
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
			.forEach( (r) => { 
				result.push(r) 
			});

		/*console.log("post in canali seguiti:")
		result.forEach((element) => console.log(element))
		console.log("cerco post bacheca utenti seguiti")*/

		await mongo.db(dbname)
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
			.forEach( (r) => { 
				result.push(r) 
			});

		// debug
		//console.log("post in bacheca di utenti seguiti")
		//result.forEach((element) => console.log(element))

		// aumento le visual dei post ottenuti
		var id_arr = []
		result.forEach((el) => id_arr.push(el.post_id))
		await mongo.db(dbname)
			.collection("messaggio")
			.updateMany(
				{post_id : {$in: id_arr}},
				{$inc: {visualizzazioni : 1}}
			)

		//console.log("ottenuto feed")
		await mongo.close();
		return result
	} catch (e) {
		return e
	}
}

exports.smm_feed = async function(q, campi, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	try{
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		//console.log("dentro mongo con user "+campi.username)
		//il feed e' composto dai post degli account gestiti

		let utenti_gestiti = []
		await mongo.db(dbname)
			.collection("utente")
			.find({username: campi.smm})
			.project({ manager_of: 1})
			.forEach( (r) => { 
				utenti_gestiti.push(r["manager_of"])
			} );
		utenti_gestiti = utenti_gestiti[0] //da fixare

		/*console.log("ottenuti canali seguiti da "+campi.username)
		canali_seguiti.forEach((element) => console.log(element))
		console.log("ottenuti utenti seguiti da "+campi.username)
		utenti_seguiti.forEach((element) => console.log(element))*/

		//canali_seguiti.push("@"+campi.username) //l'utente non vede i propri post
		//console.log("aggiunto utente")

		//debug

		let result = []

		await mongo.db(dbname)
			.collection("messaggio")
			.aggregate([
				{
				  $match: {
					$or: [
					  { utente: { $in: utenti_gestiti } },
					],
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
			.forEach( (r) => { 
				result.push(r) 
			});

		/*console.log("post in canali seguiti:")
		result.forEach((element) => console.log(element))*/
		

		// aumento le visual dei post ottenuti
		var id_arr = []
		result.forEach((el) => id_arr.push(el.post_id))
		await mongo.db(dbname)
			.collection("messaggio")
			.updateMany(
				{post_id : {$in: id_arr}},
				{$inc: {visualizzazioni : 1}}
			)

		//console.log("ottenuto feed")
		await mongo.close();
		return result
	} catch (e) {
		return e
	}
}

exports.update_reazioni = async function(q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	try {
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();

		let result = {}
		await mongo.db(dbname)
					.collection("messaggio")
					.find({post_id: q._id})
					.forEach( (r) => { 
						result = r
					} );

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
						{ post_id:  q._id},
						{ $set:
						   {
							 reazioni: result.reazioni
						   }
						}
					)

		await mongo.close()
		return 
	} catch (e) {
		return e
	}
}

exports.search = async function(q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let meta = {} //metadati risposta: tipo ricerca, info user/canale
	let post = [] //lista post
	let result = {}
	try {
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		// utente : nome
		// canale: nome
		// keyword: keyword
		meta["tipo"] = q.tipo
		
		if(q.tipo == "utente"){ // caso ricerca utenti
			await mongo.db(dbname) // TODO nome ai post, regole di visibilita', ordine
				.collection("messaggio")
				.aggregate([
					{ $match: { utente: q.query, risponde_a: null } },
					{ $lookup: {
						from: "utente", // nome seconda tabella
						localField: "utente", // nome chiave in prima tabella (corrente)
						foreignField: "username", // nome chiave in seconda tabella
						as: "utenteData" // rename del record ottenuto (da seconda tabella)
					} },
					{ $unwind: "$utenteData" },// Unwind the joined data (if necessary)
					{ "$replaceRoot": { //ricrea la "root" della struttura ottenuta
						  "newRoot": {
							"$mergeObjects": [ //unisce i campi di messaggio al singolo campo utente.nome
							  "$$ROOT", //campi originali in messaggio
							  { nome: "$utenteData.nome" },
							  { img: "$utenteData.img" }
							]
						  }
					} },
					{ $project: { utenteData: 0 } }, //rimuove la struttura contenente tutti i campi di utente (serve solo nome)
					{ $lookup: {
						from: "messaggio",
						localField: "post_id",
						foreignField: "risponde_a",
						as: "risposte"
					} },
					{ $addFields: { numRisposte: { $size: "$risposte" } } },
					{ $project: { risposte: 0 } },
					{ $sort: { timestamp: -1 } },
					{ $limit: 100 }// Limit the result to 100 records
				  ])
				.forEach( (r) => { 
					post.push(r) 
				});
			
			await mongo.db(dbname) // user info
				.collection("utente")
				.find({
					username: q.query
				})
				.project(
					{ username:1, nome:1, img:1, bio:1 }
				)
				.forEach( (r) => { 
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
					utenti_seguiti: {$in: [q.query]}
				})
				.forEach((r) => {
					isFollower = true
				})
			meta["info"]["is_follower"] = isFollower

		} else if(q.tipo == "canale"){
			await mongo.db(dbname) // TODO nome ai post, regole di visibilita', ordine
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
				.forEach( (r) => { 
					post.push(r) 
				});

			await mongo.db(dbname) // info canale
				.collection("canale")
				.find({
					nome: q.query
				})
				.project(
					{ img:1, nome:1, descrizione:1 }
				)
				.forEach( (r) => { 
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
					canali_seguiti: {$in: [q.query]}
				})
				.forEach((r) => {
					isFollower = true
				})
			meta["info"]["is_follower"] = isFollower

		} else if(q.tipo == "keyword"){
			await mongo.db(dbname) // TODO nome ai post, canale info, regole di visibilita', ordine
				.collection("messaggio")
				.aggregate([
					{
					  $match: {
						corpo: {$regex: q.query},
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
				.forEach( (r) => { 
					post.push(r) 
				});
		}

		result["meta"] = meta
		result["post"] = post
		//console.log(result)
		await mongo.close()
		return result
	} catch (e) {
		return e
	}
}

exports.get_replies = async function(q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let result = []
	try {
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();

		await mongo.db(dbname)
			.collection("messaggio")
			.aggregate([
				{
				  $match: {
					risponde_a: q.post_id
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
			.sort({timestamp: -1}) // Sort by timestamp in descending order
			.limit(100)
			.forEach( (r) => { 
				result.push(r) 
			});

		await mongo.close()
		return result
	} catch (e) {
		return e
	}
}

exports.get_managed = async function(q, campi, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let result = []
	try {
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();

		await mongo.db(dbname)
			.collection("utente")
			.find(
				{
					username: campi.username
				}
			)
			.forEach( (r) => { 
				result.push(r) 
			});

		await mongo.close()
		return result[0]["manager_of"]
	} catch (e) {
		return e
	}
}

exports.get_quota = async function(q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let result = []
	try {
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();

		await mongo.db(dbname)
			.collection("utente")
			.find(
				{
					username: q.username
				}
			)
			.project({ quota: 1})
			.forEach( (r) => { 
				result.push(r) 
			});

		await mongo.close()
		return result[0]
	} catch (e) {
		return e
	}
}

exports.get_mychannels = async function(q, campi, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let result = []
	try {
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();

		await mongo.db(dbname)
			.collection("canale")
			.find(
				{
					$or: [
					  	{ proprieta: campi.username }, // canali di proprieta dell'utente
						{ // canali in cui l'utente e' mod
							mod: { $elemMatch: { $eq: campi.username } }
						}
					]
				}
			)
			.forEach( (r) => { 
				result.push(r) 
			});

		await mongo.close()
		return result
	} catch (e) {
		return e
	}
}

exports.toggle_follow = async function(q, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	let result = []
	try {
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();

		if(q.tipo == "utente"){
			await mongo.db(dbname)
				.collection("utente")
				.aggregate([
					{
						$match: {
							username: q.origin,
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
									{ username: q.origin },
									{ $pull: { utenti_seguiti: q.target } }
								);
						} catch (error) {
							console.error("Error:", error);
						}
					}

					const push_list = results.filter((doc) => doc.result === "push");
					for (const doc of push_list) { //altrimento lo aggiungo
						try {
							await mongo.db(dbname)
								.collection("utente")
								.updateOne(
									{ username: q.origin },
									{ $push: { utenti_seguiti: q.target } }
								);
						} catch (error) {
							console.error("Error:", error);
						}
					}
				})
				.catch((error) => {
					console.error("Error:", error);
				});

		} else if(q.tipo == "canale"){
			await mongo.db(dbname)
				.collection("utente")
				.aggregate([
					{
						$match: {
							username: q.origin,
						}
					},
					{
						$project: {
							result: {
								$cond: {
									if: { $in: [{$literal: q.target}, "$canali_seguiti"] }, // controlla se l'utente e' follower
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
						console.log("pulling "+q.target)
						try {
							await mongo.db(dbname)
								.collection("utente")
								.updateOne(
									{ username: q.origin },
									{ $pull: { canali_seguiti: q.target } }
								);
						} catch (error) {
							console.error("Error:", error);
						}
					}

					const push_list = results.filter((doc) => doc.result === "push");
					for (const doc of push_list) { //altrimento lo aggiungo
						console.log("pushing "+q.target)
						try {
							await mongo.db(dbname)
								.collection("utente")
								.updateOne(
									{ username: q.origin },
									{ $push: { canali_seguiti: q.target } }
								);
						} catch (error) {
							console.error("Error:", error);
						}
					}
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		}

		await mongo.close()
		return result
	} catch (e) {
		return e
	}
}

/* Untested */
// https://stackoverflow.com/questions/39599063/check-if-mongodb-is-connected/39602781
exports.isConnected = async function() {
	let client = await MongoClient.connect(mongouri) ;
	return !!client && !!client.topology && client.topology.isConnected()
}
