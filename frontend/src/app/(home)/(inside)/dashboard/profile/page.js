'use client'

import Avatar from "@/app/components/avatar"
import EditUserMapView from "@/app/components/editUserdetailsmapComponent"
import ScrollableContainer from "@/app/components/StyledScrollbar"
import { useSessionContext } from "@/app/context/sessionContext"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { convertCmtoFeetInch, displayDate, forumQuestionsUrl, generateFormattedDate, getProfilePicUrl, pagePaths, roles, toggleLocationShare, userInfoRegUrlReq } from "@/utils/constants"
import { Pagination } from "@mui/material"
import { format } from "date-fns"
import { cellToLatLng } from "h3-js"
import { BadgeAlert, BeanOff, CalendarCheck, CalendarDays, CalendarX, ExternalLink, HeartCrack, Loader2, RefreshCwIcon, RulerIcon, ThumbsUp, UserRoundX, Weight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"


export default function DashboardProfilePage() {
    const sessionContext = useSessionContext()
    const [userData, setUserData] = useState({
        "allergies": ["Peanut"],
        "organsWithChronicConditions": ["Heart", "Throat"],
        "cancerRelatives": ["Aunt", "Samiha"],
        "fullName": "Sadatul",
        "weight": 58.0,
        "avgCycleLength": 5,
        "cancerHistory": "Y",
        "lastPeriodDate": "2000-08-08",
        "dob": "2000-08-08",
        "medications": [
            {
                "name": "Napa Extra",
                "doseDescription": "3 times a day"
            },
            {
                "name": "Napa Extra",
                "doseDescription": "3 times a day"
            }
        ],
        "periodIrregularities": ["Higher pain", "Longer than average cycles"],
        "height": 175.0,
        "cancerStage": "SURVIVOR",
        "diagnosisDate": "2020-08-03",
        "location": "sdfasdfdsfsdfjsdfjfds",
        "locationShare": true
    })

    const [profilePicLink, setProfilePicLink] = useState("https://firebasestorage.googleapis.com/v0/b/javafest-87433.appspot.com/o/profileImages%2FMon%20Sep%2009%202024%2002%3A57%3A40%20GMT%2B0600%20(Bangladesh%20Standard%20Time)%2Fadil_profile%20(2).jpg?alt=media&token=204207a4-213e-4ef7-85cc-69dfc00ecd6a")

    useEffect(() => {
        if (!sessionContext?.sessionData) {
            // axiosInstance.get(userInfoRegUrlReq(sessionContext?.sessionData.userId, sessionContext?.sessionData.role)).then((res) => {
            //     setUserData(res.data)
            // }).catch((err) => {
            //     console.log(err)
            // })
            // const profilepic = sessionStorage.getItem(profilePicLink)
            // if (!profilePicLink) {
            //     axiosInstance.get(getProfilePicUrl).then((res) => {
            //         setProfilePicLink(res.data?.profilePicture)
            //         sessionStorage.setItem(profilePicLink, res.data?.profilePicture)
            //     }).catch((err) => {
            //         console.log(err)
            //     })
            // }
        }

    }, [sessionContext?.sessionData])

    return (
        <div className="w-full h-full flex flex-col gap-4 p-5 pl-20 break-normal">
            <div className="flex flex-row items-center mt-5 w-full justify-between">
                <div className="flex flex-row items-center gap-4">
                    <Avatar avatarImgSrc={profilePicLink} size={75} />
                    <div className="flex flex-col gap-2">
                        <div className="text-3xl font-semibold">{userData.fullName}</div>
                        <div className="text-sm text-gray-800">{sessionContext?.sessionData?.role === roles.basicUser ? "Basic User" : userData?.cancerStage}</div>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-3">
                    <Link href={pagePaths.dashboardPages.userdetailsUpdatePage} className="mr-10 rounded-xl py-1 px-3 w-fit border border-gray-300 hover:scale-95 transition-all ease-linear text-sm" >
                        Edit Profile...
                    </Link>
                </div>
            </div>
            <Separator />
            <div className="flex flex-row w-full justify-between pl-10">
                <div className="flex flex-col gap-3 w-1/3">
                    <div className="flex flex-row w-full gap-5 items-end">
                        <div className="flex flex-row gap-3 w-44 items-end">
                            <Weight size={20} className=" -translate-y-[2px]" />
                            <span className="text-base text-gray-950">Weight</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.weight} kg</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 items-end">
                        <div className="flex flex-row gap-3 w-44 items-end">
                            <RulerIcon size={20} className=" -translate-y-[2px]" />
                            <span className="text-base text-gray-950">Height</span>
                        </div>
                        <div className="text-base text-gray-700">{convertCmtoFeetInch(userData?.height)}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 items-end">
                        <div className="flex flex-row gap-3 w-44 items-end">
                            <RefreshCwIcon size={20} className=" -translate-y-[2px]" />
                            <span className="text-base text-gray-950">Menstrual Cycle</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.avgCycleLength} days</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 items-end">
                        <div className="flex flex-row gap-3 w-44 items-end">
                            <CalendarDays size={20} className=" -translate-y-[2px]" />
                            <span className="text-base text-gray-950">Date of Birth</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.dob}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 items-end">
                        <div className="flex flex-row gap-3 w-44 items-end">
                            <CalendarCheck size={20} className=" -translate-y-[2px]" />
                            <span className="text-base text-gray-950">Last Period Date</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.diagnosisDate}</div>
                    </div>
                </div>
                <Separator orientation="vertical" />
                <div className="flex flex-col gap-3 flex-1 ml-16">
                    <div className="flex flex-row w-full gap-5 items-end">
                        <div className="flex flex-row gap-3 w-52 items-end">
                            <CalendarX size={20} className=" -translate-y-[2px]" />
                            <span className="text-base text-gray-950">Diagnose Date</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.diagnosisDate}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 items-end">
                        <div className="flex flex-row gap-3 w-52 items-end">
                            <UserRoundX size={20} className=" -translate-y-[2px]" />
                            <span className="text-base text-gray-950">Cancer Relatives</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.cancerRelatives.length > 0 ? userData?.cancerRelatives.map(i => i.trim()).join(", ") : "None"}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 items-end">
                        <div className="flex flex-row gap-3 w-52 items-end">
                            <BeanOff size={20} className=" -translate-y-[2px]" />
                            <span className="text-base text-gray-950">Allergies</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.allergies.length > 0 ? userData?.allergies.map(i => i.trim()).join(", ") : "None"}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 items-end">
                        <div className="flex flex-row gap-3 w-52 items-end">
                            <HeartCrack size={20} className=" -translate-y-[2px]" />
                            <span className="text-base text-gray-950">Chronic Organs</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.organsWithChronicConditions.length > 0 ? userData?.organsWithChronicConditions.map(i => i.trim()).join(", ") : "None"}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 items-end">
                        <div className="flex flex-row gap-3 w-52 items-end">
                            <BadgeAlert size={20} className=" -translate-y-[2px]" />
                            <span className="text-base text-gray-950">Period Irregularitied</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.periodIrregularities.length > 0 ? userData?.periodIrregularities.map(i => i.trim()).join(", ") : "None"}</div>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-3 w-full pl-8 pb-5 flex-1">
                <TabsComponent userData={userData} />
            </div>
        </div >
    )
}

