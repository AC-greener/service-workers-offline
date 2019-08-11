(function Blog(){
	"use strict";

	var offlineIcon;
	var isLoggedIn = /isLoggedIn=1/.test(document.cookie.toString() || "")
	var isOnline = "onLine" in navigator && navigator.onLine
	var usingSW = ("serviceWorker" in navigator)
	var swRegistration
	var svWorker


	document.addEventListener("DOMContentLoaded",ready,false)

	initServiceWorker().catch(console.error)

	// **********************************

	function ready() {
		offlineIcon = document.getElementById("connectivity-status");
		if(!isOnline) {
			offlineIcon.classList.remove("hidden")
		}
		window.addEventListener("online",function online(){
			offlineIcon.classList.add("hidden")
			isOnline = true
			sendStatusUpdate()
		},false);
		window.addEventListener("offline",function offline(){
			offlineIcon.classList.remove("hidden")
			isOnline = false
			sendStatusUpdate()
		},false)
	}

	async function initServiceWorker() {
		swRegistration = await navigator.serviceWorker.register('/sw.js', {
			updateViaCache: 'none'
		})
		svWorker = swRegistration.installing || swRegistration.waiting || swRegistration.active
		sendStatusUpdate(svWorker)

		navigator.serviceWorker.addEventListener("controllerchange", function onControl() {
			svWorker = navigator.serviceWorker.controller
			sendStatusUpdate(svWorker)
		})
		navigator.serviceWorker.addEventListener("message",onSWMessage,false);
	}

	function onSWMessage(evt) {
		var { data } = evt;
		if (data.statusUpdateRequest) {
			console.log("Status update requested from service worker, responding...");
			sendStatusUpdate(evt.ports && evt.ports[0]);
		}
		else if (data == "force-logout") {
			document.cookie = "isLoggedIn=";
			isLoggedIn = false;
			sendStatusUpdate();
		}
	}

	function sendStatusUpdate(target) {
		sendSWMessage({statusUpdate: {isOnline, isLoggedIn}}, target)
	}
	function sendSWMessage(msg, target) {
		if (target) {
			target.postMessage(msg)
		} else if(svWorker) {
			svWorker.postMessage(msg)
		} else if(navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage(msg)
		}
	}

})();
