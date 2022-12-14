const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const immer = require("immer");
const { truncate } = require("fs");

const app = express();

app.all("*", function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://192.168.0.106:3303,http://192.168.0.106:9030"); //前端域名
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	next();
});

app.use(
	cors({
		origin: ["http://192.168.0.106:3303", "http://192.168.0.106:9030"],
		methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
		credentials: true,
	})
);

app.use(cookieParser());
app.use(
	session({
		secret: "coomanserver 01",
	})
);

// 请求体解析中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * 业务处理
 */
const _coomanserverBis = function () {
	let self = this;

	/**
	 * 消息返回原型
	 */
	let messagePrototype = {
		code: 0,
		message: "faild",
		data: {},
	};

	//往回发送需要登录的信息
	this.sendLoginMessage = function () {
		return immer.produce(messagePrototype, function (_messagePrototype) {
			_messagePrototype.code = -1;
			_messagePrototype.message = "you need to login";
			return _messagePrototype;
		});
	};

	this.checklogin = function (req, res) {
		if (typeof req.session.isLogin !== "undefined" && req.session.isLogin === true) {
			return immer.produce(messagePrototype, function (_messagePrototype) {
				_messagePrototype.code = 200;
				_messagePrototype.message = "success";
				_messagePrototype.data = { userName: req.session.userName };
				return _messagePrototype;
			});
		} else {
			return this.sendLoginMessage();
		}
	};

	/**
	 * 获得文件目录
	 */
	this.getDirectroy = function (req, res) {};
};

/**
 * 实例化
 */
let CBS = new _coomanserverBis();

/**
 * 阻挡需要登录的模块
 */
app.use(function (req, res, next) {
	if (req.url.split("/")[1] === "checklogin") {
		res.send(CBS.checklogin(req, res));
		res.end();
		return;
	}
	if (
		req.url.split("/")[1] !== "login" &&
		(typeof req.session.isLogin === "undefined" || req.session.isLogin === false)
	) {
		//往回发送需要登录的信息
		res.send(CBS.sendLoginMessage(req, res));
		res.end();
		return;
	}

	/**
	 * 除登录以外其它模块都直接进去
	 */
	if (
		req.url.split("/")[1] !== "login" &&
		typeof req.session.isLogin !== "undefined" &&
		req.session.isLogin !== false &&
		typeof CBS[req.url.replace("/", "")] !== "undefined"
	) {
		res.send(CBS[req.url.replace("/", "")](req, res));
		res.end();
		return;
	}

	next();
});

app.get("/login/:userName/:passWord", (req, res) => {
	let user = {
		userName: "bobliao",
		passWord: "123123",
	};
	if (typeof req.params.userName === "undefined" || typeof req.params.passWord === "undefined") {
		res.send(
			JSON.stringify({
				code: 0,
				message: "faild",
				data: "faild",
			})
		);
	}
	if (req.params.userName === user.userName && req.params.passWord === user.passWord) {
		req.session.isLogin = true;
		req.session.userName = req.params.userName;
		res.send(
			JSON.stringify({
				code: 200,
				message: "success",
				data: "success",
			})
		);
	} else {
		res.send(
			JSON.stringify({
				code: 0,
				message: "faild",
				data: "faild",
			})
		);
	}
});

app.listen(8668);
console.log("server has been started:8668");
