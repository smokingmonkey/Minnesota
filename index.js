const express = require('express');
const dataStore = require('nedb');
const app = express();
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening at ${port}`));
app.use(express.static('public'));
app.use(express.json());

const dataBase = new dataStore('database.db');
dataBase.loadDatabase();

app.post('/api', (request, response) => {
    //console.log('I got a request!');
    const data = request.body;
    dataBase.insert(data);
    
});

