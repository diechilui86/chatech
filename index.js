const express = require('express');
const path = require('path');
const app = express();
const sockets = require('./src/sockets/sockets');
const bot = require('./src/bot/bot');

//Express
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
const server = app.listen(app.get('port'), () => { 
    console.log('server on port', app.get('port')); 
});

sockets.start(server);
bot.start();