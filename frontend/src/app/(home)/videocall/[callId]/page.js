'use client'

import { useState } from "react"
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk"
import { useParams } from "next/navigation"
import { useGetCallById } from "@/hooks/useGetCallById"
import { MeetingSetup } from "@/app/components/meetingComponents"
import { MeetingRoom } from "@/app/components/meetingComponents"
import Loading from "@/app/components/loading"

const MeetingPage = () => {
    const { id } = useParams();
    const { call, isCallLoading } = useGetCallById(id);
    const [isSetupComplete, setIsSetupComplete] = useState(false);
  
    if (isCallLoading) return <Loading />;
  
    if (!call) return (
      <p className="text-center text-3xl font-bold text-white">
        Call Not Found
      </p>
    );
  
    console.log("Got the call");
    console.log(call);
  
    return (
      <div className="h-screen w-full bg-gradient-to-b from-zinc-100 via-slate-200 to-gray-200">
        <StreamCall call={call}>
          <StreamTheme className="w-full h-full">
  
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
          </StreamTheme>
        </StreamCall>
      </div>
    );
  };
  
  export default MeetingPage;