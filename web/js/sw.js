"use strict";

// TODO
const version = 1
var isOnline = true;
var isLoggedIn = false;
self.addEventListener('install', onInstall)
self.addEventListener('activate', onActive)
self.addEventListener("message", onMessage);

main().catch(console.error)

async function main() {
  await sendMessage({ statusUpdateRequest: true });
  console.log(`service worker ${version} is starting...`)
}

async function onInstall(e) {
  console.log(`service worker ${version} is install...`)
  self.skipWaiting()
}

function onActive(e) {
  e.waitUntil(handleActive())
}
async function handleActive() {
  await clients.claim()
  console.log(`service worker ${version} is active...`)
}

function onMessage({ data }) {
	if ("statusUpdate" in data) {
		({ isOnline, isLoggedIn } = data.statusUpdate);
		console.log(`Service Worker (v${version}) status update... isOnline:${isOnline}, isLoggedIn:${isLoggedIn}`);
	}
}
async function sendMessage(msg) {
	var allClients = await clients.matchAll({ includeUncontrolled: true, });
	return Promise.all(
		allClients.map(function sendTo(client){
			var chan = new MessageChannel();
			chan.port1.onmessage = onMessage;
			return client.postMessage(msg,[chan.port2]);
		})
	);
}