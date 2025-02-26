const express = require('express');
const mariadb = require('mariadb');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000;

const pool = mariadb.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'abhinil',
    password: 'secret',
    database: 'hw2',
    connectionLimit: 5
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

const instance = 'http://34.60.162.86:3000';

app.post('/add', async(req, res) => {
    const username = await req.body.username;
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('INSERT INTO Users (username) VALUES (?)', [username]);
        res.status(200).send('User added successfully!');
    }
    catch (err) {
        res.status(500).send(`Error adding customer: ${err}`);
    } 
    finally {
        if(conn) conn.release()
    }
})

app.get('/greeting', async (req, res) => {
    try { 
        res.render('index');
    }
    catch(err) {
        res.status(500).send('Error retrieving customers: $(err)');
    }
});

app.post('/register', async(req, res) => {
    const username = await req.body.username;
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('INSERT INTO Users (username) VALUES (?)', [username]);
        await axios.post(`${instance}/add`, { username : username });
        res.status(200).send('User added successfully!');
    }
    catch (err) {
        res.status(500).send(`Error adding customer: ${err}`);
    } 
    finally {
        if(conn) conn.release()
    }
})

app.get('/list', async(req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        
        const rows = await conn.query('SELECT * FROM Users');
        const usernames = rows.map(row => row.username);
        res.json({ users: usernames });
    }
    catch (err) {
        res.status(500).send(`Error getting all users`);
    }
    finally {
        if(conn) conn.release()
    }
})

app.post('/clear', async(req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM Users');

        res.status(200).send('Users deleted successfully!');
    }
    catch (err) {
        res.status(500).send(`Error adding customer: ${err}`);
    } 
    finally {
        if(conn) conn.release()
    }
})
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

