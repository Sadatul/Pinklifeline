'use client'

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner";
import { useStompContext } from "@/app/context/stompContext";
import { addAppointment, addReview, deleteDoctorReview, getUserProfileDetails, locationOnline, messageSendUrl, roles, testingAvatar, updateDoctorReview } from "@/utils/constants";
import Image from "next/image";
import { BriefcaseBusiness, CalendarSearch, Check, Hospital, MessageCirclePlus, MessageCircleReply, Pencil, Phone, Send, Star, StarHalf, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Pagination, PaginationItem } from "@mui/material";
import { Ripple } from "primereact/ripple";
import { BsPersonVcardFill } from "react-icons/bs";
import { PiCertificate } from "react-icons/pi";
import { FaChair } from "react-icons/fa";
import AddAppointAnimation from "../../../../../../../public/profile/AddAppointment.json"
import EmptyAppointment from "../../../../../../../public/profile/emptyAppointment.json"
import Lottie from "lottie-react";
import Avatar from "@/app/components/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSessionContext } from "@/app/context/sessionContext";
import axiosInstance from "@/utils/axiosInstance"
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import Loading from "@/app/components/loading";
import { role } from "@stream-io/video-react-sdk";

export default function () {
    const sessionContext = useSessionContext()
    const [userData, setUserData] = useState(null)
    const params = useParams()
    const profileName = "The Last Airbender Aang"
    const profilePic = "https://sm.ign.com/t/ign_nordic/cover/a/avatar-gen/avatar-generations_prsz.300.jpg"
    const stompContext = useStompContext();

    useEffect(() => {
        if (sessionContext.sessionData) {
            axiosInstance.get(getUserProfileDetails(params.profileId), {
                headers: sessionContext.sessionData.headers
            }).then((res) => {
                setUserData({
                    ...res.data,
                    role: res?.data?.roles[0]
                })
            }).catch((error) => {
                console.log(error)
                toast.error("Error loading. Check internet.")
            })
        }
    }, [sessionContext.sessionData])

    const sendMessage = () => {
        if (!sessionContext.sessionData) return toast.message("Log in to send messages")
        const messageInput = document.getElementById('message')?.value
        if (messageInput !== '' && params.profileId) {
            const messageObject = {
                receiverId: params.profileId,
                message: messageInput,
                timestamp: new Date().toISOString(),
                type: "TEXT"
            }
            console.log('Sending message')
            console.log(messageObject)
            stompContext.stompClientRef.current.publish(
                {
                    destination: messageSendUrl,
                    body: JSON.stringify(messageObject),
                }
            );
        }
    }

    if (!userData) return <Loading />

    return (
        <ScrollableContainer className="flex w-screen overflow-x-hidden flex-col flex-grow p-4 items-center bg-gradient-to-r from-gray-100 via-zinc-100 to-slate-100" tabIndex={0} style={{ outline: 'none' }}>
            <div className="flex flex-col w-11/12 items-center rounded-t-md bg-white flex-wrap">
                <div className="relative w-full h-28 rounded-t-md">
                    <Image
                        src={"https://img.freepik.com/free-vector/watercolor-hot-pink-background_23-2150815041.jpg?size=626&ext=jpg&uid=R109267787&ga=GA1.1.1367600061.1718446141&semt=sph"}
                        alt="Background"
                        fill={true}
                        className="absolute inset-0 w-full h-full object-cover rounded-t-md"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white from-10% via-50% via-transparent to-transparent rounded-t-md"></div>
                </div>
                <div className="flex flex-row w-full bg-white rounded-b-md p-4 relative justify-between px-7 flex-wrap">
                    <div className="absolute -top-20 flex flex-col items-center">
                        {userData.profilePicture && <Image src={userData.profilePicture} width={200} height={200} className="rounded  shadow-md" alt="profile-picture" />}
                        {userData.role === roles.patient &&
                            <Badge className={"mt-2 text-sm"}>{userData.cancerStage}</Badge>
                        }
                    </div>
                    <div className="flex flex-col ml-56 gap-1">
                        <h1 className="text-2xl font-bold ">{userData.fullName}</h1>
                        <h1 className="text-base ">{userData.username}</h1>
                        {userData.role === roles.patient &&
                            <h1 className="text-sm ">{userData.diagnosisDate}</h1>
                        }
                    </div>
                    <div className="flex flex-row items-center mr-3 mt-12">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="bg-blue-700 text-white px-2 py-2 rounded-md text-base flex flex-row items-center">
                                    <MessageCirclePlus size={24} strokeOpacity={1} strokeWidth={2} />
                                    <span className="ml-1 font-semibold">Message</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div className="flex flex-col">
                                    <textarea id="message" className="w-full h-16 p-2 border border-gray-300 rounded-md" placeholder="Type your message here"></textarea>
                                    <button onClick={sendMessage} className="bg-blue-500 text-white px-2 py-2 text-base rounded-md mt-2">Send</button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <Separator className="w-11/12 mt-10 h-[2px]" />
            </div>
            <div className="flex flex-col w-11/12 items-center mt-4">
                < PostSection userId={params.profileId} className={"bg-gradient-to-b from-indigo-50 to-white"} />
            </div>
        </ScrollableContainer>
    )
}

