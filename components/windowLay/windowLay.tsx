/**
 * 廖力编写
 * 2022/12/04
 * 弹出窗口组件  based on  mui
 */
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, FC, Fragment } from "react";
import { ReactElement, CSSProperties } from "react";
import { Ireso, useResoContext, EscreenState } from "@bobliao/reso-hook";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	PaperProps,
	Paper,
	IconButton,
	Typography,
	Toolbar,
	AppBar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TransitionProps } from "@mui/material/transitions";
import Slide from "@mui/material/Slide";

import Draggable from "react-draggable";
//向上级暴露方法的定义
export type useableFuncs = {
	show: (_callback: () => void) => void;
	hide: (_callback: () => void) => void;
};

//窗口对象
export interface IwlProp {
	title?: ReactElement | string | null | undefined;
	position?: {
		x: number | string;
		y: number | string;
	};
	size?: {
		width: number | string;
		height?: number | string;
	};
	buttons?: ReactElement | null | undefined;
	//是否加入背景
	background?: {
		enabled?: boolean;
		//是否点击空白处关闭
		bgClose?: boolean;
	};
	style?: CSSProperties;
	className?: string;
	//关闭回调
	onClose?: (() => void) | null;
	//打开回调
	onOpen?: (() => void) | null;
	//是否不显示关闭按钮
	isNoCloseBtn?: boolean;
	//是否不显示标题
	isNoTitle?: boolean;
	children: ReactElement | string | null | undefined;
	/**
	 * 是否显示窗口滚动条
	 */
	scroll?: boolean;
	/**
	 * 是否显示
	 */
	isShow?: boolean | null;
	force?: "mobile" | "pc" | null;
}

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * 将组件引用出去
 */
