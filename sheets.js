var async = require('async');

var GoogleSpreadsheet = require('google-spreadsheet');
var doc = new GoogleSpreadsheet('55c94e067b649699ddda5f76c3dea2b5c70b3f05');
var sheet;
var creds_json = {
    client_email: 'expensebot@expensebot-177921.iam.gserviceaccount.com',
    private_key: 'MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCzozpt68opTzWB\nYY57+pRQJkymQF41bHzVW/ao575Sn/Nu+HMZxtxS90V5rxuVVjf+qgN17OxvSVMq\n029049OSQ+ZSXaasCcqa6PgHBm/sZwGEHkifWOA/YUtqcUAVNPetvigugJe4Ajdf\na5EFv0skpJrT0KhnKpWUth/salNVukJb3tJowb5lm7w5RFKrq5W53x3VLcrEGNcH\ngoyphrtUT03B91V+8tZZq1OH4TzQO7vsF1uF4/ns/FMRs100aaKGiORZD4kyBjO0\n39G2cpIJ+hQUo+e67jVe56zaXTdRrea4c4zW378linsUY7DM8+UHzUmOzshrPTDh\ncSQQUM/FAgMBAAECggEAA6l4L3V3EZCDzrdmaDCbhWbCeUEmqoAjq1XMmXTf9F8+\nXyzBa+0Z4LcZu3lOXqT7Tz24BFdoGnysLVtSElfyoDCyKUuvciJg9vd41uvSrEcN\nSNw1LsppB+G739efLs99nRUbTJdigGXLKy7OLgfQSFbysQ634CKGGhn8XJ1uRXkV\n0sU1ySQk6Wz60mJJR08VK3oY1JuBbqnlK6imqfRdt1luLf8o9JMGWEC3BktYqSaE\nKDyAG1x5MFq4rc6Cw1u7ot4rwde+EbK8K4XdbZCo8yC7Bin9QrMDPBKg6SO7MRoX\n1bujk8KIUnytg8vpyJWBjgyE2KFKxEOJp7fmKbfpoQKBgQDZHW9IHMdidDPtaK1S\nKBtfwqSRCXUZef6HRaufjoHHBrlgoWCJDJ25mGZZMJ8dkkHacIquUfnuJwB//qQX\np092wirrApMVdCwsugb8l6m41rTDGZjkELzMXJPWL0GGIVmw3pzOMeHbXA1YVONQ\nhERdiOElhhWQ8QOAsSF84y07twKBgQDTz3uyeBAxfIpAX7T1ekvnS646Q/4M2Y+c\n32H6ZxXhMigHTAVe5Io0p2PGaTL+MFZfbBgbmb5AgECbyaJS/Utq4q3zNBdLm/kY\nLQs8s9h2Xd72v9S0ljZnpsLJrtFIBe1TAo/6i0tJiCXCFRJ38vo7s2lJXuyvg79z\nx8YYTbMIYwKBgQDM4/k7jWUf5VeHyQwfhxfmM9KHyOwIIddwovAGgD66qv7QURq/\n2vcRyd90de0CxB5/XUuSnGwHMilHoPAMHmlgQnasF17klSCHCPtE7n9NntkxcPuW\n5rC1Dvy42Rm10c1Jm5tQ/0QMdf9mB54JQvkdZ+pJNhMuGDRdA0v+BomOWwKBgQCc\nP013nPwNFVsDG9bo0vuVNw3ia2/IWOGJDnw/dLX+Nrqyj1DS7HJLX0PKBKaaPlwo\n7htmmOZwvGtswLRe1f1BbtB1PPMGUpvRSsEkWWMQBjVI/r/RK5Icqja9ApndsIme\nl6BQaVrzdlysLFFAbNxNGA9OEZk17FFZ/n/SQ9cTEwKBgQDVtTdFF0v+K0reg/Ql\npLJeok+ZcPEyn8A+A432v08l9OThE5aNDqeTFB9dhZmz2wYy0kQjdbrTGF1mEs2J\nzOsWxQhuCe/ytVX56wJojDd1MDETumcuIYuBfKmATC7Qa0IR+GgRHaJ80DbtkrUL\nqVEo/wZgXme0pGgGPsIW48NzFw=='
}

function updateSheet() { 
    async.series([
        function setAuth(step) {
            doc.useServiceAccountAuth(creds_json, step);
        },
        function getInfoAndSheet(step) {
            doc.getInfo(function (err, info) {
                console.log('Loaded doc: '+info.title+' by '+info.author.email);
                sheet = info.worksheets[0];
            });
        },
        function workingWithRows(step) {
            sheet.getRows(function(err, rows) {
                console.log('Read '+rows.length+' rows');

                rows[0].colname = 'new val';
                rows[0].save();

                step();
            });
        },
        function respond(step) {
            console.log("Updated sheet");
            this.res.writeHead(200);
            this.res.end();
        }
    ], function (err) {
        if (err) {
            console.log('Error: '+ err);
        }
    });
}

exports.updateSheet = updateSheet;