/**
 * 廖力编写
 * 模块名称：快捷弹出窗口
 * 模块说明：用于警告和确认的全局单例窗口
 * 编写时间：2022年12月5日 16:30:30
 */
import { Ireso, useResoContext, EscreenState } from "@bobliao/reso-hook";
import { Button } from "@mui/material";
import Alert from "@mui/material/Alert";
import React, { useEffect, createContext, useState, FC, ReactElement, useContext, useRef } from "react";
import WindowLay from "../windowLay/windowLay";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

/**
 * 创建context
 */
export const UserMessageWindowContext = createContext<IuseMessageWindowResult>({} as IuseMessageWindowResult);

/**
 * 消息类型
 */
export enum EmessageTypes {
	//警告
	WARN = "warning",
	//错误
	ERROR = "error",
	//信息
	INFO = "info",
	//成功
	SUCCESS = "success",
}

/**
 * 消息元素
 */
export interface ImessageItem {
	//消息标题
	title?: string | ReactElement;
	//消息信息
	message?: string | ReactElement;
	//消息类型
	type?: EmessageTypes | null | undefined;
	//确定按钮的文本
	yesButtonText?: string;
	//取消按钮的文本
	noButtonText?: string;
	//询问还是弹出警告
	messageType?: "ask" | "alt";
	//promise处理器
	promise?: {
		resolve: (result: ImessageResult) => void;
		reject: (result: ImessageResult) => void;
	};
}

/**
 * 消息返回状态
 */
export enum EmessageStatus {
	//确认
	YES = "YES",
	//取消
	NO = "NO",
}

/**
 * 万能的json类型
 */
type jsonType = {
	[propName: string]: jsonType | number | string | void | null;
};

/**
 * 消息返回
 */
export interface ImessageResult {
	//返回状态
	status: EmessageStatus;
	//返回数据
	data: jsonType | number | string | void | null;
}

/**
 * 消息列队
 */
export type ImessageList = ImessageItem[];

/**
 * useMessageWindow 返回的内容
 */
export interface IuseMessageWindowResult {
	alt: (message: ImessageItem) => Promise<ImessageResult>;
	ask: (message: ImessageItem) => Promise<ImessageResult>;
	currentMessage: ImessageItem | null;
	isShow: boolean;
	setHide: () => void;
}

/**
 * 使用窗体钩子
 */
