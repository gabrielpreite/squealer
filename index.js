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
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const { escapeExpression } = require('handlebars');
const upload = require('./multer');
const { Timestamp } = require('mongodb');
const schedule = require('node-schedule');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.use(cors())
var session;
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: (oneDay * 30) },
    resave: false
}));

const ghigliottine = []

// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
app.enable('trust proxy');

/* ========================== */
/*                            */
/*           SCHEDULE         */
/*                            */
/* ========================== */

const daily = schedule.scheduleJob({ hour: 0, minute: 5, tz: 'Europe/Rome' }, () => {
    let timestamp = new Date()
    console.log("[D] Starting daily job at "+timestamp.toLocaleString('it-IT', { timeZone: 'Europe/Rome' , month: "2-digit", day: "2-digit",}));
    mymongo.daily(false, mongoCredentials)
});

const weekly = schedule.scheduleJob({ hour: 0, minute: 3, dayOfWeek: 1, tz: 'Europe/Rome' }, () => {
    let timestamp = new Date()
    console.log("[W] Starting weekly job at "+timestamp.toLocaleString('it-IT', { timeZone: 'Europe/Rome' , month: "2-digit", day: "2-digit",}));
    mymongo.weekly(false, mongoCredentials)
});

const monthly = schedule.scheduleJob({ hour: 0, minute: 1, date: 1, tz: 'Europe/Rome' }, () => {
    let timestamp = new Date()
    console.log("[M] Starting monthly job at "+timestamp.toLocaleString('it-IT', { timeZone: 'Europe/Rome' , month: "2-digit", day: "2-digit",}));
    mymongo.monthly(false, mongoCredentials)
});

const pop = schedule.scheduleJob('*/15 * * * *', function(){
    let timestamp = new Date()
    console.log('Popolarita at'+timestamp.toLocaleString('it-IT', { timeZone: 'Europe/Rome' , month: "2-digit", day: "2-digit",}));
    mymongo.pop(false, mongoCredentials)
});

async function run_daily_meteo(dry){
    let timestamp = new Date()
    console.log((dry ? "[DRY]" : "")+"[METEO] Starting daily job at "+timestamp.toLocaleString('it-IT', { timeZone: 'Europe/Rome' , month: "2-digit", day: "2-digit",}));
    try {
        const response = await axios.get("https://api.open-meteo.com/v1/forecast?latitude=44.4938&longitude=11.3387&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Europe%2FBerlin&forecast_days=1");

        //console.log(response)
        const data = response.data

        let data_oggi = timestamp.toLocaleString('it-IT', { timeZone: 'Europe/Rome' , month: "2-digit", day: "2-digit",}).slice(0,5)
        let minima = data.daily.temperature_2m_min[0]
        let massima = data.daily.temperature_2m_max[0]
        let probabilita = data.daily.precipitation_probability_max[0]
        let mm = data.daily.precipitation_sum[0]
        let corpo = `Oggi, ${data_oggi}, a Bologna la temperatura sarà di ${minima}°C minima e ${massima}°C massima, con ${probabilita}% di precipitazioni`+(probabilita !== 0 ? ` (${mm}mm).`: ".")

        //console.log(corpo);

        body = {
            tipo_destinatari: "canali",
            destinatari: ["$METEO"],
            contenuto: "testo",
            user_id: "robosquealer",
            textarea: corpo,
            timestamp: timestamp.getTime()
        }

        if(!dry){
            console.log("Aggiungo squeal meteo")
            await mymongo.add_squeal(body, mongoCredentials)
        }
        
    } catch (error) {
        console.error("Errore API Meteo: ", error.message);
    }
}

