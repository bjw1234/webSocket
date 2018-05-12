# webSocket
通过socket.io实现多人在线聊天，以及和图灵机器人聊天。

# install 

* npm install 
* node app.js
* 在浏览器窗口访问`localhost:5000`

* 右上角切换群聊和机器人

# js实现提交事件触发

```js
function trigger(dom) {
    if (document.all) { //IE
        dom.submit();
    } else { // 其它浏览器
        let e = document.createEvent("HTMLEvents");
        e.initEvent("submit", true, true); // 想触发的行为
        dom.dispatchEvent(e); // 事件分发
    }
}
```
