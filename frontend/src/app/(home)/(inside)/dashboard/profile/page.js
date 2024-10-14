'use client'

import Avatar from "@/app/components/avatar"
import EditUserMapView from "@/app/components/editUserdetailsmapComponent"
import Loading from "@/app/components/loading"
import ScrollableContainer from "@/app/components/StyledScrollbar"
import { useSessionContext } from "@/app/context/sessionContext"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { convertCmtoFeetInch, displayDate, forumQuestionsUrl, generateFormattedDate, getConsultationLocations, getProfilePicUrl, pagePaths, roles, testingAvatar, toggleLocationShare, userInfoRegUrlReq } from "@/utils/constants"
import { Pagination } from "@mui/material"
import { profile } from "@tensorflow/tfjs"
import { format, parse } from "date-fns"
import { cellToLatLng } from "h3-js"
import { BadgeAlert, BeanOff, CalendarCheck, CalendarDays, CalendarX, CopyIcon, ExternalLink, HeartCrack, Loader2, Pill, RefreshCwIcon, RulerIcon, ThumbsUp, UserRoundX, Weight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FaUserDoctor } from "react-icons/fa6";
import { FcDepartment } from "react-icons/fc";
import { SiWorkplace } from "react-icons/si";
import { MdAppRegistration } from "react-icons/md";
import { FcPhone } from "react-icons/fc";
import { RiMedal2Line } from "react-icons/ri";

export default function DashboardProfilePage() {
    const sessionContext = useSessionContext()
    const [profilePicLink, setProfilePicLink] = useState(null)
    const [userData, setUserData] = useState(null)

    useEffect(() => {
        if (sessionContext?.sessionData) {
            axiosInstance.get(userInfoRegUrlReq(sessionContext?.sessionData.userId, sessionContext?.sessionData.role)).then((res) => {
                setUserData(res.data)
                console.log(res.data)
            }).catch((err) => {
                console.log(err)
            })
            axiosInstance.get(getProfilePicUrl).then((res) => {
                setProfilePicLink(res.data?.profilePicture || testingAvatar)
            }).catch((err) => {
                console.log(err)
            })
        }

    }, [sessionContext?.sessionData])

    if (!sessionContext?.sessionData?.role) return <Loading />
    else if (sessionContext?.sessionData?.role === roles.doctor) return <DoctorDashboardProfilePage userData={userData} setUserData={setUserData} profilePicLink={profilePicLink} setProfilePicLink={setProfilePicLink} />
    else return <UserDashboardProfilePage userData={userData} setUserData={setUserData} profilePicLink={profilePicLink} setProfilePicLink={setProfilePicLink} />
}

