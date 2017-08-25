var http = require('http');
var director = require('director');
var bot = require('./bot.js');
var sheet = require('./sheets.js');
var port = process.env.PORT || 1337;

var router = new director.http.Router({
    '/': {
        get: ping,
        post: bot.respond
    },
    '/sheet': {
        get: sheet.updateSheet
    }
});

server = http.createServer(function (req, res) {

    req.chunks = [];
    req.on('data', function (chunk) {
        req.chunks.push(chunk.toString());
    });

    router.dispatch(req, res, function (err) {
        res.writeHead(err.status, { 'Content-Type': 'text/plain' });
        res.end(err.message);
    });


});

server.listen(port);

function ping() {
    this.res.writeHead(200);
    this.res.end("This is a success!\n");
}