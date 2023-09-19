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
						.forEach( (r) => { 
							result.push(r) 
						} );
		}
		else{ //passo userid nel get, ritorno il record corretto
			debug.push("found args")
			await mongo.db(dbname)
						.collection("messaggio")
						.find({messaggio_id: q.messaggio_id})
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
				.project({ img: 1, username: 1})
				.forEach( (r) => { 
					result.push(r) 
				} );

		await mongo.close();
		return result
	} catch (e) {
		return e
	}
}

exports.add_post = async function(q, campi, credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;
	try{
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		console.log(q.tipo)
		if(q.tipo == "testo"){//caso testo
			await mongo.db(dbname)
						.collection("messaggio")
						.insertOne(
							{
								risponde_a: null,//todo
								corpo: q.contenuto,
								destinatari: q.destinatari,
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
								pubblico: campi.pubblico,
								categoria: null,
								automatico: false
							}
						)

		}

		await mongo.close();
		return undefined
	} catch (e) {
		return e
	}
}

/*exports.search = async function(q,credentials) {
	const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

	let query =  {}
	let debug = []
	let data = {query: q[fieldname], result: null}
	try {
		debug.push(`Trying to connect to MongoDB with user: '${credentials.user}' and site: '${credentials.site}' and a ${credentials.pwd.length}-character long password...`)
		const mongo = new MongoClient(mongouri);		
		await mongo.connect();
		debug.push("... managed to connect to MongoDB.")

		debug.push(`Trying to query MongoDB with query '${q[fieldname]}'... `)
		let result = []
		query[fieldname] = { $regex: q[fieldname], $options: 'i' }
		await mongo.db(dbname)
					.collection("utente")
					.find(query)
					.forEach( (r) => { 
						result.push(r) 
					} );
		debug.push(`... managed to query MongoDB. Found ${result.length} results.`)

		data.result = result
		await mongo.close();
		debug.push("Managed to close connection to MongoDB.")

		data.debug = debug
		if (q.ajax) {
			return data
		} else {
			var out = await template.generate('mongo.html', data);
			return out
		}
	} catch (e) {
		data.debug = debug
		data.error = e
		return data
	}
}*/

/* Untested */
// https://stackoverflow.com/questions/39599063/check-if-mongodb-is-connected/39602781
exports.isConnected = async function() {
	let client = await MongoClient.connect(mongouri) ;
	return !!client && !!client.topology && client.topology.isConnected()
}
