const discord = require('discord.js');
const config = require("./config.json");
const client = new discord.Client();
const guildID = '692480033343668284';
const channelID = '728999445324365854';
const botNickname = '-------👥-------';
let botMember;
let botGuild;
let botChannel;

const start = () => {
    client.once('ready', () => {
        botGuild = client.guilds.cache.get(guildID);
        botChannel = client.channels.cache.get(channelID);
        botMember = client.guilds.cache.get(guildID).me;
        botMember.setNickname(botNickname).then(console.log(`bot: "${client.user.username}" con nickname: "${botMember.nickname}" ¡listo!`));
    });
};

const getOnlineUsers = async () => {
    try {
        if(!client.uptime) return 0;
        let members = await botGuild.members.fetch()
        const totalOnline = members.filter(member => member.presence.status === 'online');
        return totalOnline.size
    } catch(error) {
		console.error(error);
	}
};

const getLoginUser = (ioSockets) => {
    client.on ('presenceUpdate', (oldPresence, newPresence) => {
        if(`${newPresence.guild.id}` !== guildID) return;
        if(newPresence.status === 'online') ioSockets.emit('user-login-message', {color: '#ffffff', username: newPresence.member.displayName});
        getOnlineUsers().then(online_users => ioSockets.emit('bot-online-users', online_users));
    })
};

const sendLoginUser = (color, username, logged_users) => {
    if(!client.uptime) return;
    let embebMessage = new discord.MessageEmbed()
        .setColor(`${color}`)
        .setDescription(`"**${username}**" ha ingresado al chat`);
    botMember.setNickname(`👥-------${logged_users}-------`)
        .then(botChannel.send(embebMessage));
};

const getMessage = (ioSockets) => {
    client.on('message', (message) => {
        if(message.channel.id == channelID) {
            if (message.author.bot) return;
            ioSockets.emit('server-message', {
                author: message.author.username,
                content: message.content
            });
        }
    });
};

const sendMessage = (color, author, content) => {
    let embebMessage = new discord.MessageEmbed()
        .setColor(`${color}`)
        .setTitle(`**${author}**`)
        .setDescription(`${content}`);
    botChannel.send(embebMessage);
};

client.login(config.token);
module.exports = {start, getMessage, sendMessage, getLoginUser, sendLoginUser ,getOnlineUsers};