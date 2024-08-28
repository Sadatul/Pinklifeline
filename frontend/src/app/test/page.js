'use client'

import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useState } from "react";

const subscribeUser = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            // Request notification permission
            console.log('Requesting notification permission...');
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);

            if (permission === 'granted') {
                // Register the service worker
                const registration = await navigator.serviceWorker.register('/worker.js');
                console.log('Service Worker registered successfully:', registration);

                // Subscribe the user to push notifications
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY // Replace with your actual VAPID public key
                });

                console.log('User is subscribed:', subscription);
                // Send subscription to your server to store it using Axios
                await axiosInstance.post('/api/subscribe', subscription, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('User is subscribed:', subscription);
            } else {
                console.warn('Notification permission denied');
            }
        } catch (error) {
            console.error('Service Worker registration or subscription failed:', error);
        }
    } else {
        console.warn('Push messaging is not supported in this browser');
    }
};

export default function TestPage() {
    useEffect(() => {
        subscribeUser();
    }, []);

    return (
        <div className="flex flex-col p-4 ">
            <h1 className="text-2xl font-bold">Test Page</h1>
            <p className="text-lg">This is a test page</p>
            <button className="bg-pink-500 w-fit text-white p-2 rounded hover:scale-90" onClick={subscribeUser}>Enable Notifications</button>
        </div>
    )
}