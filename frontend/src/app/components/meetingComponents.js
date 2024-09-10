'use client'

import { useEffect, useState } from 'react';
import {
    DeviceSettings,
    VideoPreview,
    useCall,
    CallControls,
    CallParticipantsList,
    CallStatsButton,
    CallingState,
    PaginatedGridLayout,
    SpeakerLayout,
    useCallStateHooks,
    ReactionsButton,
    CancelCallButton,
    ToggleAudioOutputButton,
    ToggleVideoPublishingButton,
    ToggleAudioPublishingButton,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, Mic, MicOff, Camera, CameraOff } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react';
import Loading from './loading';
import { set } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import axiosInstance from "@/utils/axiosInstance"
import { closeVideoCall, pagePaths } from '@/utils/constants';
import { useSessionContext } from '@/app/context/sessionContext';

const EndCallButton = () => {
    const call = useCall();
    const router = useRouter();

    if (!call)
        throw new Error(
            'useStreamCall must be used within a StreamCall component.',
        );

    const { useLocalParticipant } = useCallStateHooks();
    const localParticipant = useLocalParticipant();

    const isMeetingOwner =
        localParticipant &&
        call.state.createdBy &&
        localParticipant.userId === call.state.createdBy.id;

    if (!isMeetingOwner) return null;

    const endCall = async () => {
        await call.endCall();
        router.push(pagePaths.dashboard);
    };

    return (
        <Button onClick={endCall} className="bg-red-500">
            End call for everyone
        </Button>
    );
};

export function MeetingSetup({ setIsSetupComplete }) {
    const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
    const callStartsAt = useCallStartsAt();
    const callEndedAt = useCallEndedAt();
    const callTimeNotArrived = callStartsAt && new Date(callStartsAt) > new Date();
    const callHasEnded = !!callEndedAt;

    const call = useCall();

    if (!call) {
        throw new Error(
            'useStreamCall must be used within a StreamCall component.',
        );
    }

    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    useEffect(() => {
        call.microphone.enable();
        call.camera.enable();
    }, [])


    // if (callTimeNotArrived)
    //     return (
    //         <Alert>
    //             <Terminal className="h-4 w-4" />
    //             <AlertTitle>Your Meeting has not started yet!</AlertTitle>
    //             <AlertDescription>
    //                 It is scheduled for {callStartsAt.toLocaleString()}
    //             </AlertDescription>
    //         </Alert>
    //     );

    // if (callHasEnded)
    //     return (
    //         <Alert>
    //             <Terminal className="h-4 w-4" />
    //             <AlertTitle>Your Meeting is already over!</AlertTitle>
    //             <AlertDescription>
    //                 It has ended at {callHasEnded.toLocaleString()}
    //             </AlertDescription>
    //         </Alert>
    //     );

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-black p-8">
            <h1 className="text-center text-2xl font-bold">Setup</h1>
            <Separator className="w-1/3 h-[1.5px] bg-pink-500" />
            <VideoPreview className='flex-1 w-2/3' />
            <div className="flex h-16 items-center justify-center gap-3 w-2/3">
                <div className='flex flex-row w-auto justify-center gap-5'>

                    <ToggleAudioPublishingButton />
                    <ToggleVideoPublishingButton />
                </div>

                <DeviceSettings />
            </div>
            <Button
                className="rounded-md bg-green-700 px-4 py-2.5"
                onClick={() => {
                    call.join();
                    setIsSetupComplete(true);
                }}
            >
                Join meeting
            </Button>
        </div>
    );
};


export function MeetingRoom() {
    const call = useCall();
    const sessionContext = useSessionContext();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [layout, setLayout] = useState('speaker-left');
    const [showParticipants, setShowParticipants] = useState(false);
    const { useCallCallingState } = useCallStateHooks();

    const callingState = useCallCallingState();

    if (callingState !== CallingState.JOINED) return <Loading />;

    call.on('call.ended', (() => {
        console.log("Call ended");
        call.microphone.disable()
        call.camera.disable()
        axiosInstance.delete(closeVideoCall).then((res) => {
            console.log(res.data);
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            router.push(pagePaths.dashboardPages.appointmentsPage);
        })
    }))

    const CallLayout = () => {
        switch (layout) {
            case 'grid':
                return <PaginatedGridLayout />;
            case 'speaker-right':
                return <SpeakerLayout participantsBarPosition="left" />;
            default:
                return <SpeakerLayout participantsBarPosition="right" />;
        }
    };

    const endCall = async () => {
        console.log("Ending call")
        axiosInstance.delete(closeVideoCall).then((res) => {
            console.log(res.data);
        }).catch((err) => {
            console.log(err);
        });
        call.microphone.disable()
        call.camera.disable()
        await call.endCall();
    };

    return (
        <div className="h-full w-full overflow-hidden text-black flex flex-col justify-between">
            <div className="flex flex-col items-center w-full flex-1 mt-16 justify-center">
                <div className="flex size-full max-w-[1000px]">
                    <CallLayout />
                </div>
                {showParticipants && (
                    <div className="mx-3">
                        <CallParticipantsList />
                    </div>
                )}
            </div>
            {/* Adding padding to avoid overlap with the fixed button row */}
            <div className="pb-20"></div>
            {/* Video layout and call controls */}
            <div className="fixed bottom-0 h-16 flex w-full items-center justify-center gap-5 bg-gray-50">
                <div className="flex flex-row gap-3 w-auto">
                    <ToggleAudioPublishingButton />
                    <ToggleVideoPublishingButton />
                    <ReactionsButton />
                    <DropdownMenu>
                        <div className="flex items-center">
                            <DropdownMenuTrigger className="cursor-pointer rounded-full bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                                <LayoutList size={20} className="text-white" />
                            </DropdownMenuTrigger>
                        </div>
                        <DropdownMenuContent className="bg-gray-50 text-black">
                            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                                <div key={index}>
                                    <DropdownMenuItem onClick={() => setLayout(item.toLowerCase())}>
                                        {item}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="border-dark-1" />
                                </div>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                        className="bg-[#19232d] px-4 rounded-3xl"
                        onClick={() => setShowParticipants((prev) => !prev)}
                    >
                        <Users size={24} className="text-white" />
                    </button>
                    <CancelCallButton onClick={endCall} />
                </div>
            </div>
        </div>
    );
};