async function run_auto_gatti(dry) {
    let timestamp = new Date()
    console.log((dry ? "[DRY]" : "")+"[GATTI] Starting daily job at "+timestamp.toLocaleString('it-IT', { timeZone: 'Europe/Rome' , month: "2-digit", day: "2-digit",}));
    try {
        const response = await axios.get("https://api.thecatapi.com/v1/images/search?size=med&mime_types=jpg&order=RANDOM&limit=1", {
            headers: {
                'x-api-key': "live_pAp9sRZcJpGjqi2SkplEVgjFfnXDdPQlpBwhW3cB5fTFQcCWgRc57B82onWEehZn",
            },
        });

        url = response.data[0].url
        //console.log(url)

        const fileName = url.split("images/")[1]
        //console.log("nome: "+fileName)

        const response_img = await axios.get(url, { responseType: 'arraybuffer' });
        const directory = path.join(__dirname, '/public/media/uploads');
        const filePath = path.join(directory, fileName);
        fs.writeFileSync(filePath, Buffer.from(response_img.data));
        //console.log(`Image saved at: ${filePath}`);

        body = {
            tipo_destinatari: "canali",
            destinatari: ["$gatti"],
            contenuto: "img",
            user_id: "robosquealer",
            path: fileName,
            timestamp: timestamp.getTime()
        }

        if(!dry){
            console.log("Aggiungo squeal gatti")
            await mymongo.add_squeal(body, mongoCredentials)
        }
        
    } catch (error) {
        console.error('Errore API gatti: ', error.message);
    }
}

const daily_meteo = schedule.scheduleJob({ hour: 9, minute: 0, tz: 'Europe/Rome' }, () => {
   run_daily_meteo(false)
});

const auto_gatti = schedule.scheduleJob({ hour: 8, minute: 0, tz: 'Europe/Rome' }, () => {
    run_auto_gatti(false);
});

/* ========================== */
/*                            */
/*           PAGINE           */
/*                            */
/* ========================== */

app.get('/', function (req, res) {
	if(!req.session || !req.session.userid || req.session.level<2) {res.redirect("/login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/login")
	} else {res.sendFile(global.rootDir+"/public/html/feed.html")}
})

app.get('/app', function (req, res) {
	if(!req.session || !req.session.userid) {res.sendFile(global.rootDir+"/public/html/app-feed.html")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.sendFile(global.rootDir+"/public/html/app-feed.html")
	} else {res.sendFile(global.rootDir+"/public/html/app-feed-log.html")}
})

app.get('/editor', function (req, res) {
	if(!req.session || !req.session.userid || req.session.level<2) {res.redirect("/login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/login")
	} else {res.sendFile(global.rootDir+"/public/html/editor.html")}
})

app.get('/app-editor', function (req, res) {
	if(!req.session || !req.session.userid) {res.redirect("/app-login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/app-login")
	} else {res.sendFile(global.rootDir+"/public/html/app-editor.html")}
})

app.get('/app-chat', function (req, res) {
	if(!req.session || !req.session.userid) {res.redirect("/app-login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/app-login")
	} else {res.sendFile(global.rootDir+"/public/html/app-chat.html")}
})

app.get('/settings', function (req, res) {
	if(!req.session || !req.session.userid || req.session.level<2) {res.redirect("/login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/login")
	} else {res.sendFile(global.rootDir+"/public/html/settings.html")}
})

app.get('/app-settings', function (req, res) {
	if(!req.session || !req.session.userid) {res.redirect("/app-login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/app-login")
	} else {res.sendFile(global.rootDir+"/public/html/app-settings.html")}
})

app.get('/register', function (req, res) {
	if(!req.session || !req.session.userid || req.cookies.username == "null") {
		res.sendFile(global.rootDir+"/public/html/register.html")
	} else if(!req.cookies || !req.cookies.username) {
		req.session.destroy()
		res.sendFile(global.rootDir+"/public/html/register.html")
	} else {res.redirect("/")}
})

app.get('/app-register', function (req, res) {
	if(!req.session || !req.session.userid || req.cookies.username == "null") {
		res.sendFile(global.rootDir+"/public/html/app-register.html")
	} else if(!req.cookies || !req.cookies.username) {
		req.session.destroy()
		res.sendFile(global.rootDir+"/public/html/app-register.html")
	} else {res.redirect("/app")}
})

app.get('/login', function (req, res) {
	if(!req.session || !req.session.userid || req.session.level<2) {
		res.sendFile(global.rootDir+"/public/html/login.html")
	} else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.sendFile(global.rootDir+"/public/html/login.html")
	} else {res.redirect("/")}
})