export const useMessageWindow = function (): IuseMessageWindowResult {
	const { t, ready } = useTranslation(["default"]);
	const currentMessageList = useRef<ImessageList>([]);
	const [messageCount, setmessageCount] = useState<number>(0);
	const [currentMessage, setcurrentMessage] = useState<ImessageItem | null>(null);
	const [isShow, setisShow] = useState<boolean>(false);

	const [messageConfig, setMessageConfig] = useState({
		title: "",
		message: "",
		//确定按钮的文本
		yesButtonText: "",
		//取消按钮的文本
		noButtonText: "",
		//弹出消息类型
		type: null,
	});

	const alt = function (message: ImessageItem): Promise<ImessageResult> {
		let _message = Object.assign(messageConfig, message);
		let resPromise = new Promise<ImessageResult>(function (
			_res: (result: ImessageResult) => void,
			_rej: (result: ImessageResult) => void
		) {
			pushToMessageList(_message, _res, _rej, "alt");
		});

		return resPromise;
	};

	const ask = function (message: ImessageItem): Promise<ImessageResult> {
		let _message = Object.assign(messageConfig, message);
		let resPromise = new Promise<ImessageResult>(function (
			_res: (result: ImessageResult) => void,
			_rej: (result: ImessageResult) => void
		) {
			pushToMessageList(_message, _res, _rej, "ask");
		});

		return resPromise;
	};

	/**
	 * 将弹出框任务推向列队
	 */
	const pushToMessageList = function (
		message: ImessageItem,
		_res: (result: ImessageResult) => void,
		_rej: (result: ImessageResult) => void,
		messageType: "ask" | "alt"
	): void {
		currentMessageList.current.push({
			title: message.title,
			message: message.message,
			type: message.type,
			messageType: messageType,
			yesButtonText: message.yesButtonText,
			noButtonText: message.noButtonText,
			promise: {
				resolve: _res,
				reject: _rej,
			},
		});
		setmessageCount(currentMessageList.current.length);
	};

	/**
	 * 关闭消息
	 */
	const setHide = function () {
		setisShow(false);
		setcurrentMessage(null);
		if (currentMessageList.current.length !== 0) {
			tickMessage(messageCount);
		}
	};

	/**
	 * 展示消息
	 */
	const showMessage = function () {
		setisShow(true);
	};

	/**
	 * 迭代下一个消息
	 */
	const tickMessage = function (_messageCount: number): void {
		let messageItem: ImessageItem = currentMessageList.current.shift() as ImessageItem;
		setcurrentMessage(messageItem);
		setisShow(false);
		setmessageCount(_messageCount - 1);
	};

	useEffect(
		function () {
			if (ready) {
				setMessageConfig({
					title: t("windowLay.text3"),
					message: t("windowLay.text3"),
					//确定按钮的文本
					yesButtonText: t("windowLay.text1"),
					//取消按钮的文本
					noButtonText: t("windowLay.text2"),
					//弹出消息类型
					type: null,
				});
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ready]
	);

	useEffect(
		function (): ReturnType<React.EffectCallback> {
			if (currentMessage !== null && isShow === false) {
				showMessage();
			}
		},
		[currentMessage, isShow]
	);

	useEffect(
		function (): ReturnType<React.EffectCallback> {
			if (currentMessageList.current.length !== 0 && currentMessage === null) {
				tickMessage(messageCount);
			}
		},
		[messageCount, currentMessage]
	);

	return {
		ask,
		alt,
		currentMessage,
		isShow,
		setHide,
	};
};

export interface IMessageWindowProviderProps {
	children: ReactElement | ReactElement[] | string | null;
}

const MessageWindowProvider: FC<IMessageWindowProviderProps> = ({ children }, _ref): ReactElement => {
	//===============useHooks=================

	const messageWindow: IuseMessageWindowResult = useMessageWindow();
	const reso: Ireso = useResoContext();

	//===============state====================
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const cWindow = useRef<ReactElement | null>(null);

	//===============static===================

	//===============ref======================

	//===============function=================

	//===============effects==================
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
		};
	}, []);

	return (
		<>
			<UserMessageWindowContext.Provider value={messageWindow}>
				{children}
			</UserMessageWindowContext.Provider>
			{(function () {
				if (messageWindow.currentMessage !== null) {
					return (
						<WindowLay
							isShow={messageWindow.isShow}
							title={
								<>
									<div>{messageWindow.currentMessage.title}</div>
								</>
							}
							onClose={function () {
								messageWindow.setHide();
								let result: ImessageResult = {
									data: {},
									status: EmessageStatus.NO,
								};
								messageWindow.currentMessage!.promise!.resolve(result);
							}}
							background={{
								bgClose: true,
							}}
							force="pc"
							size={{
								width: (function () {
									if (
										reso.screenState ===
										EscreenState.VERTICAL
									) {
										return "20rem";
									} else {
										return "30rem";
									}
								})(),
								height: "auto",
							}}
							buttons={
								<>
									{(function () {
										if (
											messageWindow.currentMessage
												.messageType === "ask"
										) {
											return (
												<>
													<Button
														variant="outlined"
														onClick={function () {
															messageWindow.setHide();
															let result: ImessageResult =
																{
																	data: {},
																	status: EmessageStatus.NO,
																};
															messageWindow.currentMessage!.promise!.resolve(
																result
															);
														}}
													>
														<>
															{
																messageWindow.currentMessage!
																	.noButtonText
															}
														</>
													</Button>
													<Button
														variant="contained"
														onClick={function () {
															messageWindow.setHide();
															let result: ImessageResult =
																{
																	data: {},
																	status: EmessageStatus.YES,
																};
															messageWindow.currentMessage!.promise!.resolve(
																result
															);
														}}
													>
														<>
															{
																messageWindow.currentMessage!
																	.yesButtonText
															}
														</>
													</Button>
												</>
											);
										} else if (
											messageWindow.currentMessage
												.messageType === "alt"
										) {
											return (
												<>
													<Button
														variant="contained"
														onClick={function () {
															messageWindow.setHide();
															let result: ImessageResult =
																{
																	data: {},
																	status: EmessageStatus.YES,
																};
															messageWindow.currentMessage!.promise!.resolve(
																result
															);
														}}
													>
														<>
															{
																messageWindow.currentMessage!
																	.yesButtonText
															}
														</>
													</Button>
												</>
											);
										}
										return null;
									})()}
								</>
							}
						>
							<>
								{(function () {
									if (
										messageWindow.currentMessage.type !==
										null
									) {
										return (
											<Alert
												severity={
													messageWindow
														.currentMessage
														.type
												}
											>
												{
													messageWindow
														.currentMessage
														.message
												}
											</Alert>
										);
									} else {
										return (
											<div>
												{
													messageWindow
														.currentMessage
														.message
												}
											</div>
										);
									}
								})()}
							</>
						</WindowLay>
					);
				} else {
					return null;
				}
			})()}
		</>
	);
};

/**
 * 使用 context
 */
export const useMessageWindowContext = function (): IuseMessageWindowResult {
	var r: IuseMessageWindowResult = useContext(UserMessageWindowContext);
	return r;
};

export default MessageWindowProvider;
