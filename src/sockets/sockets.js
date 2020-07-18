const SocketIO = require('socket.io');
const bot = require('../bot/bot');
let logged_conectionIDs = [];
let chat_logged_users = 0;
let bot_online_users = 0;

const start = (server) => {
    const ioSockets = SocketIO(server);
    
    function updateCounter (logStatus, socketID) {
        if (logStatus == 'login') {
            logged_conectionIDs.push(socketID);
        } else {
            let index = logged_conectionIDs.indexOf(socketID);
            if (index > -1) {
                logged_conectionIDs.splice(index, 1);
            }
        }
        chat_logged_users = logged_conectionIDs.length;
        bot.getOnlineUsers().then(online_users => {
            bot_online_users = online_users
            ioSockets.emit('chat-users', bot_online_users + chat_logged_users)
        });
    }

    ioSockets.on('connect', (socket) => {
        socket.on('login', (user) => {
            socket.broadcast.emit('user-login-message', user);
            updateCounter('login', user.socketID);
            bot.sendLoginUser(user.color, user.username, bot_online_users + chat_logged_users);
        });

        socket.on('logout', (user) => { updateCounter('logout', user.socketID); });
        socket.on('disconnect', () => { updateCounter('logout', socket.id); });
    
        socket.on('client-message', (message) => { 
            ioSockets.emit('server-message', message);
            bot.sendMessage(message.color, message.author, message.content);
        });

        socket.on('typing', (username) => { socket.broadcast.emit('typing', username); });
    });
    
    bot.getMessage(ioSockets);
    bot.getLoginUser(ioSockets);
}
module.exports = {start}