function DoctorDashboardProfilePage({ profilePicLink, setProfilePicLink }) {
    const [userData, setUserData] = useState(
        {
            "qualifications": ["MBBS", "FCPS"],
            "isVerified": "N",
            "registrationNumber": "dfasdfsadfsdfsdfsdfsdf",
            "contactNumber": "01730445524",
            "fullName": "Dr. QQW Ahmed",
            "designation": "Head",
            "department": "Cancer",
            "workplace": "Dhaka Medical College"
        }
    )
    const sessionContext = useSessionContext()
    const [consulations, setConsulations] = useState([
        {
            "workdays": "1110110",
            "fees": 700,
            "start": "07:43:23",
            "location": "Rule 2nd phase, Khulna",
            "end": "17:43:23",
            "id": 1
        },
        {
            "workdays": "1111110",
            "fees": 500,
            "start": "07:43:23",
            "location": "sonadanga 2nd phase, Khulna",
            "end": "12:43:23",
            "id": 2
        }
    ])

    useEffect(() => {
        if (sessionContext?.sessionData) {
            axiosInstance.get(getConsultationLocations(sessionContext?.sessionData.userId)).then((res) => {
                console.log(res)
                // setConsulations(res.data)
            }).catch((error) => {
                toast.error("Error occured fetching locations. Try again. Check internet")
            }).finally(() => {
            })
        }

    }, [sessionContext?.sessionData])

    const parseWorkdays = (workdays) => {
        // return the list of days in a week that the doctor works starting from saturaday
        // 0 means off day
        // 1 means working day
        
        const days = ["Sat", "Sun", "Mon", "Tues", "Wed", "Thur", "Fri"]
        const workdaysList = []
        for (let i = 0; i < workdays.length; i++) {
            if (workdays[i] === "1") {
                workdaysList.push(days[i])
            }
        }
        return workdaysList
    }

    return (
        <div className="w-full h-full flex flex-col gap-8 p-5 pl-20 break-normal drop-shadow">
            <div className="flex flex-row items-center mt-5 w-full justify-between">
                <div className="flex flex-row items-center gap-4">
                    <Avatar avatarImgSrc={profilePicLink} size={75} />
                    <div className="flex flex-col gap-2">
                        <div className="text-3xl font-semibold">{userData?.fullName}</div>
                        <Badge className={cn(userData?.isVerified === "N" ? "bg-red-500" : "bg-green-500", "text-xs font-light w-fit")} >
                            {userData?.isVerified === "Y" ? "Verified" : "Not Verified"}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-3">
                    <Link href={pagePaths.dashboardPages.userdetailsUpdatePage} className="mr-10 rounded-xl py-1 px-3 w-fit border border-gray-300 hover:scale-95 transition-all ease-linear text-sm" >
                        Edit Profile...
                    </Link>
                </div>
            </div>
            <Separator />
            <div className="flex flex-row w-full justify-between pl-10 py-2">
                <div className="flex flex-col gap-1 w-1/2">
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 items-center ">
                            <FaUserDoctor size={20} />
                            <span className="text-base text-gray-950">Designation</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.designation}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 items-center">
                            <FcDepartment size={20} className=" " />
                            <span className="text-base text-gray-950">Department</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.department}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 items-center ">
                            <SiWorkplace size={20} className=" " />
                            <span className="text-base text-gray-950">Workplace</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.workplace}</div>
                    </div>
                </div>
                {/* <Separator orientation="vertical" /> */}
                <div className="flex flex-col gap-1 w-1/2">
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 items-center ">
                            <MdAppRegistration size={20} className=" " />
                            <span className="text-base text-gray-950">Reg. Number</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.registrationNumber}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 items-center ">
                            <FcPhone size={20} className=" " />
                            <span className="text-base text-gray-950">Contact Number</span>
                        </div>
                        <div className="text-base text-gray-700 flex items-center gap-3">
                            <span>
                                {userData?.contactNumber}
                            </span>
                            <button className=" active:scale-75 transition-all ease-linear size-fit" onClick={() => {
                                navigator.clipboard.writeText(userData?.contactNumber)
                                toast.message("Contact Number copied to clipboard", {
                                    position: 'bottom-center',
                                    duration: 500,
                                })
                            }} >
                                <CopyIcon size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 items-center ">
                            <RiMedal2Line size={20} className=" " />
                            <span className="text-base text-gray-950">Qualifications</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.qualifications?.join(", ")}</div>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-3 w-full pl-8 pb-5 flex-1 drop-shadow-none">
                <div className="flex flex-col gap-1 w-full">
                    <span className="text-lg">Consultation Locations</span>
                    <Separator className="w-full h-[1.5px] bg-gray-400" />
                </div>
                <div className="flex flex-col gap-1 w-full p-3">
                    {consulations?.length === 0 &&
                        <div className="flex flex-col items-center justify-center w-full border border-gray-500 bg-gray-100 relative rounded-md p-3 gap-5">
                            <div className=" font-semibold flex flex-row items-center gap-3 text-base">
                                <span>No locations added yet! </span>
                                <Link href={pagePaths.addConsultation} className="text-blue-500 hover:underline flex items-center">
                                    Add Location
                                    <ExternalLink size={20} className="ml-1" />
                                </Link>
                            </div>
                        </div>
                    }
                    {consulations?.length > 0 &&
                        <table className="w-full border-0 p-3 font-light">
                        <tbody>
                            {consulations.map((location, index) => {
                                return (
                                    <tr key={index} className="border-b border-gray-500">
                                        <td className="text-left mb-3">{location.location}</td> {/* Add padding */}
                                        <td className="text-left mb-3">{parseWorkdays(location.workdays).join(", ")}</td>
                                        <td className="text-left mb-3">{format(parse(location.start, "HH:mm:ss", new Date()), "hh:mm a")}</td>
                                        <td className="text-left mb-3">{format(parse(location.end, "HH:mm:ss", new Date()), "hh:mm a")}</td>
                                        <td className="text-left mb-3">{location.fees}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    }
                </div>
            </div>
        </div >
    )
}


function UserDashboardProfilePage({ userData, setUserData, profilePicLink, setProfilePicLink }) {
    const sessionContext = useSessionContext()
    // const [userData, setUserData] = useState({
    //     "allergies": ["Peanut"],
    //     "organsWithChronicConditions": ["Heart", "Throat"],
    //     "cancerRelatives": ["Aunt", "Samiha"],
    //     "fullName": "Sadatul",
    //     "weight": 58.0,
    //     "avgCycleLength": 5,
    //     "cancerHistory": "Y",
    //     "lastPeriodDate": "2000-08-08",
    //     "dob": "2000-08-08",
    //     "medications": [
    //         {
    //             "name": "Napa Extra",
    //             "doseDescription": "3 times a day"
    //         },
    //         {
    //             "name": "Napa Extra",
    //             "doseDescription": "3 times a day"
    //         }
    //     ],
    //     "periodIrregularities": ["Higher pain", "Longer than average cycles"],
    //     "height": 175.0,
    //     "cancerStage": "SURVIVOR",
    //     "diagnosisDate": "2020-08-03",
    //     "location": "sdfasdfdsfsdfjsdfjfds",
    //     "locationShare": true
    // })



    return (
        <div className="w-full h-full flex flex-col gap-4 p-5 pl-20 break-normal drop-shadow">
            <div className="flex flex-row items-center mt-5 w-full justify-between">
                <div className="flex flex-row items-center gap-4">
                    <Avatar avatarImgSrc={profilePicLink} size={75} />
                    <div className="flex flex-col gap-2">
                        <div className="text-3xl font-semibold">{userData?.fullName}</div>
                        <div className="text-xs text-gray-100 py-1 px-3 rounded-2xl bg-gray-700 w-fit font-[500]">{sessionContext?.sessionData?.role === roles.basicUser ? "Basic User" : userData?.cancerStage}</div>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-3">
                    <Link href={pagePaths.dashboardPages.userdetailsUpdatePage} className="mr-10 rounded-xl py-1 px-3 w-fit border border-gray-300 hover:scale-95 transition-all ease-linear text-sm" >
                        Edit Profile...
                    </Link>
                </div>
            </div>
            <Separator />
            <div className="flex flex-row w-full justify-between pl-10 py-2">
                <div className="flex flex-col gap-1 w-1/2">
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 ">
                            <Weight size={20} className=" " />
                            <span className="text-base text-gray-950">Weight</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.weight} kg</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 ">
                            <RulerIcon size={20} className=" " />
                            <span className="text-base text-gray-950">Height</span>
                        </div>
                        <div className="text-base text-gray-700">{convertCmtoFeetInch(userData?.height)}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 ">
                            <RefreshCwIcon size={20} className=" " />
                            <span className="text-base text-gray-950">Menstrual Cycle</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.avgCycleLength} days</div>
                    </div>
                </div>
                {/* <Separator orientation="vertical" /> */}
                <div className="flex flex-col gap-1 w-1/2">
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 ">
                            <CalendarDays size={20} className=" " />
                            <span className="text-base text-gray-950">Date of Birth</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.dob}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 ">
                            <CalendarCheck size={20} className=" " />
                            <span className="text-base text-gray-950">Last Period Date</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.diagnosisDate}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-44 ">
                            <CalendarX size={20} className=" " />
                            <span className="text-base text-gray-950">Diagnose Date</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.diagnosisDate}</div>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="flex flex-row w-full justify-between pl-10 py-2">
                <div className="flex flex-col gap-1 flex-1">
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-52 ">
                            <UserRoundX size={20} className=" " />
                            <span className="text-base text-gray-950">Cancer Relatives</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.cancerRelatives?.length > 0 ? userData?.cancerRelatives.map(i => i.trim()).join(", ") : "None"}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-52 ">
                            <BeanOff size={20} className=" " />
                            <span className="text-base text-gray-950">Allergies</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.allergies?.length > 0 ? userData?.allergies.map(i => i.trim()).join(", ") : "None"}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-52 ">
                            <HeartCrack size={20} className=" " />
                            <span className="text-base text-gray-950">Chronic Organs</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.organsWithChronicConditions?.length > 0 ? userData?.organsWithChronicConditions.map(i => i.trim()).join(", ") : "None"}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-52 ">
                            <BadgeAlert size={20} className=" " />
                            <span className="text-base text-gray-950">Period Irregularitied</span>
                        </div>
                        <div className="text-base text-gray-700">{userData?.periodIrregularities?.length > 0 ? userData?.periodIrregularities.map(i => i.trim()).join(", ") : "None"}</div>
                    </div>
                    <div className="flex flex-row w-full gap-5 ">
                        <div className="flex flex-row gap-3 w-52 ">
                            <Pill size={20} className=" " />
                            <span className="text-base text-gray-950">Medications</span>
                        </div>
                        <div className="text-base text-gray-700">
                            {userData?.medications?.length > 0 ?
                                userData?.medications.map((medication, index) => `${medication.name} - ${medication.doseDescription}`).join(", ")
                                :
                                "None"
                            }
                        </div>
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
            <TabsList className="grid w-8/12 grid-cols-2 m-auto">
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