import { appWithTranslation, UserConfig } from "next-i18next";
import "../assets/styles/globals.scss";
import type { AppProps } from "next/app";
import GlobalLayout from "../components/layouts/GlobalLayout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const MyApp = function ({ Component, pageProps }: AppProps) {
	return (
		<>
			{/**
			 * 所有公用的context都在GlobalLayout这里
			 */}
			<GlobalLayout>
				<Component {...pageProps} />
			</GlobalLayout>
		</>
	);
};

/**
 * 在这里配置客户端的i18n转译
 */
export default appWithTranslation(MyApp);