const WindowLay = forwardRef<useableFuncs, IwlProp>(
	(
		{
			children = null,
			//标题
			title = <>{"This is a message"}</>,
			//位置
			position = {
				x: "center",
				y: "center",
			},
			//大小
			size = {
				width: "32.142857rem",
				height: "auto",
			},
			//按钮设置
			buttons = null,
			//是否加入背景
			background = {
				enabled: true,
				//是否点击空白处关闭
				bgClose: false,
			},
			//附加行样式
			style = {},
			//附加样式表
			className = "",
			//关闭回调
			onClose = null,
			//打开回调
			onOpen = null,
			//是否不显示关闭按钮
			isNoCloseBtn = false,
			//是否不显示标题
			isNoTitle = false,
			//是否显示滚动条
			scroll = false,
			//指示是否显示
			isShow = null,
			//强制以什么模式打开
			force = null,
		}: IwlProp,
		_ref: React.Ref<useableFuncs> | undefined
	): React.ReactElement => {
		/**
		 * 分辨率组件，这里用于判别横屏、竖屏
		 */
		const reso: Ireso = useResoContext();

		const [isMounted, setIsMounted] = useState<boolean>(false);
		const [open, setOpen] = useState<boolean>(false);
		const [currentStyle, setcurrentStyle] = useState<CSSProperties>({});

		//隐藏窗口
		const hide = function (_callback: () => void = function () {}): void {
			handleClose(null, "fromOutside");
			_callback();
		};

		//显示窗口
		const show = async function (_callback: () => void = function () {}): Promise<void> {
			if (isShow !== null && onOpen !== null) {
				onOpen!();
			} else {
				setOpen(true);
			}
			_callback();
		};

		/**
		 * 处理关闭事件
		 */
		const handleClose = (event: React.MouseEvent<HTMLButtonElement> | null, reason: string) => {
			if (reason && reason === "backdropClick" && background.bgClose === false) {
				return;
			}
			if (isShow !== null && onClose !== null) {
				onClose!();
			} else {
				setOpen(false);
			}
		};

		/**
		 * 合并样式
		 */
		const mergeStyles = function () {};

		/**制造dialog */
		const makeDialog = function (children: ReactElement): ReactElement | undefined {
			if ((force !== null && force === "pc") || reso.screenState === EscreenState.HORIZONTAL) {
				return (
					<>
						<Dialog
							className={className}
							style={style}
							PaperProps={{
								sx: {
									width: size.width,
									height: size.height,
									position: "fixed",
									top: position.y,
									left: position.x,
								},
							}}
							scroll={scroll === true ? "paper" : undefined}
							open={open}
							onClose={function (
								event: React.MouseEvent<HTMLButtonElement>,
								reason
							) {
								handleClose(event, reason);
							}}
							aria-labelledby="draggable-dialog-title"
							PaperComponent={function (props: PaperProps) {
								return (
									<Draggable
										handle="#draggable-dialog-title"
										cancel={
											'[class*="MuiDialogContent-root"]'
										}
									>
										<Paper {...props} />
									</Draggable>
								);
							}}
							hideBackdrop={!background.enabled}
						>
							{(function () {
								if (!isNoTitle) {
									return (
										<DialogTitle id="draggable-dialog-title">
											{title}

											{/**
											 * 控制打开、关闭按钮的出现
											 */}
											{(function () {
												if (
													isNoCloseBtn ===
													false
												) {
													return (
														<IconButton
															aria-label="close"
															onClick={function (
																event: React.MouseEvent<HTMLButtonElement>
															) {
																handleClose(
																	event,
																	"closeBtn"
																);
															}}
															sx={{
																position: "absolute",
																right: 8,
																top: 8,
																color: (
																	theme
																) =>
																	theme
																		.palette
																		.grey[500],
															}}
														>
															<CloseIcon />
														</IconButton>
													);
												} else {
													return null;
												}
											})()}
										</DialogTitle>
									);
								} else {
									return null;
								}
							})()}
							{children}
						</Dialog>
					</>
				);
			}

			if ((force !== null && force === "mobile") || reso.screenState === EscreenState.VERTICAL) {
				return (
					<>
						<Dialog
							hideBackdrop={true}
							className={className}
							style={style}
							fullScreen
							open={open}
							TransitionComponent={Transition}
						>
							{(function () {
								if (!isNoTitle) {
									return (
										<AppBar sx={{ position: "relative" }}>
											<Toolbar>
												<IconButton
													edge="start"
													color="inherit"
													onClick={function (
														event: React.MouseEvent<HTMLButtonElement>
													) {
														handleClose(
															event,
															"closeBtn"
														);
													}}
													aria-label="close"
												>
													<CloseIcon />
												</IconButton>
												<Typography
													sx={{
														ml: 2,
														flex: 1,
													}}
													variant="h6"
													component="div"
												>
													{title}
												</Typography>
											</Toolbar>
										</AppBar>
									);
								} else {
									return null;
								}
							})()}
							{children}
						</Dialog>
					</>
				);
			}
		};

		//暴露方法给上级
		//这里暴露的任何方法都需要定义Types
		//否则在这里写任何方法在Typescript里面是不合法的
		useImperativeHandle(_ref, () => ({
			hide(_callback: () => void) {
				hide(_callback);
			},
			show(_callback: () => void) {
				show(_callback);
			},
		}));

		/**
		 * ==================================Effects===============================
		 */
		useEffect(
			function (): ReturnType<React.EffectCallback> {
				if (isMounted === true) {
					if (isShow !== null) {
						setOpen(isShow);
						if (isShow === true && onOpen !== null) {
							onOpen();
						}
					}
				}
			},
			[isShow, isMounted, onOpen]
		);

		useEffect(
			function (): ReturnType<React.EffectCallback> {
				if (isMounted === false) {
					setIsMounted(true);
					mergeStyles();
				}
			},
			[isMounted, style]
		);

		useEffect(function (): ReturnType<React.EffectCallback> {
			return function (): void {
				setIsMounted(false);
			};
		}, []);

		return (
			<>
				{(function () {
					return makeDialog(
						<>
							<DialogContent dividers={scroll}>{children}</DialogContent>
							{/* 
                                控制按钮
                            */}
							{(function () {
								if (buttons !== null) {
									return <DialogActions>{buttons}</DialogActions>;
								} else {
									return null;
								}
							})()}
						</>
					);
				})()}
			</>
		);
	}
);

WindowLay.displayName = "WindowLay";

export default WindowLay;
