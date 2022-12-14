/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");
const merge = require("webpack-merge");

/**
 * webpack配置
 */
let webPackConfig = {
	resolve: {
		fallback: {
			fs: false,
		},
	},
};

const nextConfig = {
	/**
	 * react严格模式
	 * 这里有个bug,调成true的话会引发页面渲染两次的bug
	 */
	reactStrictMode: false,
	swcMinify: true,
	i18n,
	env: {
		SYS_ENV: process.env["SYS_ENV"],
	},
	/**
	 * 自定义webpack配置
	 */
	webpack: function (config, options) {
		//配置合并
		let _config = merge.merge(config, webPackConfig);
		return _config;
	},
};

module.exports = nextConfig;
