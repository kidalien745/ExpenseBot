var async = require('async');

var GoogleSpreadsheet = require('google-spreadsheet');
//var doc = new GoogleSpreadsheet(process.env.GS_SHEET_ID);
// var creds_json = {
//     client_email: process.env.GS_CLIENT_EMAIL,
//     private_key: process.env.GS_PRIVATE_KEY
// }
// We should check if a local file exists for this data, then default to Heroku
var doc = new GoogleSpreadsheet('15IVNMC7DH-XIiw-6T0hmszZYHrqG3Z_fv5yFvzmMnDU');
var creds_json = {
    client_email: 'expensebot@expensebot-177921.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCzozpt68opTzWB\nYY57+pRQJkymQF41bHzVW/ao575Sn/Nu+HMZxtxS90V5rxuVVjf+qgN17OxvSVMq\n029049OSQ+ZSXaasCcqa6PgHBm/sZwGEHkifWOA/YUtqcUAVNPetvigugJe4Ajdf\na5EFv0skpJrT0KhnKpWUth/salNVukJb3tJowb5lm7w5RFKrq5W53x3VLcrEGNcH\ngoyphrtUT03B91V+8tZZq1OH4TzQO7vsF1uF4/ns/FMRs100aaKGiORZD4kyBjO0\n39G2cpIJ+hQUo+e67jVe56zaXTdRrea4c4zW378linsUY7DM8+UHzUmOzshrPTDh\ncSQQUM/FAgMBAAECggEAA6l4L3V3EZCDzrdmaDCbhWbCeUEmqoAjq1XMmXTf9F8+\nXyzBa+0Z4LcZu3lOXqT7Tz24BFdoGnysLVtSElfyoDCyKUuvciJg9vd41uvSrEcN\nSNw1LsppB+G739efLs99nRUbTJdigGXLKy7OLgfQSFbysQ634CKGGhn8XJ1uRXkV\n0sU1ySQk6Wz60mJJR08VK3oY1JuBbqnlK6imqfRdt1luLf8o9JMGWEC3BktYqSaE\nKDyAG1x5MFq4rc6Cw1u7ot4rwde+EbK8K4XdbZCo8yC7Bin9QrMDPBKg6SO7MRoX\n1bujk8KIUnytg8vpyJWBjgyE2KFKxEOJp7fmKbfpoQKBgQDZHW9IHMdidDPtaK1S\nKBtfwqSRCXUZef6HRaufjoHHBrlgoWCJDJ25mGZZMJ8dkkHacIquUfnuJwB//qQX\np092wirrApMVdCwsugb8l6m41rTDGZjkELzMXJPWL0GGIVmw3pzOMeHbXA1YVONQ\nhERdiOElhhWQ8QOAsSF84y07twKBgQDTz3uyeBAxfIpAX7T1ekvnS646Q/4M2Y+c\n32H6ZxXhMigHTAVe5Io0p2PGaTL+MFZfbBgbmb5AgECbyaJS/Utq4q3zNBdLm/kY\nLQs8s9h2Xd72v9S0ljZnpsLJrtFIBe1TAo/6i0tJiCXCFRJ38vo7s2lJXuyvg79z\nx8YYTbMIYwKBgQDM4/k7jWUf5VeHyQwfhxfmM9KHyOwIIddwovAGgD66qv7QURq/\n2vcRyd90de0CxB5/XUuSnGwHMilHoPAMHmlgQnasF17klSCHCPtE7n9NntkxcPuW\n5rC1Dvy42Rm10c1Jm5tQ/0QMdf9mB54JQvkdZ+pJNhMuGDRdA0v+BomOWwKBgQCc\nP013nPwNFVsDG9bo0vuVNw3ia2/IWOGJDnw/dLX+Nrqyj1DS7HJLX0PKBKaaPlwo\n7htmmOZwvGtswLRe1f1BbtB1PPMGUpvRSsEkWWMQBjVI/r/RK5Icqja9ApndsIme\nl6BQaVrzdlysLFFAbNxNGA9OEZk17FFZ/n/SQ9cTEwKBgQDVtTdFF0v+K0reg/Ql\npLJeok+ZcPEyn8A+A432v08l9OThE5aNDqeTFB9dhZmz2wYy0kQjdbrTGF1mEs2J\nzOsWxQhuCe/ytVX56wJojDd1MDETumcuIYuBfKmATC7Qa0IR+GgRHaJ80DbtkrUL\nqVEo/wZgXme0pGgGPsIW48NzFw==\n-----END PRIVATE KEY-----\n'
}
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
                row['p'+i.toString()] = tagged[i].trim();
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