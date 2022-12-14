import { ResponseType } from "axios";

/**
 * ajax接口配置文件
 */
export interface IajaxConfig {
	inv: {
		/**
		 * 接口名称
		 */
		cgiName: string;
		/**
		 * 开发环境访问链接
		 */
		devRoot: string;
		/**
		 * 灰度环境访问链接
		 */
		grayRoot: string;
		/**
		 * 发布环境访问链接
		 */
		proRoot: string;
	};
	commands: {
		[x: string]: IajaxBlock;
	};
}

export type Tthrottle = {
	//是否开启节流  true：开启 | false：关闭
	enabled?: boolean;
	//接口触发多少次就节流？0 关闭节流  默认5
	times?: number;
	//几分钟内？默认1分钟 60 * 1000
	timeScope?: number;
	//请求创建时间
	createStemp?: number;
};

/**
 * 接口配置块
 */
export interface IajaxBlock {
	/**
	 * 接口访问路径
	 */
	url?: string;
	/**
	 * 接口使用的请求方式
	 */
	method?: string;
	/**
	 * 自定义头
	 */
	headersPar?: {
		[x: string]: string;
	} | null;
	/**
	 * 发送参数
	 */
	params?: {
		[x: string]: string | number;
	};
	/**
	 * 响应的字符编码
	 */
	responseEncoding?: string;
	/**
	 *
	 */
	withCredentials?: boolean;
	/**
	 * 请求超时时间
	 */
	timeout?: number;
	/**
	 * 接受数据的方式
	 */
	responseType?: ResponseType | null;
	/**
	 * 发送数据的方式
	 */
	requestSendType?: ErequestSendType | string | null;
	/**
	 * url参数还是json参数
	 */
	paramsType?: string;
	/**
	 * 接口说明
	 */
	desc?: string;
	/**
	 * 数据
	 */
	data?:
		| string
		| {
				[x: string]: string | number;
		  };
	/**
	 * 头
	 */
	headers?: {
		[x: string]: string;
	};
	/**
	 * 节流
	 */
	throttle?: Tthrottle;
}

/**
 * 发送 ajax请求时使用的发送参数类型
 */
export enum ErequestSendType {
	/**
	 * 表单参数的形式
	 */
	FORM = "application/x-www-form-urlencoded;charset=utf-8",
	/**
	 * json对象的形式
	 */
	JSON = "application/json",
}

/**
 * fetch用的参数合集
 */
export interface IfetchCondition {
	/**
	 * 接口名称(对应当前载入的接口配置文件中的接口)
	 */
	name: string;
	/**
	 * 发送的数据,json格式(可选)
	 * (requestSendType为form的情况下,直接填写json数据)
	 * (requestSendType为json的情况下,需要将您的json数据JSON.stringify()之后再填写进来)
	 */
	params?: Iparams | string;
	/**
	 * URL参数(可选)
	 * 示例:
	 * {
	 *      key:value
	 *      (...)
	 * }
	 */
	urlPar?: Iparams;
	/**
	 * 数据类型(可选)
	 */
	dataType?: string;
	/**
	 * 请求头参数(可选)
	 * 示例:
	 * {
	 *      key:value
	 *      (...)
	 * }
	 */
	headersPar?: Iparams;
	/**
	 * 发送数据时使用说明方式发送 关联 ErequestSendType
	 */
	requestSendType?: ErequestSendType;
}

/**
 * 请求用的参数
 */
export interface Iparams {
	[propName: string]: string | number;
}

/**
 * 万能的json类型
 */
export type jsonType = {
	[propName: string]: jsonType | number | string | void | null;
};

/**
 * 返回参数
 */
export interface IajaxResult {
	code: number;
	message: string;
	data: jsonType | number | string | void | null;
}
