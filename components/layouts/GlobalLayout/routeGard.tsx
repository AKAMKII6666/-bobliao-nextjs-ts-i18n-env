/**
 * 此文件用于在全局layout中做路由守卫用
 */

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, FC, ReactElement } from "react";
import Router from "next/router";
import { Iexport } from "../../hooks/userStateHook";

const useRouterGard = (userState: Iexport): void => {
	//===============useHooks=================

	//===============state====================
	const [isMounted, setIsMounted] = useState<boolean>(false);

	//===============static===================

	//===============ref======================

	//===============function=================
	const loadData = async function (): Promise<void> {};

	//===============effects==================
	useEffect(
		function (): ReturnType<React.EffectCallback> {
			if (isMounted === false) {
				setIsMounted(true); /* 
				Router.events.on("routeChangeStart", function (url) {
                    //用户没登录的话，除了登录页面，其它页面都不允许访问
                    if(!userState.isLogin){

                    }
                }); */
			}
		},
		[isMounted]
	);

	useEffect(function (): ReturnType<React.EffectCallback> {
		return function (): void {
			setIsMounted(false);
		};
	}, []);
};
export default useRouterGard;
