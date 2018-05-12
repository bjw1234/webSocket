const socket = io('localhost:5000');
let msgList = document.getElementById('msgList');
const sendForm = document.getElementById('sendForm');
const msgContent = document.getElementById('msgContent');
const inputContent = document.getElementById('inputContent');

let role = 'chat';
const robotIcon = document.getElementById('robotIcon');
const chatIcon = document.getElementById('chatIcon');

if (robotIcon) {
    role = 'chat';
}

if (chatIcon) {
    role = 'robot';
}

// 消息对象
const message = {
    time: '',
    name: '',
    content: ''
};

// 点击发送
sendForm.addEventListener('submit', (e) => {

    let text = inputContent.value;
    if (!text || text === "") {
        return;
    }

    // 创建消息
    message.time = getCurrentDate();
    message.name = "小小鹿";
    message.content = text;

    // 清空发送框
    inputContent.value = "";
    appendMsg(message, 'send');
    msgList.scrollTop = msgContent.scrollHeight;

    // 判断发送类型
    role = e.target.dataset.role;

    // 图灵消息
    if (role === 'robot') {
        socket.emit('tuling', message);
    }

    // 群聊消息
    if (role === 'chat') {
        socket.emit('msg_obj', message);
    }
});

// 回车发送
sendForm.onkeydown = function (e) {
    e = e || window.event;
    if (e.keyCode === 13 && e.ctrlKey) {
        return false;
    }

    if (e.keyCode === 13) {
        e.preventDefault();
        trigger(sendForm);
    }
};


// 客户端连接
socket.on('connect', () => {
    console.log(socket.id);

    // 消息广播
    socket.on('msg_obj', (data) => {
        if (role === 'chat') {
            appendMsg(data, 'receive');
            msgList.scrollTop = msgContent.scrollHeight;
        }
    });

    // 图灵信息
    socket.on('tuling', (data) => {
        if (role === 'robot') {
            message.content = resolve(data);
            message.name = '小灵';
            appendMsg(message, 'receive');
            msgList.scrollTop = msgContent.scrollHeight;
        }
    });
});

/**
 * 解析数据
 * @param data
 */
function resolve(data) {
    let str = "",
        text = "",
        url = "",
        image = '';
    if (data && data.status === 200) {
        let res = JSON.parse(data.text);
        if (res.results && res.results.length > 0) {
            res.results.forEach((item) => {
                console.log(item);
                if (item.resultType === "text") {
                    text = item.values.text;
                }
                if (item.resultType === "url") {
                    url = `<a href="${item.values.url}">这里</a>`;
                }
                if (item.resultType === "image") {
                    prevLoading(item.values.image, function () {
                        msgList.scrollTop = msgContent.scrollHeight;
                    });
                    image = `<br> <img src="${item.values.image}" alt="">`;
                }
            });
        }
    }
    str = `${text} ${image} ${url}`;
    return str === "" ? "小灵睡觉中~~" : str;
}


/**
 * 获取当前时间并格式化
 */
function getCurrentDate() {
    let date = new Date();
    let year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hours = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds();

    function format(num) {
        return num < 10 ? "0" + num : num;
    }

    return `${year}-${format(month)}-${format(day)} ${format(hours)}:${format(minutes)}:${format(seconds)}`;
}

/**
 *
 * @param msg 内容
 * @param type 类型
 */
function appendMsg(msg, type) {
    let msgMoudle = `<li class="msg-item ${type}">
                    <div class="head-icon">
                    </div>
                    <div class="msg-desc">
                        <span class="name">${msg.name}</span>
                        <span class="time">${msg.time}</span>
                    </div>
                    <div class="msg-text">
                        <span class="text">${msg.content}</span>                        
                    </div>
                </li>`;
    msgContent.innerHTML += msgMoudle;
}

/**
 * 事件触发
 * @param dom
 */
function trigger(dom) {
    if (document.all) { //IE
        dom.submit();
    } else { // 其它浏览器
        let e = document.createEvent("HTMLEvents");
        e.initEvent("submit", true, true); // 想触发的行为
        dom.dispatchEvent(e); // 事件分发
    }
}

/**
 * 图片预加载
 */
function prevLoading(url, callback) {
    let image = new Image();
    image.src = url;
    if (!!window.ActiveXObject) {
        if (image.onreadystatechange === 'complete') {
            image.readyState = function () {
                callback();
            }
        }
    } else {
        image.onload = function () {
            callback();
        }
    }
}
