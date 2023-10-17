/*
File: index.js
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



/* ========================== */
/*                            */
/*           SETUP            */
/*                            */
/* ========================== */

global.rootDir = __dirname ;
global.startDate = null;

const template = require(global.rootDir + '/scripts/tpl.js') ;
const mymongo = require(global.rootDir + '/scripts/mongo.js') ;
const express = require('express') ;
const cors = require('cors')
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const { escapeExpression } = require('handlebars');
const upload = require('./multer'); // Import the multer configuration






/* ========================== */
/*                            */
/*  EXPRESS CONFIG & ROUTES   */
/*                            */
/* ========================== */

let app= express();
app.use('/js'  , express.static(global.rootDir +'/public/js'));
app.use('/css' , express.static(global.rootDir +'/public/css'));
app.use('/data', express.static(global.rootDir +'/public/data'));
app.use('/docs', express.static(global.rootDir +'/public/html'));
app.use('/media' , express.static(global.rootDir +'/public/media'));
app.use('/img' , express.static(global.rootDir +'/public/media/img'));
app.use('/uploads', express.static(global.rootDir +'/public/media/uploads'));
app.use(express.json()); //?
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.use(cors())
var session;
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
app.enable('trust proxy');


/*app.get('/', async function (req, res) {
	let sitename = req.hostname.split('.')[0]
	res.send(await template.generate('index.html', {
			host: req.hostname,
			site: sitename
	}));
})*/

app.get('/', function (req, res) {
	if(!req.session || !req.session.userid) {res.redirect("/login")}
	res.sendFile(global.rootDir+"/public/html/feed.html")
})

app.get('/editor', function (req, res) {
	if(!req.session || !req.session.userid) {res.redirect("/login")}
	res.sendFile(global.rootDir+"/public/html/editor.html")
})

app.get('/settings', function (req, res) {
	if(!req.session || !req.session.userid) {res.redirect("/login")}
	res.sendFile(global.rootDir+"/public/html/settings.html")
})

app.get('/testdb', function (req, res) { // ---- DEBUG USE
	if(!req.session || !req.session.userid) {res.redirect("/login")}
	res.sendFile(global.rootDir+"/public/html/testdb.html")
})

app.get('/register', function (req, res) {
	res.sendFile(global.rootDir+"/public/html/register.html")
})

app.get('/login', function (req, res) {
	res.sendFile(global.rootDir+"/public/html/login.html")
})

app.get('/logout', function (req, res) {
	req.session.destroy()
	res.redirect("/login")
})

app.get('/test', function (req, res) {
	res.sendFile(global.rootDir+"/public/html/test.html")
})

/*app.get('/hw', async function(req, res) {
	var text = "Hello world as a Node service";
	res.send(
`<!doctype html>
<html>
	<body>
		<h1>${text}</h1>
		<p><a href="javascript:history.back()">Go back</a></p>
	</body>
</html>
			`)
});

app.get('/hwhb', async function(req, res) {
	res.send(await template.generate('generic.html', {
		text: "Hello world as a Handlebar service",
	}));
});

const info = async function(req, res) {
	let data = {
		startDate: global.startDate.toLocaleString(),
		requestDate: (new Date()).toLocaleString(),
		request: {
			host: req.hostname,
			method: req.method,
			path: req.path,
			protocol: req.protocol
		},
		query: req.query,
		body: req.body
	}
	res.send( await template.generate('info.html', data));
}

app.get('/info', info )
app.post('/info', info )
*/




/* ========================== */
/*                            */
/*           MONGODB          */
/*                            */
/* ========================== */

/* Replace these info with the ones you were given when activating mongoDB */
const mongoCredentials = {
        user: "site212251",
        pwd: "iot7Eewe",
        site: "mongo_site212251"
}
/* end */

app.get('/db/create', async function(req, res) {
	res.send(await mymongo.create(mongoCredentials))
});
app.get('/db/search', async function(req, res) {
	res.send(await mymongo.search(req.query, mongoCredentials))
});

/* ========================== */
/*                            */
/*          DB CALLS	      */
/*                            */
/* ========================== */

//login
app.post('/api_login', async function(req, res) {
	try{
		var db_res = await mymongo.user_login(req.body, mongoCredentials);
		//console.log(db_res);
		if(db_res === null)
			throw new Error("errore db")
		session=req.session; //login riuscito
		session.userid=req.body.username;
		console.log(req.session)
		res.cookie('username', session.userid)
		res.cookie('login_result', "success")
		res.cookie('quota_giorno', db_res["quota"]["g"])
		res.cookie('quota_settimana', db_res["quota"]["s"])
		res.cookie('quota_mese', db_res["quota"]["m"])
		res.redirect("/")
	}catch(e){
		res.cookie('username', "null")
		res.cookie('login_result', "failed")
		//res.sendFile(global.rootDir+"/public/html/login.html")
		res.redirect("/login")
	}
});

//registrazione
app.post('/api_register', async function(req, res) {
	try{
		let result = await mymongo.add_user(req.body, mongoCredentials);

		res.status(200)
		res.redirect("/login")
	} catch (e) {
		res.status(500)
		res.redirect("/register")
	}
});

//tabella utente o singolo utente da username
app.get('/api_utente', async function(req, res) {
	res.send(await mymongo.search_utente(req.query, mongoCredentials))
});

//tabella messaggio o singolo messaggio da messaggio-id
app.get('/api_messaggio', async function(req, res) {
	r = await mymongo.search_messaggio(req.query, mongoCredentials)
	res.send(JSON.stringify(r))
});

//tabella canale o singolo canale da nome
app.get('/api_canale', async function(req, res) {
	res.send(await mymongo.search_canale(req.query, mongoCredentials))
});