app.get('/app-login', function (req, res) {
	if(!req.session || !req.session.userid) {
		res.sendFile(global.rootDir+"/public/html/app-login.html")
	} else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.sendFile(global.rootDir+"/public/html/app-login.html")
	} else {res.redirect("/app")}
})

app.get('/mod-login', function (req, res) {
	if(!req.session || !req.session.userid || req.session.level<3) {
		res.sendFile(global.rootDir+"/public/html/mod-login.html")
	} else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.sendFile(global.rootDir+"/public/html/mod-login.html")
	} else {res.redirect("/mod")}
})

app.get('/mod', function (req, res) {
	if(!req.session || !req.session.userid || req.session.level<3) {res.redirect("/mod-login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/mod-login")
	} else {res.sendFile(global.rootDir+"/public/html/mod.html")}
})

app.get('/logout', function (req, res) {
	req.session.destroy()
	res.redirect("/login")
})

app.get('/app-logout', function (req, res) {
	req.session.destroy()
	res.redirect("/app")
})

app.get('/app', function (req, res) {
	res.sendFile(global.rootDir+"/public/html/app-feed.html")
})

app.get('/app-search', function (req, res) {
	if(!req.session || !req.session.userid) {res.redirect("/app-login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/app-login")
	} else {res.sendFile(global.rootDir+"/public/html/app-search.html")}
})

