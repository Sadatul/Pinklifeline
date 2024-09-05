'use client'

import axiosInstance from "@/utils/axiosInstance";
import { subscribeNotficationsUrl } from "@/utils/constants";
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
                const subscriptionJson = subscription.toJSON();
                await axiosInstance.post(subscribeNotficationsUrl, {
                    "endpoint": subscriptionJson.endpoint,
                    "publicKey": subscriptionJson.keys.p256dh,
                    "auth": subscriptionJson.keys.auth,
                    "permissions": 1
                  }, {
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

const unsubscribeUser = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            // Get the service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Get the current subscription
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Unsubscribe from push notifications
                await subscription.unsubscribe();
                console.log('User is unsubscribed:', subscription);

                // Optionally, notify your server about the unsubscription
                // await axiosInstance.post('/api/unsubscribe', {
                //     endpoint: subscription.endpoint, // Use the endpoint to identify the subscription on the server
                // }, {
                //     headers: {
                //         'Content-Type': 'application/json'
                //     }
                // });

                console.log('Subscription removed from server');
            } else {
                console.warn('No active subscription found');
            }
        } catch (error) {
            console.error('Failed to unsubscribe the user:', error);
        }
    } else {
        console.warn('Push messaging is not supported in this browser');
    }
};


export default function TestPage() {
    useEffect(() => {
        // subscribeUser();
    }, []);

    return (
        <div className="flex flex-col p-4 gap-4">
            <h1 className="text-2xl font-bold">Test Page</h1>
            <p className="text-lg">This is a test page</p>
            <button className="bg-pink-500 w-fit text-white p-2 rounded hover:scale-90" onClick={() => {
                subscribeUser();
            }}>
                Enable Notifications
            </button>
            <button className="bg-pink-500 w-fit text-white p-2 rounded hover:scale-90" onClick={() => {
                unsubscribeUser();
            }}>
                Disable Notifications
            </button>
        </div>
    )
}