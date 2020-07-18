let chat_message = document.getElementById('chat-messages');
let messages_container = document.querySelector('.chat__messages');
let message_input = document.getElementById('user-message');
let emoji_button = document.getElementById('emojis-button');
let send_message_button = document.getElementById('send-button');
let send_message_enter = document.getElementById('chat-form');

let header_notice = document.getElementById('header-notice');
let footer_notice = document.getElementById('footer-notice');

let scroll_mov = false;
let new_message_count = 0;
let scroll_to_new = 0;

function sendMessage (e) {
    e.preventDefault();
    if (message_input.value) {
        socket.emit('client-message', {
            author: user.username,
            color: user.color,
            content: message_input.value            
        });
        message_input.value = '';
        message_input.style.height = 'auto';
        socket.emit('typing', '');
        return false;
    }
}

function selectEmoji (message, button) {
    let picker = new EmojiButton({ position: 'bottom-end', theme: 'dark' });
    picker.on('emoji', (emoji) => { message.value += emoji; });
    button.onclick = () => { picker.pickerVisible ? picker.hidePicker() : picker.showPicker(button); };
}

function ifScrollMove () {
    let max_top_space = messages_container.scrollHeight - messages_container.clientHeight;
    scroll_mov = messages_container.scrollTop < max_top_space;
    if (scroll_mov) {
        new_message_count += 1;
        if(new_message_count == 1 || !(header_notice.innerHTML == '')) {
            header_notice.innerHTML =`
            <div class="chat__notice--new-message">
                <p class="chat__notice-text">Tienes ${new_message_count} Mensaje Nuevo <br> <span class="icon icon-expand_more"></span></p>
            </div>`;
        }
        if(new_message_count == 1) {
            let d = new Date();
            let months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            let date = `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}  ${d.getHours()}:${d.getMinutes()}`
            chat_message.innerHTML +=`
            <div class="chat__notice--new-line">
            <p class="chat__notice-text">---------------<strong class="chat__notice--strong">Nuevo</strong>---------------<br>${date}</p>
            </div>`;
            scroll_to_new = max_top_space + parseInt(messages_container.clientHeight/2);
        }
    }
}

function setScrollPosition(position) {
    let max_top_space = messages_container.scrollHeight - messages_container.clientHeight;
    if (position == 'down') {
        messages_container.scrollTop = max_top_space;
        new_message_count = 0;
    } else {
        messages_container.scrollTop = position;
    }
    header_notice.innerHTML = '';
}

function resize(text_field) {
    text_field.style.height = 'auto';
    text_field.style.height = `${text_field.scrollHeight}px`;
}
        
//enviar mensaje
send_message_enter.onkeydown = (e) => { if (e.key === 'Enter' || e.keyCode === 13) sendMessage(e); };
send_message_button.onclick = (e) => sendMessage(e);
//recibir mensaje
socket.on('server-message', (message) => {
    ifScrollMove();
    chat_message.innerHTML +=`
    <div class="chat__message" style="border-left-color: ${message.color};">
        <p class="chat__message-autor">${message.author}</p>
        <p class="chat__message-text">${message.content}</p>
    </div>`;
    if(!scroll_mov) setScrollPosition('down');
});

//Anuncios usuario conectado
socket.on('user-login-message', (user) => {
    ifScrollMove();
    chat_message.innerHTML +=`
    <div class="chat__notice--login">
        <p class="chat__message-text">
            <span class="icon icon-notice" style="color: ${user.color};"></span> "<strong>${user.username}</strong>" ha ingresado al chat
        </p>
    </div>`;
    if(!scroll_mov) setScrollPosition('down');
});
//Anuncios usuario tecleando
socket.on('typing', (username) => {
    if (username) {
        footer_notice.innerHTML =`
        <div class="chat__notice--typing">
            <p class="chat__notice-text"><strong>${username}</strong> esta escribiendo...</p>
        </div>`;
    }
    else footer_notice.innerHTML = '';    
});

//Emojis
selectEmoji(message_input , emoji_button);
//enviar tecleo y autorezise de input text
message_input.oninput = () => {
    socket.emit('typing', user.username);
    setScrollPosition('down');
    resize(message_input);
};

header_notice.onclick = () => {
    setScrollPosition(scroll_to_new);
}

messages_container.onscroll = () => {
    if(messages_container.scrollTop >= scroll_to_new && !(header_notice.innerHTML == '')) {
        header_notice.innerHTML = '';
    }
}