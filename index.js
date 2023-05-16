﻿/*
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
app.use('/img' , express.static(global.rootDir +'/public/media'));
app.use(express.urlencoded({ extended: true })) 
app.use(cors())

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
	res.sendFile(global.rootDir+"/public/html/feed.html")
})

app.get('/editor', function (req, res) { 
	res.sendFile(global.rootDir+"/public/html/editor.html")
})

app.get('/settings', function (req, res) { 
	res.sendFile(global.rootDir+"/public/html/settings.html")
})

app.get('/testdb', function (req, res) { 
	res.sendFile(global.rootDir+"/public/html/testdb.html")
})

app.get('/login', function (req, res) { 
	res.sendFile(global.rootDir+"/public/html/login.html")
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
	//res.send({"msg": "todo - crea post"})
	res.send(await mymongo.user_login(req.query, mongoCredentials))
});

//tabella utente o singolo utente da username
app.get('/api_utente', async function(req, res) {
	res.send(await mymongo.search_utente(req.query, mongoCredentials))
});

//tabella messaggio o singolo messaggio da messaggio-id
app.get('/api_messaggio', async function(req, res) {
	res.send(await mymongo.search_messaggio(req.query, mongoCredentials))
});

//tabella canale o singolo canale da nome
app.get('/api_canale', async function(req, res) {
	res.send(await mymongo.search_canale(req.query, mongoCredentials))
});

//crea uno squeal
app.post('/crea_post', async function(req, res) {
	res.send({"msg": "todo - crea post"})
});

//risultati della ricerca tramite searchbar
app.get('/search', async function(req, res) {
	res.send({"msg": "todo - searchbar"})
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
