'use client'

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner";
import { useStompContext } from "@/app/context/stompContext";
import {  displayDate, emptyAvatar, forumQuestionsAnonymousUrl, getUserProfileDetails, messageSendUrl, pagePaths, roles, testingAvatar, updateDoctorReview } from "@/utils/constants";
import Image from "next/image";
import {  ExternalLink,  MessageCirclePlus, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import { Pagination } from "@mui/material";
import { useSessionContext } from "@/app/context/sessionContext";
import axiosInstance from "@/utils/axiosInstance"
import Loading from "@/app/components/loading";
import Link from "next/link";

export default function USerProfilePage() {
    const sessionContext = useSessionContext()
    const [userData, setUserData] = useState(null)
    const params = useParams()
    const stompContext = useStompContext();

    useEffect(() => {
        if (sessionContext?.sessionData) {
            axiosInstance.get(getUserProfileDetails(params.profileId)).then((res) => {
                setUserData({
                    ...res.data,
                    role: res?.data?.roles[0]
                })
            }).catch((error) => {
                console.log(error)
                toast.error("Error loading. Check internet.")
            })
        }
    }, [sessionContext?.sessionData, params.profileId])

    const sendMessage = () => {
        if (!sessionContext?.sessionData) return toast.message("Log in to send messages")
        const messageInput = document.getElementById('message')?.value
        if (messageInput && messageInput?.trim() !== '' && params.profileId) {
            const messageObject = {
                receiverId: params.profileId,
                message: messageInput,
                timestamp: new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000).toISOString(),
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
            toast.success("Message sent")
            document.getElementById('message').value = ''
        }
    }

    if (!userData) return <Loading />

    return (
        <ScrollableContainer className="flex w-screen overflow-x-hidden flex-col flex-grow p-4 items-center bg-gradient-to-r from-gray-100 via-zinc-100 to-slate-100" tabIndex={0} style={{ outline: 'none' }}>
            <div className="flex flex-col w-11/12 items-center rounded-t-md bg-white flex-wrap shadow-md">
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
                         <Image src={userData.profilePicture || emptyAvatar} width={200} height={200} className="rounded  shadow-md" alt="profile-picture" />
                        {userData.role === roles.patient &&
                            <Badge className={"mt-2 text-sm"}>{userData.cancerStage}</Badge>
                        }
                    </div>
                    <div className="flex flex-col ml-56 gap-1">
                        <h1 className="text-2xl font-bold ">{userData.fullName}</h1>
                        <Link href={`mailto:${userData.username}`} className="text-base ">{userData.username}</Link>
                        {userData.role === roles.patient &&
                            <h1 className="text-sm ">{userData.diagnosisDate}</h1>
                        }
                    </div>
                    <div className="flex flex-row items-center mr-3 mt-12">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="bg-blue-700 text-white px-2 py-2 rounded-md text-base flex flex-row items-center">
                                    <MessageCirclePlus size={24} strokeOpacity={1} strokeWidth={1.5} />
                                    <span className="ml-1">Ask Something</span>
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
            <div className="flex flex-col w-11/12 items-center mt-1">
                < PostSection userId={params.profileId} className={"bg-gradient-to-b from-indigo-50 to-white"} />
            </div>
        </ScrollableContainer>
    )
}

function PostSection({ userId, className }) {
    const [forumQuestions, setForumQuestions] = useState([])
    const [currentForumQuestionPage, setCurrentForumQuestionPage] = useState(1)
    const [totalForumQuestionPages, setTotalForumQuestionPages] = useState(12)
    const [page, setPage] = useState(null)
    const [similarPersons, setSimilarPersons] = useState([
        { name: "Robin", profilePic: testingAvatar, workPlace: "Dhaka Medical College" },
        { name: "Robin", profilePic: testingAvatar, workPlace: "Dhaka Medical College" },
        { name: "Robin", profilePic: testingAvatar, workPlace: "Dhaka Medical College" },
    ])

    useEffect(() => {
        axiosInstance.get(forumQuestionsAnonymousUrl, {
            params: {
                userId: userId,
                page: (page?.number || 1) - 1
            }
        }).then((res) => {
            setForumQuestions(res?.data?.content?.map(question => {
                return {
                    id: question?.id,
                    title: question?.title,
                    voteCount: question?.voteCount,
                    createdAt: question?.createdAt,
                    answerCount: null,
                }
            }))
            setPage(res.data.page)
            console.log(res.data)
        }).catch((error) => {
            console.log(error)
        })
    }, [page?.number])

    return (
        <div className={cn("flex flex-row w-full mt-4 p-4 rounded-b-xl shadow-md flex-1", className)}>
            <div className="flex flex-col rounded w-full gap-3 h-full">
                <h1 className={"text-xl font-bold bg-white px-2 py-1 text-indigo-500 w-52 rounded"}>Forum Questions</h1>
                <div className="flex flex-row flex-wrap items-center w-full gap-3 flex-1">
                    {forumQuestions.map((question, index) => (
                        <div key={index} className="flex flex-col justify-between gap-2 border rounded-xl p-3 shadow-md line-clamp-2 w-[450px] relative bg-zinc-50">
                            <div className="flex flex-col gap-0 w-full">
                                <span className="text-xs translate-y-[1.5px] text-gray-800 absolute top-3 right-3">{displayDate(question?.createdAt, "dd MMM, yy")}</span>
                                <div className="flex flex-row items-center gap-2 mt-3">
                                    <span className="text-lg font-[500] line-clamp-3">{question.title}</span>
                                </div>
                            </div>
                            <div className="flex flex-row items-center justify-between gap-1 w-full">
                                <Link href={pagePaths.questionPageById(question.id)} className="text-sm text-blue-500 hover:underline flex items-center">
                                    View Question and Answers
                                    <ExternalLink size={14} className="ml-1" />
                                </Link>
                                <div className="flex flex-row items-center gap-1">
                                    <ThumbsUp size={16} />
                                    <span className="text-sm text-gray-800">{question.voteCount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="w-full flex justify-center mt-4">
                    <Pagination count={page?.totalPages || 0}
                        page={page?.number || 1}
                        boundaryCount={3}
                        size="large"
                        variant="outlined"
                        onChange={(event, value) => {
                            setPage({ ...page, number: value })
                        }}
                        color={"secondary"}
                    />
                </div>
            </div>
        </div>
    )
}

function ForumCard({ title, content, date, likesCount, id }) {
    return (
        <div className="flex flex-row w-10/12 m-1 bg-white bg-opacity-70 drop-shadow-sm border-b border-b-gray-700 px-10">
            <div className="flex flex-col w-full px-4 py-2">
                <Link href={pagePaths.questionPageById(id)} className="hover:underline text-2xl font-bold line-clamp-1">{title}</Link>
                <p className="mt-2 line-clamp-2">{content}</p>
                <div className="flex flex-row justify-between mt-1 py-1 w-full">
                    <div className="flex flex-row">
                        <span className="flex text-nowrap gap-1">
                            <ThumbsUp size={20} fill="white" className="text-blue-400" />
                            {likesCount}
                        </span>
                    </div>
                    <span className="text-sm font-semibold text-end w-full">{date}</span>
                </div>
            </div>
        </div>
    )
}