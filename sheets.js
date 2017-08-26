var async = require('async');

var GoogleSpreadsheet = require('google-spreadsheet');
var doc = new GoogleSpreadsheet(process.env.GS_SHEET_ID);
var creds_json = {
    client_email: process.env.GS_CLIENT_EMAIL,
    private_key: process.env.GS_PRIVATE_KEY
}
// We should check if a local file exists for this data, then default to Heroku
var sheet;

function updateSheet() { 
    var response = this.res;
    var request = JSON.parse(this.req.chunks[0]),
        botRegex = /@ExpenseBot/;
    var sender, amount, description;
    var tagged = [];

    async.series([
        function checkRequest(step) {
            if (request.text && botRegex.test(request.text)) {
                response.writeHead(200);
                step();
            } else {
                console.log("don't care");
                response.writeHead(200);
                step('We got a message we don\'t care about');
            }
        },
        function parseRequest(step) {
            // Ex - @ExpenseBot $10.99 Giant Swan @Austin Lien @Martha Lien @Lien Photos
            // TODO - Add anybody who likes the message
            var arr = request.text.split(/[@\$]/);
            sender = request.name;
            amount = arr[2].substr(0, arr[2].indexOf(' '));
            description = arr[2].substr(arr[2].indexOf(' ')+1).trim();
            tagged = arr.slice(3);
            step();
        },
        function setupAuth(step) {
            doc.useServiceAccountAuth(creds_json, step); // Set auth info
        },
        function getInfoAndSheet(step) {
            doc.getInfo(function (err, info) {
                console.log('Loaded doc: '+info.title+' by '+info.author.email);
                sheet = info.worksheets[0];

                step(err);
            });
        },
        function createRowObj(step) {
            var row = { 'reportedby' : sender, 'description' : description, 'total' : Number(amount) };
            for (var i = 0; i < tagged.length; i++)
            {
                row['p'+(i+1).toString()] = tagged[i].trim();
            }
            sheet.addRow(row, step);
        },
        function respond(step) {
            console.log("Updated sheet");
            response.end();
        }
    ], function (err) {
        if (err) {
            console.log('Error: '+ err);
            response.end();
        }
    });
}

exports.updateSheet = updateSheet;