function TabsComponent({ userData }) {
    const sessionContext = useSessionContext()
    const [forumQuestions, setForumQuestions] = useState([])
    const [questionLoading, setQuestionLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [allowLocationShare, setAllowLocationShare] = useState(userData?.locationShare)
    const tabs = {
        location: 0,
        forumQuestions: 1,
    }
    const latlng = cellToLatLng(userData?.location)
    const [currentPosition, setCurrentPosition] = useState({
        lat: latlng[0],
        lng: latlng[1]
    })
    const [forumQuestionsPageNumber, setForumQuestionsPageNumber] = useState(1)
    useEffect(() => {
        if (sessionContext?.sessionData?.userId) {
            setQuestionLoading(true)
            axiosInstance.get(forumQuestionsUrl, {
                params: {
                    userId: sessionContext?.sessionData?.userId,
                    pageNo: forumQuestionsPageNumber - 1
                }
            }).then((response) => {
                setForumQuestions(response?.data?.content?.map(question => {
                    return {
                        id: question?.id,
                        title: question?.title,
                        voteCount: question?.voteCount,
                        createdAt: question?.createdAt,
                        answerCount: null,
                    }
                }))
                setTotalPages(response?.data?.page?.totalPages)
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setQuestionLoading(false)
            })
        }
    }, [sessionContext?.sessionData, forumQuestionsPageNumber])

    return (
        <Tabs defaultValue={tabs.forumQuestions} className="w-full flex-1">
            <TabsList className="grid w-8/12 grid-cols-2">
                <TabsTrigger value={tabs.forumQuestions}>Questions Asked</TabsTrigger>
                <TabsTrigger value={tabs.location}>Location</TabsTrigger>
            </TabsList>
            <TabsContent value={tabs.forumQuestions}>
                <div className="flex flex-col gap-3 justify-between flex-1">
                    <ScrollableContainer className="w-full h-96 flex flex-row items-start flex-wrap gap-5 ">
                        {questionLoading ?
                            <Loader2 size={52} className="animate-spin" />
                            :
                            forumQuestions.length > 0 ?
                                forumQuestions.map((question, index) => {
                                    return (
                                        <div key={index} className="flex flex-col gap-2 border rounded-xl p-3 h-fit shadow-xl line-clamp-2 w-96 relative">
                                            <span className="text-xs translate-y-[1.5px] text-gray-800 absolute top-3 right-3">{displayDate(question?.createdAt, "dd MMM, yy")}</span>
                                            <div className="flex flex-row items-center gap-2 mt-3">
                                                <span className="text-lg font-[500]">{question.title}</span>
                                            </div>
                                            <Link href={pagePaths.questionPageById(question.id)} className="text-sm text-blue-500 hover:underline flex items-center">
                                                View Question and Answers
                                                <ExternalLink size={14} className="ml-1" />
                                            </Link>
                                            <div className="flex flex-row items-center gap-2">
                                                <ThumbsUp size={20} />
                                                <span className="text-sm text-gray-800">{question.voteCount}</span>
                                            </div>
                                        </div>
                                    )
                                })
                                :
                                <div className="flex flex-col items-center justify-center w-full border border-gray-500 bg-gray-100 relative rounded-md p-3 gap-5">
                                    <span className="text-lg font-semibold">No questions asked yet!</span>
                                </div>
                        }
                        {totalPages > 1 &&
                            <div className={cn("flex flex-row items-center justify-center gap-3 w-full")}>
                                <Pagination count={totalPages} page={forumQuestionsPageNumber} onChange={(event, value) => {
                                    setForumQuestionsPageNumber(value)
                                }}
                                    showFirstButton
                                    showLastButton
                                    color="primary"
                                    variant="outlined"
                                />
                            </div>
                        }
                    </ScrollableContainer>

                </div>
            </TabsContent>
            <TabsContent value={tabs.location}>
                <div className="flex flex-col items-center justify-center w-full border border-gray-500 bg-gray-100 relative rounded-md p-3 gap-5">
                    <div className="flex flex-row justify-between w-full items-center">
                        <div className="flex flex-row items-center gap-2 justify-end w-full">
                            <Switch checked={allowLocationShare} onCheckedChange={(checked) => {
                                axiosInstance.put(toggleLocationShare).then((response) => {
                                    setAllowLocationShare(response?.data?.locationShare)
                                    toast.message("Location share " + (response?.data?.locationShare ? "enabled" : "disabled"))
                                }).catch((error) => {
                                    console.log(error)
                                })
                            }} />
                            <span>Share Location</span>
                        </div>
                    </div>
                    {currentPosition ?
                        <>
                            <span className='absolute top-[78px] right-24 bg-white px-2 py-1 text-lg z-10 rounded-md shadow-md border border-gray-300'>{"Lat: " + (Math.round((currentPosition?.lat + Number.EPSILON) * 10000) / 10000) + " Lng: " + (Math.round((currentPosition?.lng + Number.EPSILON) * 10000) / 10000)}</span>
                            <EditUserMapView currentPosition={currentPosition} setCurrentPosition={setCurrentPosition} editable={false} />
                        </>
                        :
                        <Loader2 size={52} className="animate-spin" />
                    }
                </div>
            </TabsContent>
        </Tabs>
    )
}