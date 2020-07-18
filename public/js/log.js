const socket = io();

let nickname = document.getElementById('username');
let header_username = document.getElementById('chat-user');
let user_icon = document.querySelector('.icon.icon-user');
let login_window = document.getElementById('login-container');
let login = document.getElementById('login-form');
let logout = document.getElementById('logout-button');
let logged_count = document.getElementById('users-count');
let user = {
    username: '',
    color: 'rgba(255,255,255,0.8)',
    socketID: ''
}

function setLogStatus (logStatus) {
    socket.emit(`${logStatus}`, user);
    header_username.innerHTML = user.username;
    if (logStatus == 'login') {
        user_icon.style.color = user.color;
        login_window.style.display = 'none';
    } else {
        user_icon.style.color = 'rgba(255,255,255,0.8)';
        login_window.style.display = 'flex';
    }
}

function setColor() {
    let num = Math.floor((Math.random() * 5) + 1);
    switch(num) {
        case 1:
            document.getElementById('color-red').checked = true;
            break;
        case 2:
            document.getElementById('color-blue').checked = true;
            break;
        case 3:
            document.getElementById('color-yellow').checked = true;
            break;
        case 4:
            document.getElementById('color-green').checked = true;
            break;
        case 5:
            document.getElementById('color-brown').checked = true;
            break;
    }
}

socket.on('connect', () => {
    user.socketID = socket.id;
    setColor();
    if (Cookies.get('chatech-user.username')){
        user.username = Cookies.get('chatech-user.username');
        if(Cookies.get('chatech-user.color')) user.color = Cookies.get('chatech-user.color');
        message_input.value = '';
        setLogStatus('login');
    }

    login.onsubmit = (e) => {
        e.preventDefault();
        user.username = nickname.value;
        user.color = document.querySelector('input[name="color"]:checked').value
        if (user.username) {
            nickname.value = '';
            Cookies.set('chatech-user.username', user.username, { expires: 30 } );
            Cookies.set('chatech-user.color', user.color, { expires: 30 } );
            setLogStatus('login');
        }
    };

    logout.onclick = () => {
        user.username = '';
        message_input.value = '';
        header_notice.innerHTML = '';
        Cookies.remove('chatech-user.username');
        Cookies.remove('chatech-user.color');
        setLogStatus('logout');
    };
});
socket.on('chat-users', (chat_users) => logged_count.innerHTML = `${chat_users}`);
