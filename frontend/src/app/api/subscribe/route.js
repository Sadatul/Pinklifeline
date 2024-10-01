import { NextResponse } from 'next/server';
import { addSubscription } from '../../../../subscriptionsStore'; // Adjust the path if needed

export async function POST(request) {
    const subscription = await request.json();
    console.log("subscription", subscription);
    addSubscription(subscription);
    console.log(subscription);
    return NextResponse.json({
        message: 'Subscription added'
    }, { status: 201 });
}