app.get('/app-notify', function (req, res) {
	if(!req.session || !req.session.userid) {res.redirect("/app-login")}
	else if(!req.cookies || !req.cookies.username || req.cookies.username == "null") {
		req.session.destroy()
		res.redirect("/app-login")
	} else {res.sendFile(global.rootDir+"/public/html/app-notify.html")}
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
app.get('/db/squeal', async function(req, res) {
	res.send(await mymongo.search_messaggio(req.query, mongoCredentials))
});

//tabella canale o singolo canale da nome
app.get('/db/channel', async function(req, res) {
	res.send(await mymongo.search_canale(req.query, mongoCredentials))
});

//tabella notifica
app.get('/db/notification', async function(req, res) {
	res.send(await mymongo.search_notifica(req.query, mongoCredentials))
});

//tabella chat
app.get('/db/chat', async function(req, res) {
	res.send(await mymongo.search_chat(req.query, mongoCredentials))
});

// dry daily run
app.get('/db/dry_daily', async function(req, res) {
	res.send(await mymongo.daily(false, mongoCredentials))
});

// dry weekly run
app.get('/db/dry_weekly', async function(req, res) {
	res.send(await mymongo.weekly(false, mongoCredentials))
});

// dry monthly run
app.get('/db/dry_monthly', async function(req, res) {
	res.send(await mymongo.monthly(false, mongoCredentials))
});

// dry meteo run
app.get('/db/dry_pop', async function(req, res) {
	res.send(await mymongo.pop(false, mongoCredentials))
});

// dry meteo run
app.get('/db/dry_meteo', async function(req, res) {
	run_daily_meteo(true)
    res.send("ok")
});

// dry gatti run
app.get('/db/dry_gatti', async function(req, res) {
	run_auto_gatti(true)
    res.send("ok")
});

/* ========================== */
/*                            */
/*          RISORSE           */
/*                            */
/* ========================== */

// ========================== USER

// user abilitato
//body set_to:true|false
app.post('/user/:user_id/abilitato', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("abilitato")
    try{
        const user_id = req.params.user_id
        response = await mymongo.user_abilitato(req.body, user_id, mongoCredentials)

        if(response["risultato"] === "successo"){
            res.status(200)
            res.send(response)
        }
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// get followers
app.get('/user/:user_id/followers', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("followers")
    try{
        const user_id = req.params.user_id
        response = await mymongo.user_get_followers(user_id, mongoCredentials)

        if(response["risultato"] === "successo"){
            res.status(200)
            res.send(response)
        }
    } catch (e){
        console.log(e)
        res.status(500)
        res.send(response)
    }
});

// get quota
app.get('/user/:user_id/quota', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("quota")
    try{
        const user_id = req.params.user_id
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
        response = await mymongo.user_toggle_follow(user_id, req.body, mongoCredentials)

        if(response["risultato"] === "added" || response["risultato"] === "removed"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] === "username/canale non trovato"){
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

        response = await mymongo.user_feed(user_id, mongoCredentials)

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
app.post('/user/:user_id/managed_by', upload.none() , async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("set smm")
    try{
        const user_id = req.params.user_id

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
//tipo: "profilo"|"account"
//caso profilo: nome, cognome, bio (img passato come file e ottenuto come path)
//caso account: email, password, old_password
app.post('/user/:user_id/settings', upload.single("img"), async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    try{
        if(req.file){ //sto cambiando anche immagine profilo
            let path = req.file.path
            req.body["path"] = path.split("/").slice(-1)[0]
        }

        const user_id = req.params.user_id
        if(req.body.nome){ //caso profilo
            req.body["nome"] += " "+req.body["cognome"]
            req.body.tipo = "profilo"
        } else {
            req.body.tipo = "account"
        }
        response = await mymongo.user_update(user_id, req.body, mongoCredentials)
        console.log("risposta = " + response)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] == "username non trovato"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        } else if(response["risultato"] == "password non corretta"){
            response["errore"] = "errore"
            res.status(401)
            res.send(response)
        }
    } catch (e){
        res.status(500)
        res.send({"errore":e})
    }
});

// get chat
// req query:
//  current_user
app.get('/user/chat/:user_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("get chat")
    try{
        const user_id = req.params.user_id //target user
        response = await mymongo.get_chat(user_id, req.query, mongoCredentials)

        if(response["risultato"] === "successo"){
            res.status(200)
            res.send(response)
        } else if(response["risultato"] === "chat non trovata"){
            res.status(409)
            res.send(response)
        } else if(response["risultato"] === "utente inesistente"){
            res.status(404)
            res.send(response)
        } 
    } catch (e){
        //response["errore"] = e.toString()
        res.status(500)
        res.send(response)
    }
});

// post chat
// req body:
//  current_user, text
app.post('/user/chat/:user_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("get chat")
    try{
        const user_id = req.params.user_id //target user
        response = await mymongo.post_chat(user_id, req.body, mongoCredentials)

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
// body password: string
app.delete('/user/:user_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("del user")
    try{
        const user_id = req.params.user_id

        response = await mymongo.user_delete(user_id, req.body, mongoCredentials)

        if(response["risultato"] === "successo"){
            res.status(200)
            req.session.destroy()
            res.send(response)
        } else if(response["risultato"] === "password errata"){
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


// login
app.post('/user/login', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    console.log("login")
    try{
        response = await mymongo.user_login(req.body, mongoCredentials)

        if(response["risultato"] === "successo"){
            session=req.session; //login riuscito
            session.userid=req.body.username;
            let level = 1
            if (response.data.professional_flag) level = 2
            if (response.data.redazione_flag) level = 3
            session.level = level
            console.log(req.session)
            res.cookie('username', session.userid)
            res.cookie('nome', response["data"]["nome"])
            res.cookie('img', response["data"]["img"])
            res.cookie('tipo', (response["data"]["professional_flag"] === true ? "pro": "base"))
            res.cookie('login_result', "success")
            res.cookie('quota_g', response["data"]["quota"]["g"])
            res.cookie('quota_s', response["data"]["quota"]["s"])
            res.cookie('quota_m', response["data"]["quota"]["m"])
            res.clearCookie('managed')
            //res.redirect("/")
            res.status(200)
            res.send(response)
        } else if(response["risultato"] === "username/password errati"){
            response["errore"] = "errore"
            res.status(401)
            res.send(response)
        } else if(response["risultato"] === "unauthorized"){
            response["errore"] = "errore"
            res.status(403)
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

// feed non loggato
app.get('/squeal/feed', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    
    try{
        response = await mymongo.feed_nolog(mongoCredentials)

        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        }/* else if(response["risultato"] == "keyword non trovata"){
            response["errore"] = "errore"
            res.status(404)
            res.send(response)
        }*/
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
        const squeal_id = req.params.squeal_id
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


// modify squeal by id
//body: reac{}, destinatari[]
app.post('/squeal/:squeal_id', async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        const squeal_id = req.params.squeal_id

        response = await mymongo.modify_squeal(req.body, squeal_id, mongoCredentials)

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

// add post
app.post('/squeal', upload.single("img"), async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}
    
    try{
        
        if(req.body.contenuto == "img"){//caso immagine
            let path = req.file.path
            req.body["path"] = path.split("/").slice(-1)[0]
        }
        
        req.body.destinatari = JSON.parse(req.body.destinatari)

        //timestamp
        let date = new Date()
        req.body.timestamp = date.getTime();
        console.log(JSON.stringify(req.body))

        response = await mymongo.add_squeal(req.body, mongoCredentials)

        //ghigliottina
        console.log(JSON.stringify(response))
        /*console.log(req.body.parole)
        console.log(typeof req.body.parole)*/
        let post_id = response.data
        if(req.body.ghigliottina){
            const ghigliottina = {
                "parole" : req.body.parole.split(", "),
                "soluzione" : req.body.soluzione,
                "counter": 5,
                "timer": req.body.timer,
                "ref_id": post_id,
                "job": null,
                "mongoCredentials": mongoCredentials
            }

            ghigliottina.job = schedule.scheduleJob(`*/${ghigliottina.timer} * * * *`, () => {
                try{
                    let dt = new Date()
                    if (ghigliottina.counter > 0) {
                        const nextElement = ghigliottina.parole[5-ghigliottina.counter];
                        //console.log(nextElement+" time: "+dt.toLocaleString('it-IT', { timeZone: 'Europe/Rome' , month: "2-digit", day: "2-digit",}));
                        //console.log("aggiungo commento a post "+ghigliottina.ref_id)
                        
                        body = {
                            post_id: ghigliottina.ref_id,
                            tipo_destinatari: null,
                            destinatari: [],
                            contenuto: "testo",
                            user_id: "ghigliottinabot",
                            textarea: `La parola #${6-ghigliottina.counter} è: ${nextElement}`,
                            timestamp: dt.getTime()
                        }

                        mymongo.add_squeal(body, ghigliottina.mongoCredentials)

                    } else if (ghigliottina.counter === 0) {
                        //console.log("fine partita, la soluzione e "+ghigliottina.soluzione+" time: "+dt.toLocaleString('it-IT', { timeZone: 'Europe/Rome' , month: "2-digit", day: "2-digit",}))
                        //console.log("aggiungo commento a post "+ghigliottina.ref_id)

                        body = {
                            post_id: ghigliottina.ref_id,
                            tipo_destinatari: null,
                            destinatari: [],
                            contenuto: "testo",
                            user_id: "ghigliottinabot",
                            textarea: `TEMPO SCADUTO! La soluzione è: ${ghigliottina.soluzione}`,
                            timestamp: dt.getTime()
                        }
    
                        mymongo.add_squeal(body, ghigliottina.mongoCredentials)

                        ghigliottina.job.cancel();
                    }
                    ghigliottina.counter--;
                } catch(e) {
                    console.log(e)
                }
            })
            ghigliottine.push(ghigliottina)
            //console.log("start game")
        }


        if(response["risultato"] == "successo"){
            res.status(200)
            res.send(response)
        }
    } catch (e){
        console.log(e)
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
//body: req.descrizione, req.file(->path), req.modlist
app.post('/channel/:channel_id', upload.single("img"), async function(req, res) {
    let response = {"data": null, "risultato": null, "errore": null}

    try{
        const channel_id = req.params.channel_id
        if(req.file){ //sto cambiando anche immagine profilo
            let path = req.file.path
            req.body["path"] = path.split("/").slice(-1)[0]
        }

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
        const channel_id = req.params.channel_id
        response = await mymongo.channel_delete(channel_id, mongoCredentials)

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
//body: nome, userid, descrizione, ufficiale
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
