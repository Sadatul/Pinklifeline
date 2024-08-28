import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { getSubscriptions } from '../../../../subscriptionsStore'; // Adjust the path if needed

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

webPush.setVapidDetails('mailto:your-email@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export async function POST(request) {
    try {
        const { title, body } = await request.json();
        const subscriptions = getSubscriptions();
        console.log('Subscriptions:', subscriptions);

        subscriptions.forEach(subscription => {
            const payload = JSON.stringify({ title, body });

            webPush.sendNotification(subscription, payload).catch(error => {
                console.error('Error sending notification:', error);
            });
        });

        return NextResponse.json({ message: 'Notifications sent' });
    } catch (e) {
        console.log(e);
        return NextResponse.error({ message: 'Error sending notification', error: e });
    }
}
