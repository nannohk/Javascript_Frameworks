const express = require('express');
const app = express();
const cors = require('cors')
app.use(cors());
app.set('port', '1500');
app.use(express.json({ limit: '1mb' }));
app.listen(1500, () => console.log('Server running on port 1500'));

/***************************************************************************************************** */
//Database information
// db.run('CREATE TABLE users (email Varchar2(100) PRIMARY KEY, password Varchar2(100))');
// db.close((err) => {
//     if (err) return console.error(err.message);
// });

let authStatus = false;
const sqlInt = `INSERT INTO users (email, password) VALUES(?,?)`;
const sqlSelect = `SELECT email, password FROM users WHERE email = ? and password = ?`;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./datastore/serverDB.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to the project database.');
});

function insertData(email, password) {
    db.run(sqlInt, [email, password],
        function (err) {
            if (err) return console.error(err.message);
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
}

function selectData(email, password) {
    return new Promise((resolve, reject) => {
        db.all(sqlSelect, [email, password], (err, rows) => {
            if (err || rows.length == 0) {
                reject({
                    message: err,
                    auth: false
                });
            }
            else {
                resolve({
                    message: rows,
                    auth: true
                });
            }
        });
    });
}
/******************************************************************************************************* */



app.post('/', (request, response) => {

    //insert data passed from client to database
    if (request.body.purpose == "signup") {
        insertData(request.body.email, request.body.password);
        response.json({
            status: ' creation success',

        });
    }
    else if (request.body.purpose == "login") {
        console.log("login request");
        selectData(request.body.email, request.body.password).then((sol) => {
            console.log("login success");
            response.json({
                status: 'success',
            });
        }).catch((err) => {
            console.log("login failed");
            response.json({
                status: 'failed',
            });
        });
    }
});