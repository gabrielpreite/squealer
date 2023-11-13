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
const upload = require('./multer');
const { Timestamp } = require('mongodb');

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

/* ========================== */
/*                            */
/*           PAGINE           */
/*                            */
/* ========================== */

app.get('/', function (req, res) {
	if(!req.session || !req.session.userid) {res.redirect("/login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/login")
	} else {res.sendFile(global.rootDir+"/public/html/feed.html")}
})

app.get('/editor', function (req, res) {
	if(!req.session || !req.session.userid) {res.redirect("/login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/login")
	} else {res.sendFile(global.rootDir+"/public/html/editor.html")}
})

app.get('/settings', function (req, res) {
	if(!req.session || !req.session.userid) {res.redirect("/login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/login")
	} else {res.sendFile(global.rootDir+"/public/html/settings.html")}
})

app.get('/register', function (req, res) {
	if(!req.session || !req.session.userid || req.cookies.username == "null") {
		res.sendFile(global.rootDir+"/public/html/register.html")
	} else if(!req.cookies || !req.cookies.username) {
		req.session.destroy()
		res.sendFile(global.rootDir+"/public/html/register.html")
	} else {res.redirect("/")}
})

app.get('/login', function (req, res) {
	if(!req.session || !req.session.userid) {
		res.sendFile(global.rootDir+"/public/html/login.html")
	} else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.sendFile(global.rootDir+"/public/html/login.html")
	} else {res.redirect("/")}
})

app.get('/logout', function (req, res) {
	req.session.destroy()
	res.redirect("/login")
})

app.get('/test', function (req, res) { // DEBUG USE
	res.sendFile(global.rootDir+"/public/html/test.html")
})

/* ========================== */
/*                            */
/*           MONGODB          */
/*                            */
/* ========================== */
//chiamate di debug/mantenimento

const mongoCredentials = {
    user: "site212251",
    pwd: "iot7Eewe",
    site: "mongo_site212251"
}

app.get('/db/create', async function(req, res) {
res.send(await mymongo.create(mongoCredentials))
});

