// POSSIBILITY 1: locize live download usage on client side only
const LocizeBackend = require("i18next-locize-backend/cjs");
const ChainedBackend = require("i18next-chained-backend").default;
const httpBackend = require("i18next-http-backend").default;
const LocalStorageBackend = require("i18next-localstorage-backend").default;

// If you've configured caching for your locize version, you may not need the i18next-localstorage-backend and i18next-chained-backend plugin.
// https://docs.locize.com/more/caching

const isBrowser = typeof window !== "undefined";

if (typeof SYS_ENV === "undefined") {
	var SYS_ENV = process.env["SYS_ENV"];
}

var nsList = [
	//
	"windowLay",
	"default",
	"warn",
	"walletDebugTool",
	"indexPage",
	"homePage",
	"connectSelect",
	"mainApp",
];

//module.exports = {
//	debug: process.env.NODE_ENV === "development",
//	i18n: {
//		defaultLocale: "en",
//		locales: ["en", "ja", "ko", "zh"],
//	},
//	ns: nsList,
//	defaultNS: "default",
//	fallbackLng: "en",
//	interpolation: {
//		escapeValue: false,
//		keySeparator: ".",
//		formatSeparator: ",",
//		format: (value, format, lng) => {
//			if (format === "uppercase") return value.toUpperCase();
//		},
//	},
//	backend: {
//		backendOptions: [
//			{
//				expirationTime: 60 * 60 * 1000, // 1 hour
//			},
//			{
//				projectId: "a02d5f79-d306-46f7-ae6d-81c0ad28db09",
//				apiKey: "345000ff-03a2-408b-8639-89a47f0f5826",
//				referenceLng: "zh",
//				version: SYS_ENV === "development" ? "latest" : "pro",
//			},
//		],
//		backends: isBrowser ? [LocalStorageBackend, LocizeBackend] : [],
//	},
//	serializeConfig: false,
//	use: isBrowser ? [ChainedBackend /*, require('locize').locizePlugin*/] : [],
//	// saveMissing: true // do not set saveMissing to true for production and also not when using the chained backend
//};

// POSSIBILITY 2: config for locize live download usage
//let config = {
//	i18n: {
//		defaultLocale: "en",
//		locales: ["en", "ja", "ko", "zh"],
//	},
//	load: "languageOnly",
//	// this will download the translations from locize directly, in client (browser) and server (node.js)
//	// DO NOT USE THIS if having a serverless environment => this will generate too much download requests
//	//   => https://github.com/locize/i18next-locize-backend#important-advice-for-serverless-environments---aws-lambda-google-cloud-functions-azure-functions-etc
//	backend: {
//		projectId: "a02d5f79-d306-46f7-ae6d-81c0ad28db09",
//		apiKey: "345000ff-03a2-408b-8639-89a47f0f5826",
//		referenceLng: "zh",
//		version: SYS_ENV === "development" ? "latest" : "pro",
//	},
//	use: [require("i18next-locize-backend/cjs")],
//	defaultNS: "default",
//	fallbackLng: "en",
//	keySeparator: false,
//	interpolation: {
//		escapeValue: false,
//		keySeparator: ".",
//		formatSeparator: ",",
//		format: (value, format, lng) => {
//			if (format === "uppercase") return value.toUpperCase();
//		},
//	},
//	serverLanguageDetection: true,
//	serverSideRender: true,
//	ns: nsList, // the namespaces needs to be listed here, to make sure they got preloaded
//	serializeConfig: false, // because of the custom use i18next plugin
//	debug: isBrowser ? (SYS_ENV === "development" ? true : false) : false,
//	saveMissing: SYS_ENV === "development" ? true : false, // do not saveMissing to true for production,
//	wait: true,
//};
//
//module.exports = config;
// POSSIBILITY 3: bundle translations with app
// for a serverless environment bundle the translations first. See downloadLocales script in package.json
// and configre this file like this:
let config = {
	i18n: {
		defaultLocale: SYS_ENV === "development" ? "zh" : "en",
		locales: ["en", "ja", "ko", "zh"],
	},
	defaultNS: "default",
	fallbackLng: SYS_ENV === "development" ? "zh" : "en",
	load: "languageOnly",
	ns: nsList,
	saveMissing: SYS_ENV === "development" ? true : false,
	debug: isBrowser ? (SYS_ENV === "development" ? true : false) : false,
	updateMissing: false,
	wait: true,
	backend: {
		referenceLng: SYS_ENV === "development" ? "zh" : "en",
		/**
		 * 需要填写文件路径，否则无法使用saveMissing
		 * 看起来这里的配置被next自动配置成了fsbackend了
		 */
		addPath: `./public/locales/{{lng}}/{{ns}}.json`,
	},
	saveMissingTo: "fallback",
};
module.exports = config;
