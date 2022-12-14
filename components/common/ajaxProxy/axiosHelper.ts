import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ErequestSendType, IajaxBlock, IajaxConfig, Iparams, Tthrottle } from "../interfaces/Iajax";
import { useSnackbar, VariantType } from "notistack";
import { useEffect, useState } from "react";

/**
 * 返回对象定义
 */
export interface IresultObj {
	//请求、获取数据的方法
	fetch: (_name: string, _params: IajaxBlock) => Promise<AxiosResponse>;
}

/**
 * Axios封装
 */
export const useAxiosProxy = function (_axiosConfig: IajaxConfig, _env: string | void): IresultObj {
	const { enqueueSnackbar } = useSnackbar();

	const [isMounted, setIsMounted] = useState<boolean>(false);
	const [timer, settimer] = useState<NodeJS.Timeout>();
	const [throttleQueue, setthrottleQueue] = useState<IajaxBlock[]>([] as IajaxBlock[]);
	const [changeStemp, setChangeStemp] = useState<number>(-1);

	if (typeof _axiosConfig === "undefined") {
		throw "need condition axiosConfig";
	}
	/**
	 * ====================state==========================
	 */

	/**
	 * =====================静态变量========================
	 */
	const axiosConfig = _axiosConfig;

	let root = "";
	if (_env === "development") {
		root = _axiosConfig.inv.devRoot;
	}
	if (_env === "gray") {
		root = _axiosConfig.inv.grayRoot;
	}
	if (_env === "production") {
		root = _axiosConfig.inv.proRoot;
	}

	/**
	 * http request 拦截器
	 */
	//axios.interceptors.request.use(
	//	(config) => {
	//		config.data = JSON.stringify(config.data);
	//		config.headers = {
	//			"Content-Type": "application/json",
	//		};
	//		return config;
	//	},
	//	(error) => {
	//		return Promise.reject(error);
	//	}
	//);

	/**
	 * http response 拦截器
	 */
	axios.interceptors.response.use(
		(response: AxiosResponse) => {
			//if (response.data.errCode === 2) {
			//	console.log("过期");
			//}
			return response;
		},
		(error: Error) => {
			enqueueSnackbar(error.message, { variant: "error" });
		}
	);

	/**
	 * 检查列队情况
	 */
	const throttleTimmerQueueCheck = function (): void {
		if (throttleQueue.length !== 0) {
			let _throttleQueue: IajaxBlock[] = [...throttleQueue];
			let newThrottleQueue: IajaxBlock[] = [];

			let startTime: number = +new Date();

			for (let item of _throttleQueue) {
				let endTime: number = startTime - item.throttle!.timeScope!;
				if (item.throttle?.createStemp! > endTime && item.throttle?.createStemp! < startTime) {
					newThrottleQueue.push(item);
				}
			}

			setthrottleQueue(newThrottleQueue);
			setChangeStemp(+new Date());
		}
	};

	/**
	 * 检查节流
	 */
	const fetchThrottleCheck = function (_params: IajaxBlock): boolean {
		if (!_params.throttle?.enabled || _params.throttle!.times! <= 0 || _params.throttle!.timeScope! <= 0) {
			return true;
		}

		let _throttleQueue: IajaxBlock[] = [...throttleQueue];

		let currentTime: number = +new Date();

		let startTime: number = currentTime;
		let endTime: number = currentTime - _params.throttle!.timeScope!;

		let count: number = 0;
		for (let item of _throttleQueue) {
			if (item.throttle?.createStemp! > endTime && item.throttle?.createStemp! < startTime) {
				count++;
			}
		}

		if (count >= _params.throttle!.times!) {
			enqueueSnackbar("Throttle limited!", { variant: "warning" });
			return false;
		} else {
			_params!.throttle!.createStemp = currentTime;

			_throttleQueue.push(_params);
			setthrottleQueue(_throttleQueue);
			setChangeStemp(+new Date());
			return true;
		}
	};

	/**
	 *  请求接口
	 * @param {接口名称} _name
	 * @param {接口参数} _params
	 */
	const fetch: (_name: string, _params?: IajaxBlock | undefined | null) => Promise<AxiosResponse> = function (
		_name: string,
		_params: IajaxBlock | undefined | null = undefined
	) {
		var params: AxiosRequestConfig;
		if (typeof _params !== undefined) {
			//合并参数
			params = makeParams(Object.assign(axiosConfig.commands[_name], _params));
		} else {
			params = makeParams(axiosConfig.commands[_name]);
		}

		//节流控制
		if (fetchThrottleCheck(_params as IajaxBlock)) {
			return axios(params)
				.then(function (aResult: AxiosResponse) {
					if (typeof aResult.data !== "object") {
						aResult.data = JSON.parse(aResult.data);
					}
					return aResult;
				})
				.catch(function (_err: Error) {
					let aResult: AxiosResponse = {
						status: 0,
						statusText: "error",
						headers: {},
						config: {},
						data: {},
					};
					aResult.data = {
						code: -1,
						message: _err.message,
						data: {},
					};
					enqueueSnackbar(_err.message, { variant: "error" });
					return aResult;
				});
		} else {
			return new Promise<AxiosResponse>(function (
				_res: (result: AxiosResponse) => void,
				_rej: (result: AxiosResponse) => void
			) {
				let aResult: AxiosResponse = {
					status: -110,
					statusText: "error throttle limited",
					headers: {},
					config: {},
					data: {},
				};
				_rej(aResult);
			});
		}
	};

	/**
	 * 创建参数
	 */
	const makeParams = function (_params: IajaxBlock): AxiosRequestConfig {
		let urlParas = "";
		if (_params.paramsType === "url") {
			urlParas = getUrlParas(_params.params!);
		}
		if (_params.paramsType === "routePar") {
			urlParas = getRoutePar(_params.params!);
		}
		var result: AxiosRequestConfig = {
			method: _params.method!.toLowerCase(),
			url: root + _params.url + urlParas,
			timeout: _params.timeout || 10000,
			withCredentials: _params.withCredentials || false,
			responseEncoding: _params.responseEncoding || "utf8",
			responseType: _params.responseType || "json",
		};

		if (_params.paramsType !== "url") {
			result.data = _params.params || {};
		}

		if (_params.headersPar !== null && typeof _params.headersPar !== "undefined") {
			result.headers = _params.headersPar;
		}

		if (typeof _params.requestSendType !== "undefined" && _params.requestSendType !== null) {
			if (typeof result.headers === "undefined") {
				result.headers = {};
			}
			result.headers["Content-Type"] = _params.requestSendType;
		}
		if (typeof _params.throttle === "undefined") {
			_params.throttle = {};
		}
		let defaultThrottle: Tthrottle = {
			//是否开启节流  true：开启 | false：关闭
			enabled: false,
			//接口触发多少次就节流？0 关闭节流  默认5
			times: 5,
			//几分钟内？默认1分钟 60 * 1000
			timeScope: 60 * 1000,
		};

		let currenrtThrottle = Object.assign(defaultThrottle, _params.throttle);
		_params.throttle = currenrtThrottle;

		return result;
	};

	/**
	 * 获得routePar
	 */
	const getRoutePar = function (_params: Iparams): string {
		var result: string = "";
		for (let i in _params) {
			if (_params.hasOwnProperty(i)) {
				result += "/";
				result += _params[i];
			}
		}

		return result;
	};

	/**
	 * 获得urlParas
	 */
	const getUrlParas = function (_params: Iparams): string {
		var result: string = "";
		for (let i in _params) {
			if (_params.hasOwnProperty(i)) {
				if (result === "") {
					result += "?";
				} else {
					result += "&";
				}
				result += i + "=" + _params[i];
			}
		}

		return result;
	};

	//===============effects==================
	useEffect(
		function (): ReturnType<React.EffectCallback> {
			let timeout: NodeJS.Timeout = setTimeout(function () {
				throttleTimmerQueueCheck();
			}, 1000);

			settimer(timeout);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[changeStemp]
	);

	useEffect(
		function (): ReturnType<React.EffectCallback> {
			if (isMounted === false) {
				setIsMounted(true);
			}
		},
		[isMounted]
	);

	useEffect(function (): ReturnType<React.EffectCallback> {
		return function (): void {
			setIsMounted(false);
			clearTimeout(timer);
		};
	}, []);

	return { fetch };
};
