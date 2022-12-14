/**
 * 廖力编写
 * 2022年12月14日 01:16:05
 */
import Head from "next/head";

import styles from "../assets/styles/index.module.scss";
import { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import {
	EmessageTypes,
	ImessageResult,
	IuseMessageWindowResult,
	useMessageWindowContext,
} from "../components/hooks/MessageWindowHook";
import { Button } from "@mui/material";

/**
 * 每个页面都需要配置一个这个，以完成服务器端的渲染
 * 否则服务器端只会出现一个key而不是value
 * 查了很多资料
 * 有说在next-i18next.config.js里添加react:{wait:true}的
 * 但是在 next里不行，用了倒是能解决服务器端渲染的问题，但是会反复加载翻译文件，大概一秒钟加载两次
 * 所以只有用以下这种官方推荐的方式了
 * 这样的话，每个page都要加一个这个玩意，真是蛋疼
 *
 * 而且所有外围组件的翻译文件的服务器端渲染来源都来自这里，
 * 如果这里去掉了的话，外围的（layout）的组件的翻译将失效
 *
 * 所以在(await serverSideTranslations(locale, i18nConfig.ns))这个位置将会载入所有的 i18nConfig.ns翻译文件
 * 好在这是服务器端干的事情，客户端不用加载这么多东西
 */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import i18nConfig from "../next-i18next.config";
export async function getStaticProps({ locale }) {
	return {
		props: {
			...(await serverSideTranslations(locale, i18nConfig.ns)),
		},
	};
}

export default function Home() {
	const mwLay: IuseMessageWindowResult = useMessageWindowContext();
	const { t } = useTranslation(["indexPage"]);
	return (
		<div>
			<Head>
				<title>SunRise</title>
				<meta name="description" content="SunRise" />
			</Head>
			<div>这是主页</div>
			<div>{t("text0")}</div>
			<Button
				variant="contained"
				onClick={function () {
					(async function () {
						let result: ImessageResult = await mwLay.alt({
							message: t("text18"),
						});
						console.log(result);
						let result2: ImessageResult = await mwLay.ask({
							message: t("text8"),
						});
						console.log(result2);
					})();
				}}
			>
				{t("text5")}
			</Button>
		</div>
	);
}
