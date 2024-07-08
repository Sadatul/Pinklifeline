'use client'

import { messageSendUrl, stompBrokerUrl, subscribeErrorUrl, subscribeMessageUrl } from '@/utils/constants';
import { Client } from '@stomp/stompjs';
import React, { useState } from 'react'

let basicObj = {
    socketUrl: "",
    headers: {},
    subscribeUrl: "",
    isConncected: false,
}
let stompClient = null;

// ws://localhost:8080/ws
// /topic/greetings

// sadatulislamsadi@gmail.com 2 -> Bearer eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJzZWxmIiwic3ViIjoiMiIsImF1ZCI6InBpbmtsaWZlbGluZSIsInNjcCI6IlJPTEVfUEFUSUVOVCIsImV4cCI6MTcxOTkyNDI0NywiaWF0IjoxNzE5OTIwNjQ3fQ.RT_IW5BKsXs7xLKw3rOx_-TvWd9fcf7FWSKWyoa-Yi7v61-uH9INIDmCv9loZQFaJ7LEU42QiZq1im26LO1IsWWsyUE9L0WLMeKZd5FQhWGnx5xSUs6zebYp05oC6RA2MtL_ChqFrL13oepqr4dZY7xAQ-JmXQEgAmu16wRRfhdRtn9i0fF3tc1ID5nTd5iGCJ_K0jelvPUTFjuZo5nJ3FKUDNbR1YL3XdurooORCqs3HoF2Gf9koH4rJilYKs-O0jquTZZrzKfSwvmX4f_ozOa_-sUSUP7iVlrxlcC-T3hDKLVERA8wroRNI7n2OXPG7LQ9BT9YOmI3ySZ8BFSVLg
// 2005077@ugrad.cse.buet.ac.bd 3 -> Bearer eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJzZWxmIiwic3ViIjoiMyIsImF1ZCI6InBpbmtsaWZlbGluZSIsInNjcCI6IlJPTEVfUEFUSUVOVCIsImV4cCI6MTcxOTg5MDA0NywiaWF0IjoxNzE5ODg2NDQ3fQ.ryyLkVQbH67Wk67086C_PXatrnxdau1HL0PVgi1btCNS1BEMIpLb23mXjkaVxxSfWnybFSsBS_kfQ1_JjxrbgDErCZDrNJbc-fgnsiu44lCiL9gsR3IRT3sZZGx6NwDrwgUz82mcK2RgvOxXiKkbGTDI7WmHObY2IqlhvfRX1VAiTbC5clc9Q-OTiAnz3lg5is5GI_5HnDHY_9xuSLo0YnWIsrjhVORZZxNnl7Bwd9bCJc_jTiaT2hdUe3o5pQEddFWIupgkRjE91YHJ8OXAAvTvtBxpNtetvX-xFU4EIm1pQS865aNB0EVmwpi5FNVXmIMyjArEDHHXmOQPPNwjDg
function App() {
    // const header = {
    //   Authorization: token
    // };

    const [webSocketUrl, setWebSocketUrl] = useState("");
    const [subscribeUrl, setSubscribeUrl] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [headers, setHeaders] = useState("");
    const [receiverId, setReceiverId] = useState("");
    const [message, setMessage] = useState("");
    const connect = () => {
        // {
        //   Authorization: "Bearer $TOKEN"
        // }
        const userId = localStorage.getItem('userId')
        const token = localStorage.getItem('token')
        console.log('user id:', userId)
        const headers = {
            Authorization: `Bearer ${token}`
        }
        // const socket = new SockJs('ws://localhost:8080/ws');
        stompClient = new Client({
            brokerURL: `ws://localhost:8080/ws`,
            connectHeaders: headers,
            debug: function (str) {
                console.log(str);
            },
            reconnectDelay: 0,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });
        stompClient.onConnect = (frame) => {
            console.log('Connected');
            setIsConnected(true);
            stompClient.subscribe(subscribeMessageUrl(userId), (response) => {
                console.log("Server response on message subscribe")
                console.log(response);
                console.log(JSON.parse(response.body));
            });
            stompClient.subscribe(subscribeErrorUrl(userId), (error) => {
                console.log("Serve response on error subscribe")
                console.log(error);
                console.log(JSON.parse(error.body));
            });
        }
        stompClient.onStompError = function (frame) {
            console.log('Broker reported error: ' + frame.headers['message']);
            console.log('Additional details: ' + frame.body);
        };

        stompClient.activate();
    }

    const disconnect = () => {
        stompClient.deactivate();
        setIsConnected(false);
        console.log('Disconnected');
    }

    const send = () => {
        console.log(stompClient)
        const messageObject = {
            receiverId: receiverId,
            message: message,
            timestamp: new Date().toISOString(),
            type: "TEXT"
        }
        console.log(messageObject);

        stompClient.publish(
            {
                destination: messageSendUrl,
                body: JSON.stringify(messageObject),
            }
        );
    }

    function textToObject(text) {
        let obj = {};
        text.split('\n').forEach((line) => {
            let [key, value] = line.split(':');
            obj[key] = value;
        });
        return obj;
    }

    return (
        <>
            {!isConnected &&
                <div className='flex flex-col items-center mt-10'>
                    {/* <div className='w-1/3 my-3 border-2 h-10 text-lg'>
                        <input className='w-full h-full pl-[14px]' type="text" value={webSocketUrl}
                            onChange={(e) => setWebSocketUrl(e.target.value)}
                            placeholder='WebSocketUrl' />
                    </div> */}
                    {/* <div className='w-1/3 my-3 border-2 h-10 text-lg'>
                        <input className='w-full h-full pl-[14px]' type="text" value={subscribeUrl}
                            onChange={(e) => setSubscribeUrl(e.target.value)}
                            placeholder='SubscirbeUrl'
                        />
                    </div> */}
                    {/* <div className='w-1/3 my-3 border-2 text-lg'>
                        <textarea className='w-full h-full pl-[14px]' value={headers} spellCheck='false'
                            onChange={(e) => setHeaders(e.target.value)}
                            placeholder='Headers'
                            rows={5}
                        ></textarea>
                    </div> */}
                    <button className='focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"' onClick={connect}>Connect</button>
                </div>
            }
            {
                isConnected &&
                <div className='flex flex-col items-center mt-10'>
                    <button className='focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800'
                        onClick={disconnect}>Disconnect
                    </button>
                    <div className='w-1/3 my-3 border-2 h-10 text-lg'>
                        <input className='w-full h-full pl-[14px]' type="text" value={receiverId}
                            onChange={(e) => setReceiverId(e.target.value)}
                            placeholder='Receiver Id'
                        />
                    </div>
                    <div className='w-1/3 my-3 border-2 text-lg'>
                        <textarea className='w-full h-full pl-[14px]' value={message} spellCheck='false'
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder='Message body'
                        ></textarea>
                    </div>
                    <button className='focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"'
                        onClick={send}>send</button>
                </div>
            }
        </>
    )
}

export default App
