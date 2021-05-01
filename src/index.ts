// import {
//     // WebSocket,
//     WebSocketEvent
// } from "https://deno.land/std@0.93.0/ws/mod.ts";

import {SocketConnection, closes, errors} from "./SocketConnection.ts";

const socks = [];

const sockConn = new SocketConnection('wss://www.bitforex.com/mkapi/coinGroup1/ws', {restart: true});
sockConn.addMessageListener((event: MessageEvent) => console.log(event.data));
sockConn.send(`[{"type":"subHq","event":"kline","param":{"businessType":"coin-usdt-btc", "kType":"1min", "size":20}}]`);
socks.push(sockConn);


// import {Coin} from 'https://raw.githubusercontent.com/ALMaclaine/deno_bitforex_types/master/mod.ts';
//
// const a: Coin = {
//     symbol: 'hello'
// }
//
// console.log(a);

import { signal } from "https://deno.land/std/signal/mod.ts";

const sig = signal(
    Deno.Signal.SIGUSR1,
    Deno.Signal.SIGINT
);

for await (const _ of sig) {
    console.log(`Closes: ${closes}`);
    console.log(`Errors: ${errors}`);
    Deno.exit();
}