app.get('/permessi_canale', async function(req, res) {
	try{
		let result = await mymongo.search_canale(req.query, mongoCredentials)
		result = result["result"][0]
		if(result["abilitato"] == true && (result["scrittura"].includes(session.userid) || result["scrittura"].includes("*"))){
			res.status(200)
			res.send("true")
		}else{
			res.status(403)
			res.send("false")
		}
	}catch(e){
		res.status(500)
		res.send("errore")
	}
});

app.get("/user_info", async function(req, res) {
	try{
		let result = await mymongo.user_info(req.query, mongoCredentials)
		result = result
		res.status(200)
		res.send(result)
	}catch(e){
		res.status(500)
		res.send("errore")
	}
});

app.get("/user_exist", async function(req, res) {
	try{
		let result = await mymongo.user_info(req.query, mongoCredentials)
		res.status(200)
		if (result.length() == 0) {
			res.send(false) //utente non esiste
		} else {
			res.send(true) //utente esiste
		}
	}catch(e){
		res.status(500)
		res.send("errore")
	}
});

app.get("/email_exist", async function(req, res) {
	try{
		let result = await mymongo.user_info(req.query, mongoCredentials)
		res.status(200)
		if (result.length() == 0) {
			res.send(false) //email non esiste
		} else {
			res.send(true) //email esiste
		}
	}catch(e){
		res.status(500)
		res.send("errore")
	}
});

//crea uno squeal
app.post('/crea_post', upload.single("img"), async function(req, res) {
	try{
		//aggiungo i vari campi mancanti
		var campi = {}
		if(req.body.contenuto == "img"){//caso immagine
			let path = req.file.path
			campi["path"] = path.split("/").slice(-1)[0]
		}
		/*console.log("destinatari post (index) :")
		console.log(req.body.destinatari)
		console.log("---------")*/

		req.body.destinatari = JSON.parse(req.body.destinatari)

		/*console.log("destinatari post (index - parse) :")
		console.log(req.body.destinatari)
		console.log("---------")*/

		//timestamp
		let date = new Date()
		campi["timestamp"] = date.getTime();

		//username
		campi["username"] = session.userid;

		let result = await mymongo.add_post(req.body, campi, mongoCredentials);

		res.status(200)
		res.send("ok")
	} catch (e) {
		res.status(500)
		res.send("errore nella creazione del post")
	}
});

//user feed
app.get('/user_feed', async function(req, res) {
	let result;
	try{
		let campi = {}
		campi["username"] = session.userid;
		result = await mymongo.user_feed(req.query, campi, mongoCredentials);
		res.status(200)
		res.send(result)
	} catch (e) {
		res.status(500)
		res.send("errore nella richiesta del feed")
	}
});

// ottiene gli squeal in risposta al post selezionato
app.get('/get_replies', async function(req, res) {
	let result
	try{
		result = await mymongo.get_replies(req.query, mongoCredentials)
		res.status(200)
		res.send(result)
	} catch (e) {
		res.status(500)
		res.send("errore nella richiesta dei commenti")
	}
});

// ottiene gli account gestiti dall'utente
app.get('/get_managed', async function(req,res) {
	let result
	let campi = {}
	try{
		campi["username"] = session.userid
		result = await mymongo.get_managed(req, campi, mongoCredentials)
		res.status(200)
		res.send(result)
	} catch (e) {
		res.status(500)
		res.send("errore nella richiesta degli account gestiti1")
	}
});

//otiene i canali dell'utente
app.get('/get_mychannels', async function(req,res) {
	let campi = {}
	try{
		campi["username"] = session.userid
		result = await mymongo.get_mychannels(req, campi, mongoCredentials)
		res.status(200)
		res.send(result)
	} catch (e) {
		res.status(500)
		res.send("errore nella richiesta dei canali gestiti1")
	}
}),

//risultati della ricerca
app.post('/search', async function(req, res) {
	//req.body.tipo = utente|canale|keyword
	//req.body.query
	//req.body.ordina = data|visual|popolari
	let result
	let campi = {}
	try{
		campi = session.userid
		result = await mymongo.search(req.body, campi, mongoCredentials)
		res.status(200)
		res.send(result)
	} catch(e){ // todo due errori: server error, ricerca senza risultati
		res.status(404)
		res.send("errore nella ricerca")
	}
});

app.get('/update_reazioni', async function(req, res) {
	try{
		req.query.userid = session.userid
		let r = await mymongo.update_reazioni(req.query, mongoCredentials)
		res.status(200)
		res.send(JSON.stringify(r))
	} catch (e) {
		res.status(500)
		res.send("errore nella modifica del post")
	}
});

app.post('/upload', upload.single('img'), (req, res) => {  // ---- DEBUG USE
	// You can access the uploaded file through req.file
	if (!req.file) {
	  return res.status(400).json({ message: 'No file uploaded' });
	}

	// You can perform further processing here, such as saving the file path to a database
	const imagePath = req.file.path;

	return res.status(200).json({ message: 'File uploaded successfully', imagePath });
  });

//route che matcha su endpoint non esistenti
//DEVE STARE IN FONDO
app.use(function(req, res){
	res.json({
		error:{
			"name": "error",
			"status": 404,
			"message": "Richiesta non valida",
			"statusCode": 404,
		},
		message: "Richiesta non valida"
	});
});

/* ========================== */
/*                            */
/*    ACTIVATE NODE SERVER    */
/*                            */
/* ========================== */

app.listen(8000, function() {
	global.startDate = new Date() ;
	console.log(`App listening on port 8000 started ${global.startDate.toLocaleString()}` )
})


/*       END OF SCRIPT        */