function PostSection({ userId, className }) {
    const [currentForumQuestionPage, setCurrentForumQuestionPage] = useState(1)
    const [totalForumQuestionPages, setTotalForumQuestionPages] = useState(12)
    const [similarPersons, setSimilarPersons] = useState([
        { name: "Robin", profilePic: testingAvatar, workPlace: "Dhaka Medical College" },
        { name: "Robin", profilePic: testingAvatar, workPlace: "Dhaka Medical College" },
        { name: "Robin", profilePic: testingAvatar, workPlace: "Dhaka Medical College" },
    ])

    return (
        <div className={cn("flex flex-row w-full mt-4 p-4 rounded", className)}>
            <div className="flex flex-col rounded w-9/12 gap-3">
                <h1 className={"text-xl font-bold bg-white px-2 py-1 text-indigo-500 w-52 rounded"}>Forum Questions</h1>
                <div className="flex flex-col">
                    <ForumCard title="How to deal with anxiety?" content="I have been feeling anxious lately. How do I deal with it?" date="2021-09-01" likesCount={10} commentsCount={15} />
                    <ForumCard title="How to deal with anxiety?" content="I have been feeling anxious lately. How do I deal with it?" date="2021-09-01" likesCount={14} commentsCount={9} />
                </div>
                <div className="w-full flex justify-center mt-4">
                    <Pagination count={totalForumQuestionPages}
                        page={currentForumQuestionPage}
                        boundaryCount={3}
                        size="large"
                        variant="outlined"
                        onChange={(event, value) => {
                            setCurrentForumQuestionPage(value)
                        }}
                        color={"secondary"}
                    />
                </div>
            </div>
            <div className="flex flex-col bg-white rounded-md items-center p-4 m-3 ml-7 w-3/12">
                <h1 className="text-xl ">Similar Persons</h1>
                <Separator className="w-11/12 h-[1.5px] mt-2 bg-purple-100" />
                <div className="flex flex-col w-full mt-3">
                    {similarPersons.map((person, index) => (
                        <div key={index} className="flex flex-row items-center justify-between w-full h-16 py-2 px-1 border border-gray-300 rounded-md mt-2">
                            <Avatar avatarImgScr={person.profilePic} size={40} />
                            <div className="flex flex-col ml-2">
                                <h1 className="text-base">{person.name}</h1>
                                <h1 className="text-sm">{person.workPlace}</h1>
                            </div>
                            <button className=" bg-violet-300 text-black px-2 py-1 text-sm rounded-md ml-2">View</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ForumCard({ title, content, date, likesCount, commentsCount }) {
    return (
        <div className="flex flex-row w-full m-1 bg-white rounded-md drop-shadow-sm h-28 to-zinc-100">
            <div className="flex flex-col w-full px-4 py-2">
                <h1 className="text-2xl font-bold line-clamp-1">{title}</h1>
                <p className="mt-2 line-clamp-2">{content}</p>
                <div className="flex flex-row justify-between mt-1 py-1 w-full">
                    <div className="flex flex-row">
                        <span className="flex">
                            <ThumbsUp size={20} fill="white" className="text-blue-400" />
                            {likesCount}
                        </span>
                        <span className="flex">
                            <MessageCircleReply size={20} className="text-pink-400 ml-6" />
                            {commentsCount}
                        </span>
                    </div>
                    <span className="text-sm font-semibold text-end w-full">{date}</span>
                </div>
            </div>
        </div>
    )
}