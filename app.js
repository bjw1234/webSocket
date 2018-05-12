/**
 * @type {createApplication}
 *
 * 1.消息的广播、将该消息广播给所有在线的用户（不包括自己）
 *
 */
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const agent = require('superagent');
const PORT = 5000;
const tulLing = {
    "reqType": 0,
    "perception": {
        "inputText": {
            "text": "讲个段子"
        },
        "selfInfo": {
            "location": {
                "city": "天津"
            }
        }
    },
    "userInfo": {
        "apiKey": "38e0a67bbe004c41b59ee980f73df7fa",
        "userId": "99b8a8441209882c"
    }
};
const url = "http://openapi.tuling123.com/openapi/api/v2";

// 静态文件托管
app.use(express.static(__dirname + '/'));

// 访问首页
app.get('/', (req, res) => {
    res.sendFile('/index.html');
});

// 客户端连接时触发
io.on('connection', (socket) => {
    // console.log(`客户端ID:${socket.id}`);

    // 群聊
    socket.on('msg_obj', (data) => {
        data.type = 'chat';
        socket.broadcast.emit('msg_obj', data);
    });

    // 图灵
    socket.on('tuling', (data) => {
        // 发送http请求
        tulLing.perception.inputText.text = data.content;
        agent.post(url)
            .send(tulLing)
            .set('Content-Type', 'application/json')
            .then(function (res) {
                socket.emit('tuling', res);
            });
    });
});

// 设置监听的端口
server.listen(5000, () => {
    console.log("app is running at port:" + PORT);
});