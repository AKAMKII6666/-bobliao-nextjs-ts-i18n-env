/**
 * 廖力编写
 * 模块名称：公共组件层
 * 模块说明：公共组件层
 * 编写时间：2022年12月5日 15:28:20
 */
import Head from "next/head";
import React, { useEffect, useState, FC } from "react";
import { EresoMode, EscreenState, IconfigMutiple, Ireso, useReso, resoContext } from "@bobliao/reso-hook";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import { ReactElement } from "react";

import MessageWindowProvider from "../../hooks/MessageWindowHook";

/**
 * 更改mui的全局字体样式
 */
const theme = createTheme({
	typography: {
		fontFamily: [
			"Inter var",
			"sans-serif",
			"-apple-system",
			"BlinkMacSystemFont",
			'"Segoe UI"',
			"Roboto",
			'"Helvetica Neue"',
			"Arial",
			"sans-serif",
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
		].join(","),
		fontSize: 14,
	},
});

/**
 * 传入参数
 */
export interface iprops {
	children: ReactElement | ReactElement[] | string | null;
}

const GlobalLayout: FC<iprops> = ({ children }, _ref): ReactElement => {
	//===============useHooks=================

	//===============state====================
	const [isMounted, setIsMounted] = useState<boolean>(false);

	//===============static===================

	//===============ref======================

	//===============function=================

	const resoCondition: IconfigMutiple = {
		queryList: [
			{
				mediaQuery: {
					screenState: EscreenState.HORIZONTAL,
					config: {
						//页面字体基准是14像素
						fontSize: 14,
						//设计稿宽度/高度
						designWidth: 1920,
						designHeight: 1080,
						//缩放限制参数
						//用于限制页面的缩放大小
						scaleLimit: {
							enable: false,
						},
						//调整模式
						//auto:自动选择高度还是宽度来调整
						//width:只通过宽度调整
						//height:只通过高度调整
						mode: EresoMode.WIDTH,
					},
				},
			},
			{
				mediaQuery: {
					screenState: EscreenState.VERTICAL,
					config: {
						//页面字体基准是14像素
						fontSize: 14,
						//设计稿宽度/高度
						designWidth: 400,
						designHeight: 250,
						//调整模式
						//auto:自动选择高度还是宽度来调整
						//width:只通过宽度调整
						//height:只通过高度调整
						mode: EresoMode.AUTO,
					},
				},
			},
		],
	};

	const reso: Ireso = useReso(resoCondition);

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
			<Head>
				<link rel="icon" href="/favicon.ico" />
				<meta name="viewport" content={"width=" + reso.width} />
				<script
					id="_a_d_p_"
					dangerouslySetInnerHTML={{
						__html: reso.data.scriptStr,
					}}
				></script>
			</Head>

			{/**
			 * mui样式适配
			 */}
			<ThemeProvider theme={theme}>
				{/**
				 * 分辨率适配组件
				 */}
				<resoContext.Provider value={reso}>
					{/**
					 * 屏幕侧边tooltip小气泡
					 */}
					<SnackbarProvider maxSnack={5} autoHideDuration={6000}>
						{/** * 公用消息窗口 */}
						<MessageWindowProvider>
							{/**项目里所有的内容 */}
							{children}
						</MessageWindowProvider>
					</SnackbarProvider>
				</resoContext.Provider>
			</ThemeProvider>
		</>
	);
};

export default GlobalLayout;
