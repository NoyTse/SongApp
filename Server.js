const port = 5000;
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


MongoClient.connect(connectionString, (err, mongoDBService) => {
    if (err) return console.log(err);
    db = mongoDBService.db('firstdb').collection(collectionName);
    server.listen(port, () => {
        console.log('Listen >>\tlistening on ' + port);
    });
});

app.use(express.static('public'));

//-----HTTP Requests / Routes

app.get('/', (req, res) => {
    res.send("Welcome the Server!");
});

app.post('/addSong', (req, res) => {
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

app.put('api/:id',(req,res)=>{
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

function getListFromDbAndEmitWebClients() {
    db.find().toArray(function (findAllErr, records) {
        if (findAllErr) return console.log(findAllErr);
        console.log("about to emit refresh");
        io.to("web").emit("refreshSongList", records);
    });
}

//----Socket handlers
io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);
        console.log("join: " + data);
        client.join(data);
    });

    client.on('vote',(id)=>{
        const query = {_id: new ObjectID(id)};
       db.find(query).toArray((err, findResult) =>{
            if (err) console.log(err);
            const setParam = {$set: {Votes: findResult[0].Votes + 1}};
            db.updateOne(query,setParam,(updateErr, res) => {
                if (updateErr) console.log(updateErr);

                getListFromDbAndEmitWebClients();
            });
       });
    });

    //--- DotNet Events
    client.on("getSongList", () => {
        db.find().toArray(function(findAllErr, records){
            if (findAllErr) return console.log(findAllErr);
            console.log("about to emit DotNet hi");
            io.to("DotNet").emit("updateSongList",JSON.stringify(records));
        });
    })

    client.on("addSong", (songJson)=>{
        var songObject = JSON.parse(songJson);
        delete songObject["_id"];
        console.log(songObject);
        db.insertOne(songObject, (err, result) => {
            if (err) return console.log(err);

            console.log("addSong >>\tsaved");
            getListFromDbAndEmitWebClients();

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
            getListFromDbAndEmitWebClients();
        })
    })

    client.on("deleteSong", (songID) => {
        db.deleteOne({_id: new ObjectID(songID)},(err,obj)=>{
            if (err) return console.log(err);

            console.log("1 doc deleted")
            getListFromDbAndEmitWebClients();
        });
    })

    client.on("clearVotes", ()=>{
       db.updateMany({},{$set: {Votes: 0}},(err,res)=>{
           console.log("Clear Votes Successed")
           getListFromDbAndEmitWebClients();
       }) ;
    });

});

