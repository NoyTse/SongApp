const port = process.env.PORT || 5000;
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');

//mongoDB variables
const MongoClient = require('mongodb').MongoClient;
const dbUser = "NoyTse";
const dbPass = "Noynoy22";
const connectionString = "mongodb://NoyTse:Noynoy22@ds141889.mlab.com:41889/firstdb";
const collectionName = 'SongList';
var db;
var ObjectID = require('mongodb').ObjectID;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('Client/build'));

MongoClient.connect(connectionString, (err, mongoDBService) => {
    if (err) return console.log(err);
    db = mongoDBService.db('firstdb').collection(collectionName);
    server.listen(port, () => {
        console.log('Listen >>\tlistening on ' + port);
    });
});

//app.use(express.static('public'));

//-----HTTP Requests / Routes
app.get('/', function(request, response) {
    response.sendFile('Client/build', 'index.html');
});

app.post('/api/addSong', (req, res) => {
    db.insertOne(req.body, (err, result) => {
        if (err) return console.log(err);

        console.log("POST: /addSong >>\tsaved");
        res.redirect('/');
    });
});

app.get('/api/songlist', (req, res) => {
    db.find().toArray(function(err, records){
        if (err) return console.log(err);
        res.json(records);
    });

});

app.delete('/api/:id',(req, res) =>{
   db.deleteOne({_id: new ObjectID(req.params.id)},(err,obj)=>{
       if (err) return console.log(err);
       console.log("1 doc deleted")
    });
});

app.put('/api/:id',(req,res)=>{
    db.updateOne({_id: new ObjectID(req.params.id)},req.body,(err,obj) => {
        if (err) return console.log(err);
        console.log("1 doc updated");
    })
});

app.get("/api/songlist/default", (req, res) => {
    require('fs').readFile('./public/defaultSongList.json','utf8', (err, data) => {
        if (err) return console.log(err);
        res.json(JSON.parse(data));
    });
});

app.get("/api/MaxVote", (req, res) => {
    db.find().sort({Votes: -1}).limit(3).toArray(function (findAllErr, record) {
        if (findAllErr) return console.log(findAllErr);

        res.json(record);
    });
});

function getListFromDbAndEmitToClients(group) {
    db.find().toArray(function (findAllErr, records) {
        if (findAllErr) return console.log(findAllErr);

        console.log("about to emit refresh");
        if (group == "ALL")
            io.emit("refreshSongList", records);
        else
            io.to(group).emit("refreshSongList", records);
    });
}

//----Socket handlers
io.on('connection', function(client) {
    client.on('join', function(data) {
        console.log("join: " + data);
        client.join(data);
        db.find().toArray(function (findAllErr, records) {
            if (findAllErr) return console.log(findAllErr);

            console.log("about to emit refresh to the client " + data);
            //client.emit("refreshSongList", records);
            getListFromDbAndEmitToClients("DotNet");
        });
    });

    client.on('vote',(id)=>{
        const query = {_id: new ObjectID(id)};
       db.find(query).toArray((err, findResult) =>{
            if (err) console.log(err);
            const setParam = {$set: {Votes: findResult[0].Votes + 1}};
            db.updateOne(query,setParam,(updateErr, res) => {
                if (updateErr) console.log(updateErr);

                getListFromDbAndEmitToClients("web");
            });
       });
    });

    //--- DotNet Events


    client.on("addSong", (songJson)=>{
        var songObject = JSON.parse(songJson);
        delete songObject["_id"];
        console.log(songObject);
        db.insertOne(songObject, (err, result) => {
            if (err) return console.log(err);

            console.log("addSong >>\tsaved");
            getListFromDbAndEmitToClients("ALL");

        });
    })

    client.on("updateSong", (songJson)=>{
        var songObject = JSON.parse(songJson);
        var songID = songObject._id;
        delete songObject["_id"];
        var updateCmd = {$set: songObject};
        console.log(songObject);

        db.updateOne({_id: new ObjectID(songID)},updateCmd,(err,obj) => {
            if (err) return console.log(err);

            console.log("1 doc updated");
            getListFromDbAndEmitToClients("web");
        })
    })

    client.on("deleteSong", (songID) => {
        db.deleteOne({_id: new ObjectID(songID)},(err,obj)=>{
            if (err) return console.log(err);

            console.log("1 doc deleted")
            getListFromDbAndEmitToClients("web");
        });
    })

    client.on("clearVotes", ()=>{
       db.updateMany({},{$set: {Votes: 0}},(err,res)=>{
           console.log("Clear Votes Successed")
           getListFromDbAndEmitToClients("web");
       }) ;
    });

});