//tabella utente o singolo utente da username
app.get('/db/user', async function(req, res) {
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

//tabella notifica
app.get('/api_notifica', async function(req, res) {
	res.send(await mymongo.search_notifica(req.query, mongoCredentials))
});

/* ========================== */
/*                            */
/*          RISORSE           */
/*                            */
/* ========================== */

// ========================== USER


// get quota
app.get('/user/:user_id/quota', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("quota")
    try{
        const user_id = req.params.user_id
        let smm = await mymongo.user_get_managed_by(user_id, mongoCredentials)
        if(user_id !== session.userid || smm["data"] !== session.userid){ // utente non corrisponde
            response["risultato"] = "non hai i permessi"
            res.status(403)
            res.send(response)
        }

        response = await mymongo.user_get_quota(user_id, mongoCredentials)
        
        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// aggiorna quota
app.post('/user/:user_id/quota', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("agg quota")
    try{
        const user_id = req.params.user_id
        let smm = await mymongo.user_get_managed_by(user_id, mongoCredentials)
        if(user_id !== session.userid || smm !== session.userid){ // utente non corrisponde
            response["risultato"] = "non hai i permessi"
            res.status(403)
            res.send(response)
        }
        
        response = await mymongo.user_update_quota(user_id, req.body, mongoCredentials)
        
        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// toggle follow
//body: target
app.post('/user/:user_id/follow', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("follow")
    try{
        const user_id = req.params.user_id
        let smm = await mymongo.user_get_managed_by(user_id, mongoCredentials)
        if(user_id !== session.userid || smm !== session.userid){ // utente non corrisponde
            response["risultato"] = "non hai i permessi"
            res.status(403)
            res.send(response)
        }
        response = await mymongo.user_toggle_follow(user_id, req.body, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username/canale non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// get user feed
app.post('/user/:user_id/feed', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("feed")
    try{
        const user_id = req.params.user_id
    
        response = await mymongo.user_feed(user_id, req.body, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        }
    } catch (e){
        console.log(response)
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// get smm dell'utente
app.get('/user/:user_id/managed_by', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("smm")
    try{
        const user_id = req.params.user_id
        
        response = await mymongo.user_get_managed_by(user_id, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// aggiorna smm dell'utente
app.post('/user/:user_id/managed_by', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("set smm")
    try{
        const user_id = req.params.user_id
        if(user_id !== session.userid){ // utente non corrisponde
            response["risultato"] = "non hai i permessi"
            res.status(403)
            res.send(response)
        }
        response = await mymongo.user_set_managed_by(user_id, req.body, mongoCredentials)
        
        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// get account gestiti dall'utente
app.get('/user/:user_id/manager_of', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("manager of")
    try{
        const user_id = req.params.user_id
        
        response = await mymongo.user_manager_of(user_id, mongoCredentials)
        
        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// get canali gestiti dall'utente, insieme al ruolo
app.get('/user/:user_id/my_channels', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("my chann")
    try{
        const user_id = req.params.user_id
        
        response = await mymongo.user_my_channels(user_id, mongoCredentials)
        
        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// modifica impostazioni utente
app.post('/user/:user_id/settings', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("mod impost ute")
    try{
        const user_id = req.params.user_id
        if(user_id !== session.userid){ // utente non corrisponde
            response["risultato"] = "non hai i permessi"
            res.status(403)
            res.send(response)
        }

        response = await mymongo.user_update(user_id, req.body, mongoCredentials)
        
        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        res.status(500)
        res.send({"errore":e})
    }
});

// user info
app.get('/user/:user_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("user info")
    try{
        const user_id = req.params.user_id
        response = await mymongo.user_info(user_id, mongoCredentials)
        
        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else {
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});


// cancella utente
app.delete('/user/:user_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("del user")
    try{
        const user_id = req.params.user_id
        if(user_id !== session.userid){ // utente non corrisponde
            response["risultato"] = "non hai i permessi"
            res.status(403)
            res.send(response)
        }

        response = await mymongo.user_delete(user_id, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});


// login
app.post('/user/login', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("login")
    try{
        response = await mymongo.user_login(req.body, mongoCredentials)

        if(response["risultato"] == "successo"){
            session=req.session; //login riuscito
            session.userid=req.body.username;
            console.log(req.session)
            res.cookie('username', session.userid)
            res.cookie('nome', response["data"]["nome"])
            res.cookie('img', response["data"]["img"])
            res.cookie('login_result', "success")
            res.cookie('quota_giorno', response["data"]["quota"]["g"])
            res.cookie('quota_settimana', response["data"]["quota"]["s"])
            res.cookie('quota_mese', response["data"]["quota"]["m"])
            res.clearCookie('managed')
            res.redirect("/")
        } else if(response["risultato"] == "username/password errati"){
            response["errore"] = "errore"
            res.status(401)
            res.send(response)
        }
    } catch (e){
        res.status(500)
        res.send({"errore":e})
    }
});

// registra nuovo utente
app.post('/user', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("register")
    try{
        response = await mymongo.user_register(req.body, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username esistente"){
            response["errore"] = "errore"
            res.status(400)
            res.send(response)
        } else if(response["risultato"] == "email esistente"){
            response["errore"] = "errore"
            res.status(400)
            res.send(response)
        }
    } catch (e){
        res.status(500)
        res.send({"errore":e})
    }
});

// ========================== SQUEAL

// get squeal replies
app.get('/squeal/:squeal_id/reply', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        const squeal_id = req.params.squeal_id

        response = await mymongo.get_squeal_replies(squeal_id, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "squeal non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// modifica reaction
//body: userid, reac
app.post('/squeal/:squeal_id/reaction', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    
    try{
        const squeal_id = req.params.squeal_id
        
        response = await mymongo.set_reaction(squeal_id, req.body, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "squeal non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// get squeal by id
app.get('/squeal/:squeal_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        const squeal_id = req.params.squeal_id
        
        response = await mymongo.get_squeal(squeal_id, mongoCredentials)
        
        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "squeal non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});


// cancella squeal
//body: user_id
app.delete('/squeal/:squeal_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        let allowed_users = [req.body.user_id]
        let smm = await mymongo.user_get_managed_by(user_id, mongoCredentials)
        allowed_users.push(smm)

        response = await mymongo.delete_squeal(squeal_id, allowed_users, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "squeal non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        } else if(response["risultato"] == "errore di permessi"){
            response["errore"] = "errore"
            res.status(403)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});


// ricerca per utente
//body
app.post('/squeal/by_user', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        response = await mymongo.search_by_user(req.body, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "utente non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// ricerca per canale
//body
app.post('/squeal/by_channel', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        response = await mymongo.search_by_channel(req.body, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "canale non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// ricerca per keyword
//body
app.post('/squeal/by_keyword', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        response = await mymongo.search_by_keyword(req.body, mongoCredentials)
        
        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "keyword non trovata"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// add post
app.post('/squeal', upload.single("img"), async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        const user_id = req.body.user_id
        let smm = await mymongo.user_get_managed_by(user_id, mongoCredentials)
        if(user_id !== session.userid || smm !== session.userid){ // utente non corrisponde
            response["risultato"] = "non hai i permessi"
            res.status(403)
            res.send(response)
        }
        if(req.body.contenuto == "img"){//caso immagine
            let path = req.file.path
            req.body["path"] = path.split("/").slice(-1)[0]
        }

        req.body.destinatari = JSON.parse(req.body.destinatari)

        //timestamp
        let date = new Date()
        campi["timestamp"] = date.getTime();

        response = await mymongo.add_squeal(req.body, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// ========================== CHANNEL

// controlla se l'utente ha permessi sul canale {"lettura": true, "scrittura": false}
//query: userid
app.get('/channel/:channel_id/auth', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        const channel_id = req.params.channel_id
        
        response = await mymongo.channel_auth(channel_id, req.query, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "canale non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// get channel info
app.get('/channel/:channel_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}


    try{
        const channel_id = req.params.channel_id

        response = await mymongo.channel_info(channel_id, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "canale non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// modifica impostazioni canale
app.post('/channel/:channel_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        const channel_id = req.params.channel_id
        //todo check if userid is proprietario

        response = await mymongo.channel_update(channel_id, req.body, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "canale non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        res.status(500)
        res.send({"errore":e})
    }
});

// cancella canale
app.delete('/channel/:channel_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{

        // todo check se l'utente e' proprietario
        const user_id = req.params.user_id
        if(user_id !== session.userid){ // utente non corrisponde
            response["risultato"] = "non hai i permessi"
            res.status(403)
            res.send(response)
        }

        response = await mymongo.channel_delete(user_id, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// crea nuovo canale
//body: nome, userid
app.post('/channel', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    
    try{
        response = await mymongo.channel_create(req.body, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "canale esistente"){
            response["errore"] = "errore"
            res.status(403)
            res.send(response)
        }
    } catch (e){
        res.status(500)
        res.send({"errore":e})
    }
});

// ========================== NOTIFICATION

// get notifiche dell'utente
app.get('/notification/:user_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        const user_id = req.params.user_id

        response = await mymongo.get_notifications(user_id, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// segna notifica come letta
app.post('/notification/:notification_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        const notification_id = req.params.notification_id

        response = await mymongo.mark_notification(notification_id, mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "notifica non trovata"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
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
		message: req.originalUrl
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