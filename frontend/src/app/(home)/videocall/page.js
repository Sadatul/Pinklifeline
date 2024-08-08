'use client'

import { useStreamVideoClient } from "@stream-io/video-react-sdk"
import { useRouter } from "next/navigation"
import { useState } from "react";
import { toast } from "sonner";

export default function VideoCallPage() {
    const client = useStreamVideoClient();
    const [callId, setCallId] = useState(null);
    const router = useRouter();
    const [callDetail, setCallDetail] = useState();
    const createMetting = async () => {
        if (!client) {
            console.error("Client is not available");
            return;
        }
        try {
            if (!callId) toast.error('Call ID is required');
            const call = client.call('default', callId);
            if (!call) throw new Error('Failed to create meeting');
            const startsAt = new Date(Date.now()).toISOString();
            const tempCall = await call.getOrCreate({
                data: {
                    starts_at: startsAt,
                },
            });
            console.log("Call created");
            console.log(tempCall);
            // console.log(call);
            setCallDetail(call);
            const newWindow = window.open(`/videocall/${callId}`, '_blank');
            if (newWindow) {
                newWindow.focus();
            }

        } catch (err) {
            console.error(err);
            toast.error('Failed to create meeting');
        }
    }
    return (
        <div className="gap-4 grid grid-cols">
            <h1>Video Call Page</h1>
            <p>Call ID: {callId}</p>
            <input className="p-2 border border-black" type="text" onChange={(e) => setCallId(e.target.value)} />
            <button onClick={()=>{createMetting()}
            }>Create Meeting</button>
        </div>
    )
}