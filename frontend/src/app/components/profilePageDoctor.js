'use client'
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner";
import { useStompContext } from "@/app/context/stompContext";
import { addAppointment, addReview, avatarAang, deleteDoctorReview, dummyAvatar, emptyAvatar, getDoctorProfileDetailsUrl, getDoctorProfileDetailsUrlLocations, getDoctorProfileDetailsUrlReviews, locationOnline, messageSendUrl, pagePaths, roles, testingAvatar, updateDoctorReview } from "@/utils/constants";
import Image from "next/image";
import { Banknote, BriefcaseBusiness, CalendarSearch, Check, Clock, Cross, Hospital, MapPinIcon, MessageCirclePlus, MessageCircleReply, Pencil, Phone, Send, Star, StarHalf, ThumbsUp, Trash2, X } from "lucide-react";
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
import AddAppointAnimation from "../../../public/profile/AddAppointment.json"
import EmptyAppointment from "../../../public/profile/emptyAppointment.json"
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
import { format, formatDistanceToNow } from "date-fns";
import Loading from "./loading";
import Link from "next/link";


function round(number) {
    return (Math.round((number + Number.EPSILON) * 100) / 100)
}

export default function DoctorProfile({ profileId, section }) {
    const profilePic = "https://sm.ign.com/t/ign_nordic/cover/a/avatar-gen/avatar-generations_prsz.300.jpg"
    const stompContext = useStompContext();
    const sectionEnum = {
        reviews: 0,
        about: 1,
        posts: 2,
        appointments: 3,
        consultations: 4
    }

    const [userData, setUserData] = useState(null)
    const [doctorReviews, setDoctorReviews] = useState([])
    const sessionContext = useSessionContext()
    const [reviewInfo, setReviewInfo] = useState({
        count: 0,
        averageRating: 0,
        ratingCount: [0, 0, 0, 0, 0]
    })
    const [ratingIcon, setRatingIcon] = useState(null)
    const containerRef = useRef(null)
    const [selectedTab, setSelectedTab] = useState(sectionEnum[section] || 0)
    const [showProfileNavbar, setShowProfileNavbar] = useState(false)
    const [openMessageBox, setOpenMessageBox] = useState(false)

    const tabs = [
        {
            title: "Reviews",
            textColor: "text-amber-500",
            bgColor: "bg-amber-500",
            section: <ReviewSection profileId={profileId} reviewInfo={reviewInfo} setReviewInfo={setReviewInfo} className={"bg-gradient-to-b from-amber-50 to-white"} />
        },
        {
            title: "About",
            textColor: "text-green-500",
            bgColor: "bg-green-500",
            section: <AboutSection workPlace={"Dhaka Medical Collage"} designation={"Head"} qualifications={["MBBS", "FCPS", "Degree"]} department={"Cancer"} contactNumber={"01792421372"} className={"bg-gradient-to-b from-green-50 to-white"} />
        },
        {
            title: "Posts",
            textColor: "text-indigo-500",
            bgColor: "bg-indigo-500",
            section: <PostSection userId={profileId} className={"bg-gradient-to-b from-indigo-50 to-white"} />
        },
        {
            title: "Appointments",
            textColor: "text-purple-500",
            bgColor: "bg-purple-500",
            section: <AppointmentsSection userId={profileId} className={"bg-gradient-to-b from-purple-50 to-white"} />
        },
        {
            title: "Consultations",
            textColor: "text-pink-500",
            bgColor: "bg-pink-500",
            section: <ConsultationSection profileId={profileId} className={"bg-gradient-to-b from-pink-50 to-white"} />
        }
    ]


    useEffect(() => {
        setRatingIcon(reviewInfo.averageRating <= 2.5 ? <Star strokeWidth={1.5} size={24} className={cn(" text-transparent text-[#FFD700]")} /> : reviewInfo.averageRating < 4 ? <StarHalf size={24} fill="#FFD700" className={cn("text-transparent")} /> : <Star size={24} fill="#FFD700" className={cn("text-transparent")} />)
    }, [reviewInfo])

    useEffect(() => {
        if (sessionContext.sessionData) {
            axiosInstance.get(getDoctorProfileDetailsUrl(profileId)).then((res) => {
                console.log("doctor data", res.data)
                setUserData(res.data)
                setReviewInfo({
                    ...res.data?.reviewSummary,
                    ratingCount: res.data?.reviewSummary?.ratingCount?.reverse()
                })
            }).catch((error) => {
                console.log(error)
                if (error.response?.status === 404) {
                    toast.error("Doctor not found")
                    setUserData("EMPTY")
                }
            })
        }
    }, [sessionContext.sessionData, profileId])

    const sendMessage = () => {
        const messageInput = document.getElementById('message')?.value
        if (messageInput !== '' && profileId) {
            const messageObject = {
                receiverId: profileId,
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
            setOpenMessageBox(false)
        }
    }

    if (!userData) return <Loading />
    else if (userData === "EMPTY") return <h1 className="text-3xl font-semibold text-center m-4">Doctor not found</h1>

    return (
        <ScrollableContainer ref={containerRef} className="flex w-screen overflow-x-hidden flex-col flex-grow p-4 items-center bg-gradient-to-r from-gray-100 via-zinc-100 to-slate-100" tabIndex={0} style={{ outline: 'none' }}
            onScroll={(e) => {
                if (containerRef.current?.scrollTop > 350 && !showProfileNavbar) {
                    setShowProfileNavbar(true)
                }
                else if (containerRef.current?.scrollTop <= 350 && showProfileNavbar) {
                    setShowProfileNavbar(false)
                }
            }}>

            <div id="profile-navbar" hidden={true} className={cn(showProfileNavbar ? "bg-gray-50  h-16 p-3 w-full flex sticky -top-6 z-50 flex-row gap-5 justify-between items-center flex-wrap flex-shrink rounded-b-lg shadow" : "hidden")}>
                {userData?.profilePicture && <Image src={userData?.profilePicture} width={48} height={52} className="rounded-full ml-16" alt="profile-picture" />}
                <div className="flex flex-row gap-3">
                    {tabs.map((tab, index) => (
                        <button key={index} onClick={() => setSelectedTab(index)} className={cn("text-base flex flex-col font-semibold px-2 mx-5", selectedTab === index ? tab.textColor : "text-gray-800")}>
                            {tab.title}
                            <hr hidden={selectedTab !== index} className={cn("w-full mt-1 h-[3px] ", tab.bgColor)} />
                        </button>
                    ))}
                </div>
            </div>
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
                        <Image src={userData?.profilePicture || emptyAvatar} width={200} height={200} className="rounded  shadow-md" alt="profile-picture" />
                        <Badge className={"mt-2 text-sm"}>Doctor</Badge>
                    </div>
                    <div className="flex flex-col ml-56 gap-2">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {userData?.fullName}
                            <Badge className={cn(userData?.isVerified === "Y" ? "bg-blue-800" : "bg-red-800", "text-white font-thin py-1 h-6")}>{userData?.isVerified === "Y" ? "Verified" : "Unverified"}</Badge>
                        </h1>
                        <h1 className="text-base ">{userData?.designation}{", "}{userData?.department}{" Department, "}{userData?.workplace}</h1>
                        <h1 className="text-sm flex gap-2"><Phone size={20} />{userData?.contactNumber}</h1>
                        <Popover>
                            <PopoverTrigger className="w-12">
                                <div className="flex flex-row items-center mt-3">
                                    {ratingIcon}
                                    <span className="text-base font-semibold ml-2">{round(reviewInfo.averageRating)}</span>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto ">
                                {reviewInfo.ratingCount.map((rating, index) => (
                                    <div key={index} className="flex flex-row items-center p-2">
                                        <div className="flex flex-row flex-1">
                                            {reviewInfo.ratingCount.slice(index).map((rating2, index2) => (
                                                <Star key={index + "" + index2} fill="#FFD700" className={cn("w-4 h-4 text-transparent")} />
                                            ))}
                                        </div>
                                        <span className="text-sm ml-2 text-right">{rating}</span>
                                    </div>
                                ))}
                            </PopoverContent>

                        </Popover>
                    </div>
                    <div className="flex flex-row items-center mr-3 mt-12">
                        <Popover open={openMessageBox} onOpenChange={(e) => { setOpenMessageBox(e) }} >
                            <PopoverTrigger asChild>
                                <button disabled={!sessionContext.sessionData} className="bg-blue-700 text-white px-2 py-2 rounded-md text-base flex flex-row items-center">
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
                        <button onClick={() => { setSelectedTab(sectionEnum.consultations) }} className="bg-purple-600 text-white px-2 py-2 text-base rounded-md ml-2 font-semibold">Request Appointment</button>
                    </div>
                </div>
                <Separator className="w-11/12 mt-10 h-[2px]" />
                <div className="flex flex-row w-11/12 mt-4 py-3">
                    {tabs.map((tab, index) => (
                        <button key={index} onClick={() => setSelectedTab(index)} className={cn("text-base flex flex-col font-semibold px-2 mx-5 p-ripple rounded-t-md", selectedTab === index ? tab.textColor : "text-gray-800")}>
                            {tab.title}
                            <Ripple
                                pt={{
                                    root: { style: { background: 'rgba(156, 39, 176, 0.3)' } }
                                }} />
                            <hr hidden={selectedTab !== index} className={cn("w-full mt-1 h-[3px]", tab.bgColor)} />
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col w-11/12 items-center mt-4">
                {tabs[selectedTab].section}
                <div
                    onKeyDown={(e) => {
                        console.log(e.key)
                        if (e.key === "ArrowRight") {
                            setSelectedTab((value) => (value + 1) % tabs.length)
                        }
                        else if (e.key === "ArrowLeft") {
                            if (selectedTab > 0) {
                                setSelectedTab((value) => (value - 1) % tabs.length)
                            }
                            else if (selectedTab === 0) {
                                setSelectedTab((value) => tabs.length - 1)
                            }
                        }
                        else if (e.key === "ArrowUp") {
                            if (containerRef.current?.scrollTop > 100)
                                containerRef.current?.scrollTo({ top: containerRef.current?.scrollTop - 100, behavior: 'smooth' })
                        }
                        else if (e.key === "ArrowDown") {
                            if (containerRef.current?.scrollTop < (containerRef.current?.scrollHeight - 100))
                                containerRef.current?.scrollTo({ top: containerRef.current?.scrollTop + 100, behavior: 'smooth' })
                        }
                    }}>
                </div>
            </div>
        </ScrollableContainer>
    )
}

function PostSection({ userId, className }) {
    const [selectedTab, setSelectedTab] = useState("blogPosts")
    const [currentBlogPostPage, setCurrentBlogPostPage] = useState(1)
    const [currentForumQuestionPage, setCurrentForumQuestionPage] = useState(1)
    const [totalBlogPostPages, setTotalBlogPostPages] = useState(15)
    const [totalForumQuestionPages, setTotalForumQuestionPages] = useState(12)
    const [posts, setPosts] = useState([
        {
            title: "Does hormone replacement therapy increase cancer risk?",
            content: "Hormone replacement therapies (HRT) are hormonal medications that can help reduce menopause symptoms. While these therapies offer welcome symptom relief for many people, they have also been associated with side effects, including increased breast cancer risk.",
            date: "2021-09-01",
            imageSrc: "https://www.mdanderson.org/cancerwise/2024/07/medullary-thyroid-cancer-survivor-trusts-md-anderson-for-long-term-care/jcr:content/blog/adaptiveimage.resize.648.0.medium.dir.jpg/1720705182439.jpg"
        },
        {
            title: "Does hormone replacement therapy increase cancer risk?",
            content: "Hormone replacement therapies (HRT) are hormonal medications that can help reduce menopause symptoms. While these therapies offer welcome symptom relief for many people, they have also been associated with side effects, including increased breast cancer risk.",
            date: "2021-09-01",
            imageSrc: "https://www.mdanderson.org/cancerwise/2024/07/does-hormone-replacement-therapy-increase-cancer-risk/jcr:content/blog/adaptiveimage.resize.648.0.medium.dir.jpg/1719869273826.jpg"
        },
        {
            title: "Does hormone replacement therapy increase cancer risk?",
            content: "Hormone replacement therapies (HRT) are hormonal medications that can help reduce menopause symptoms. While these therapies offer welcome symptom relief for many people, they have also been associated with side effects, including increased breast cancer risk.",
            date: "2021-09-01",
            imageSrc: "https://www.mdanderson.org/cancerwise/2024/07/does-hormone-replacement-therapy-increase-cancer-risk/jcr:content/blog/adaptiveimage.resize.648.0.medium.dir.jpg/1719869273826.jpg"
        },
        {
            title: "Does hormone replacement therapy increase cancer risk?",
            content: "Hormone replacement therapies (HRT) are hormonal medications that can help reduce menopause symptoms. While these therapies offer welcome symptom relief for many people, they have also been associated with side effects, including increased breast cancer risk.",
            date: "2021-09-01",
            imageSrc: "https://www.mdanderson.org/cancerwise/2024/07/does-hormone-replacement-therapy-increase-cancer-risk/jcr:content/blog/adaptiveimage.resize.648.0.medium.dir.jpg/1719869273826.jpg"
        },
    ])
    const [similarPersons, setSimilarPersons] = useState([
        { name: "Robin", profilePic: testingAvatar, workPlace: "Dhaka Medical College" },
        { name: "Robin", profilePic: testingAvatar, workPlace: "Dhaka Medical College" },
        { name: "Robin", profilePic: testingAvatar, workPlace: "Dhaka Medical College" },
    ])

    return (
        <div className={cn("flex flex-row w-full mt-4 p-4 rounded", className)}>
            <div className="flex flex-col rounded w-9/12">
                <Tabs defaultValue={"blogPosts"} onValueChange={(value) => {
                    console.log(value)
                    setSelectedTab(value)
                }}>
                    <TabsList className="p-2 h-12">
                        <TabsTrigger value={"blogPosts"} onClick={() => { setSelectedTab("blogPosts") }}>
                            <div type="button" className={cn("text-xl font-bold", selectedTab === "blogPosts" ? "text-indigo-500" : "")}>Blog Posts</div>
                        </TabsTrigger>
                        <TabsTrigger value={"forumQuestions"} onClick={() => { setSelectedTab("forumQuestions") }} >
                            <div type="button" className={cn("text-xl font-bold", selectedTab === "forumQuestions" ? "text-indigo-500" : "")}>Forum Questions</div>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value={"blogPosts"}>
                        <div className="flex flex-col">
                            {posts.map((post, index) => (
                                <BlogCard key={index} title={post.title} content={post.content} date={post.date} imageSrc={post.imageSrc} />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value={"forumQuestions"}>
                        <div className="flex flex-col">
                            <ForumCard title="How to deal with anxiety?" content="I have been feeling anxious lately. How do I deal with it?" date="2021-09-01" likesCount={10} commentsCount={15} />
                            <ForumCard title="How to deal with anxiety?" content="I have been feeling anxious lately. How do I deal with it?" date="2021-09-01" likesCount={14} commentsCount={9} />
                        </div>
                    </TabsContent>
                </Tabs>
                <div className="w-full flex justify-center mt-4">
                    <Pagination count={selectedTab === "blogPosts" ? totalBlogPostPages : totalForumQuestionPages}
                        page={selectedTab === "blogPosts" ? currentBlogPostPage : currentForumQuestionPage}
                        boundaryCount={3}
                        size="large"
                        variant="outlined"
                        onChange={(event, value) => {
                            if (selectedTab === "blogPosts") {
                                setCurrentBlogPostPage(value)
                            }
                            else if (selectedTab === "forumQuestions") {
                                setCurrentForumQuestionPage(value)
                            }
                        }}
                        color={selectedTab === "blogPosts" ? "primary" : "secondary"}
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

function BlogCard({ title, content, date, imageSrc }) {
    return (
        <div className="flex flex-row w-full mx-2 my-3 bg-white rounded-md shadow">
            <div className="relative w-full h-40 rounded-l-md overflow-hidden">
                <Image
                    src={imageSrc}
                    fill={true}
                    className="absolute inset-0 w-full h-full object-left object-contain rounded-l-md"
                    alt="Blog Image"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-white from-75%  to-transparent to-90% rounded-t-md flex flex-col items-end">
                    <div className="relative w-9/12 z-10 px-4 py-2 text-black flex flex-col items-end text-end">
                        <h1 className="text-2xl font-bold line-clamp-1">{title}</h1>
                        <p className="mt-4 line-clamp-3">{content}</p>
                        <span className="mt-2 text-sm font-semibold">{date}</span>
                    </div>
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

function ReviewSection({ profileId, className, reviewInfo, setReviewInfo }) {
    const sessionContext = useSessionContext()
    const [doctorReviews, setDoctorReviews] = useState([])
    const [fetchAgain, setFetchAgain] = useState(true)
    const [userReview, setUserReview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [addReviewDialog, setAddReviewDialog] = useState(false)

    useEffect(() => {
        if (sessionContext.sessionData && fetchAgain) {
            axiosInstance.get(getDoctorProfileDetailsUrlReviews(profileId)).then((res) => {
                console.log("doctor reviews", res.data)
                setUserReview(res.data.find((review) => review.reviewerId === sessionContext.sessionData.userId) || null)
                setDoctorReviews(res.data.filter((review) => review.reviewerId !== sessionContext.sessionData.userId))
                setLoading(false)
                setFetchAgain(false)
            }).catch((error) => {
                console.log(error)
                toast.error("Error fetching data check internet.")
                setLoading(false)
                setFetchAgain(false)
            })
        }
    }, [sessionContext.sessionData, fetchAgain, profileId])

    if (loading) return <Loading chose="hand" />

    return (
        <div className={cn("flex flex-col w-full mt-4 rounded", className)}>
            <div className="flex flex-col rounded p-4 w-full">
                <div className="flex flex-col items-end w-full">
                    {!userReview ?
                        <Dialog open={addReviewDialog} onOpenChange={setAddReviewDialog}>
                            <DialogTrigger asChild>
                                <Button className="w-24">
                                    Add Review
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Write your message
                                    </DialogTitle>
                                </DialogHeader>
                                <DialogDescription asChild>
                                    <div className="flex flex-col w-full items-end gap-3">
                                        <div className="flex flex-row w-full gap-7 justify-between items-center h-full" >
                                            <select id="add-review-rating" className="p-2 rounded-md bg-gray-100 border border-gray-500 text-black" defaultValue={0}>
                                                <option value={0} disabled>Rating</option>
                                                <option value={1}>1</option>
                                                <option value={2}>2</option>
                                                <option value={3}>3</option>
                                                <option value={4}>4</option>
                                                <option value={5}>5</option>
                                            </select>
                                            <textarea id="add-review-text" className="px-2 py-1 flex-1 bg-gray-100 shadow-inner border text-black border-blue-300" type="text" />
                                        </div>
                                        <span id="error-message" className="text-sm font-semibold text-end w-full text-red-500 hidden">Please provide a rating at least</span>
                                        <Button className="w-24"
                                            onClick={() => {
                                                const comment = document.getElementById("add-review-text")?.value
                                                const rating = document.getElementById("add-review-rating")?.value
                                                if (Number(rating) !== 0) {
                                                    axiosInstance.post(addReview(sessionContext.sessionData.userId), {
                                                        rating: rating,
                                                        id: profileId,
                                                        comment: comment
                                                    }).then((res) => {
                                                        setReviewInfo(res?.data)
                                                        setFetchAgain(true)
                                                        setLoading(true)
                                                        setAddReviewDialog(false)
                                                        //need to set the structure
                                                        toast.success("Review Added")
                                                    }).catch((error) => {
                                                        console.log(error)
                                                        toast.error("Error adding review")
                                                    })
                                                } else {
                                                    document.getElementById("error-message").classList.remove("hidden")
                                                }
                                            }}>
                                            Add Review
                                        </Button>
                                    </div>
                                </DialogDescription>
                                <DialogFooter>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog> :
                        <></>
                    }
                </div>
                {(!doctorReviews?.length > 0 && !userReview) && <h1 className="text-3xl font-semibold text-center m-4">No reviews found</h1>}
                <div className="flex flex-col items-center gap-5">
                    {userReview ?
                        <UserReviewCard
                            reviewer={userReview?.reviewerName}
                            content={userReview?.comment}
                            date={userReview?.timestamp}
                            rating={userReview?.rating}
                            reviewInfo={reviewInfo}
                            setReviewInfo={setReviewInfo}
                            id={userReview?.id}
                            reviewerId={userReview?.reviewerId}
                            setUserReview={setUserReview}
                            setFetchAgain={setFetchAgain}
                            profilePicture={userReview.profilePicture}
                        /> :
                        <></>
                    }
                    {doctorReviews?.map((review, index) => (
                        <ReviewCard key={index}
                            reviewer={review.reviewerName}
                            content={review.comment}
                            date={review.timestamp}
                            rating={review.rating}
                            reviewerId={review.reviewerId}
                            profilePicture={review.profilePicture}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function UserReviewCard({ content, date, rating, reviewer, setReviewInfo, id, reviewerId, setUserReview, setFetchAgain, profilePicture }) {
    const sessionContext = useSessionContext()
    const [editable, setEditable] = useState(false)
    const [data, setData] = useState({
        content: content,
        date: date,
        rating: rating,
        reviewer: reviewer
    })

    const deleteReview = () => {
        axiosInstance.delete(deleteDoctorReview(sessionContext.sessionData.userId, id)).then((res) => {
            console.log("deleted review", res.data)
            setReviewInfo(res?.data)
            setUserReview(null)

        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <div className="flex flex-col w-10/12 items-start bg-zinc-100 gap-2 rounded-md relative p-3">
            <div className="flex flex-col justify-between w-full items-start  text-black rounded-md px-5 py-1">
                <div className="flex flex-row py-1 items-center gap-3">
                    <Avatar avatarImgScr={profilePicture || emptyAvatar} size={44} />
                    <h1 className="text-lg font-semibold line-clamp-1">{data.reviewer.split("@")[0]}</h1>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex flex-col py-1 items-start justify-center">
                        {editable ? (
                            <select id="review-rating" className="p-2 rounded-md bg-gray-200 border border-gray-600 text-black" defaultValue={Number(data.rating) || 0}>
                                <option value={0} disabled>Rating</option>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                            </select>
                        ) : (
                            <div className="flex flex-row items-start">
                                {[...Array(data.rating)].map((_, index) => (
                                    <Star size={24} key={index} fill="#FFD700" className={cn("text-transparent")} />
                                ))}
                                {[...Array(5 - data.rating)].map((_, index) => (
                                    <Star size={24} key={index} fill="#818181" className={cn("text-transparent")} />
                                ))}

                            </div>
                        )}
                    </div>
                    <div className="flex flex-row gap-2">
                        <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {formatDistanceToNow(new Date(data.date), { addSuffix: true })}
                        </span>
                    </div>
                    <div className="flex flex-row gap-3 absolute top-3 right-3">
                        {
                            editable ? (
                                <>
                                    <button className="bg-gray-100 text-black px-2 h-10 text-base rounded-md font-semibold"
                                        onClick={() => {
                                            const newContent = document.getElementById("review-text")?.value
                                            const newRating = document.getElementById("review-rating")?.value
                                            if ((newRating !== data.rating && newRating) || newContent !== data.content) {
                                                const headers = { 'Authorization': `Bearer ${sessionContext.sessionData.token}` }
                                                axiosInstance.put(updateDoctorReview(sessionContext.sessionData.userId, id), {
                                                    rating: newRating,
                                                    comment: newContent
                                                }).then((res) => {
                                                    console.log("updated review", res.data)
                                                    setReviewInfo(res?.data)
                                                    setFetchAgain(true)

                                                    toast.success("Successfully updated")
                                                    setEditable(false)
                                                }).catch((error) => {
                                                    console.log(error)
                                                    toast.error("Error updating review")
                                                    setEditable(false)
                                                })
                                            }
                                        }}>
                                        <Check size={32} className="text-green-600" />
                                    </button>
                                    <button className="px-2 py-1 text-red-500"
                                        onClick={() => {
                                            setEditable(false)
                                        }}>
                                        <X size={32} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-3">
                                    <button className="  px-2 text-base font-semibold"
                                        onClick={() => {
                                            setEditable(true)
                                        }}>
                                        <Pencil size={28} className="" />
                                    </button>
                                    <button className="px-2 py-1 text-[#ff5151] font-semibold"
                                        onClick={() => {
                                            deleteReview()
                                        }}>
                                        <Trash2 size={28} />
                                    </button>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
            {editable ? <textarea id="review-text" className="border w-full border-blue-500 bg-gray-100 p-2" defaultValue={data.content} /> : (<p className=" text-lg py-1 px-3 mb-1">{data.content}</p>)}
        </div>
    )
}

function ReviewCard({ content, date, rating, reviewer, reviewerId, profilePicture }) {

    return (
        <div className="flex flex-col w-10/12 items-start bg-zinc-100 gap-2 rounded-md relative p-3">
            <div className="flex flex-col justify-between w-full items-start  text-black rounded-md px-5 py-1">
                <div className="flex flex-row py-1 items-center gap-3">
                    <Avatar avatarImgScr={profilePicture || emptyAvatar} size={44} />
                    <h1 className="text-lg font-semibold line-clamp-1">{reviewer.split("@")[0]}</h1>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex flex-col py-1 items-start justify-center">
                        <div className="flex flex-row items-start">
                            {[...Array(rating)].map((_, index) => (
                                <Star size={24} key={index} fill="#FFD700" className={cn("text-transparent")} />
                            ))}
                            {[...Array(5 - rating)].map((_, index) => (
                                <Star size={24} key={index} fill="#818181" className={cn("text-transparent")} />
                            ))}

                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {formatDistanceToNow(new Date(date), { addSuffix: true })}
                        </span>
                    </div>
                </div>
            </div>
            <p className=" text-lg py-1 px-3 mb-1">{content}</p>
        </div>
    )
}

function AboutSection({ workPlace, designation, qualifications, department, contactNumber, className }) {
    qualifications = qualifications.join(", ")
    return (
        <div className={cn("flex flex-col items-center p-4 rounded-md w-full", className)}>
            <h1 className="text-2xl font-semibold">About</h1>
            <div className="flex flex-row w-full p-4 h-auto">
                <div className="flex flex-col items-start px-5 w-6/12 h-full">
                    <span className="flex flex-row items-center mt-0">
                        <BsPersonVcardFill size={20} />
                        <p className="text-lg font-semibold ml-2">{designation}</p>
                    </span>
                    <span className="flex flex-row items-center">
                        <FaChair size={20} />
                        <p className="text-lg font-semibold ml-2">{department}</p>
                    </span>
                    <span className="flex flex-row items-center">
                        <Hospital size={20} className="text-gray-800" />
                        <p className="text-lg font-semibold ml-2">{workPlace}</p>
                    </span>
                </div>
                <Separator orientation="vertical" />
                <div className="flex flex-col justify-evenly items-start px-5 w-6/12 h-full">
                    <span className="flex flex-row items-center mt-0">
                        <PiCertificate size={20} />
                        <p className="text-lg font-semibold ml-2">{qualifications}</p>
                    </span>
                    <span className="flex flex-row items-center mt-4">
                        <Phone size={20} />
                        <p className="text-lg font-semibold ml-2">{contactNumber}</p>
                    </span>

                </div>
            </div>
        </div>
    )
}

function ConsultationSection({ userId, className, profileId }) {
    const [chambers, setChambers] = useState([])
    const sessionContext = useSessionContext()
    useEffect(() => {
        if (sessionContext.sessionData) {
            axiosInstance.get(getDoctorProfileDetailsUrlLocations(profileId)).then((res) => {
                console.log("chambers", res.data)
                setChambers(res.data)
            }).then((res) => {

            }).catch((error) => {
                console.log(error)
                toast.error("Error loading")
            })
        }
    }, [sessionContext.sessionData, profileId])

    if (!sessionContext.sessionData) return <Loading />
    return (
        <div className={cn("flex flex-col w-full mt-4 rounded", className)}>
            <div className="flex flex-col items-center rounded p-4 w-full">
                {chambers?.length === 0 && <h1 className="text-3xl font-semibold text-center m-4">No chambers found</h1>}
                <div className="flex flex-col items-center w-11/12">
                    {
                        chambers?.map((chamber, index) =>
                            <ChamberCard key={index}
                                location={chamber.location}
                                startTime={chamber.start}
                                endTime={chamber.end}
                                fees={chamber.fees}
                                workdays={chamber.workdays}
                                id={chamber.id}
                                profileId={profileId}
                            />
                        )
                    }
                </div>
            </div>
        </div>

    )
}

function ChamberCard({ location, startTime, endTime, workdays, fees, profileId, id }) {
    const weekDays = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]
    const sessionContext = useSessionContext()
    const workdaysArray = workdays.split('')
    const [appointmentDate, setAppointmentDate] = useState(null)
    const [openDialog, setOpenDialog] = useState(false)
    const requestAppointment = () => {
        const contactNumber = document.getElementById('patient-contact-number')?.value
        if (!contactNumber || contactNumber.length !== 11) {
            toast.error('Please enter a valid contact number')
            return
        }
        else if (!appointmentDate) {
            toast.error("Select an appointment date.")
            return
        }
        const tempDate = new Date(appointmentDate)
        const formData = {
            "patientId": sessionContext.sessionData.userId,
            "doctorId": Number(profileId),
            "patientContactNumber": contactNumber,
            "locationId": id,
            "date": `${tempDate.getFullYear()}-${(tempDate.getMonth() + 1) < 10 ? `0${tempDate.getMonth() + 1}` : `${tempDate.getMonth() + 1}`}-${(tempDate.getDate()) < 10 ? `0${tempDate.getDate()}` : `${tempDate.getDate()}`}`,
            "isOnline": location === locationOnline
        }
        console.log('Requesting Appointment')
        console.log(formData)
        const headers = { 'Authorization': `Bearer ${sessionContext.sessionData.token}` }
        axiosInstance.post(addAppointment, formData).then((res) => {
            toast.success("Appointment requested")
            setAppointmentDate(null)
            setOpenDialog(false)
        }).catch((error) => {
            console.log(error)
            toast.error("Error occured. Check details and internet")
        })
    }

    return (
        <div className="flex flex-row w-full m-1 bg-white rounded-md shadow justify-between px-3">
            <div className="flex flex-col px-4 py-2">
                <h1 className="text font-semibold line-clamp-1 flex gap-2 items-center">
                    <MapPinIcon size={20} />
                    {location}
                </h1>
                <p className="mt-2 line-clamp-2 flex gap-2 items-center">
                    <Banknote size={16} />
                    {fees}
                </p>
            </div>
            <div className="flex flex-col px-4 py-2 items-center">
                <div className="flex flex-row items-center">
                    <Clock size={20} />
                    <p className="text-lg font-semibold ml-2">{startTime} to {endTime}</p>
                </div>
                <div className="flex flex-row items-center mt-4">
                    {weekDays.map((day, index) => (
                        <div key={index} className={cn("flex flex-row items-center border text-black mx-2 bg-green-300 rounded-sm", workdaysArray[index] !== '1' && "hidden")}>
                            <span className="text-lg font-semibold mx-2">{day}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-row px-4 py-2 items-center justify-center h-full">
                <AlertDialog open={openDialog}>
                    <AlertDialogTrigger className="bg-gradient-to-br from-pink-600 to-pink-700 text-gray-200 px-2 py-2 text-sm rounded-md ml-2 font-semibold hover:bg-gray-200 hover:text-purple-100 transition hover:text-base"
                        onClick={() => setOpenDialog(true)}>
                        Request Appointment</AlertDialogTrigger>
                    <AlertDialogContent className="w-auto bg-gray-100  flex flex-col justify-between">
                        <AlertDialogHeader className={"gap-3"}>
                            <AlertDialogTitle>Appointment Request Form</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="flex flex-col gap-5 mx-3 w-full">
                                    <p className="text-base font-semibold text-black">Location: {location}</p>
                                    <div className="flex flex-row items-center w-full justify-between">
                                        <p className="text-base font-semibold text-black">Fees: {fees}</p>
                                        <div className="flex gap-4">
                                            <p className="text-base font-semibold text-black">{startTime}</p>
                                            <p className="text-base font-semibold text-black">To</p>
                                            <p className="text-base font-semibold text-black">{endTime}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center justify-start gap-2">
                                        {weekDays.map((day, index) => (
                                            <div key={index} className={cn("flex flex-row items-center rounded-md shadow-sm text-black border border-gray-600", workdaysArray[index] !== '1' && "hidden")}>
                                                <span className="text-lg font-semibold mx-2">{day}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-2/3 justify-start text-left font-normal border border-gray-600",
                                                        !appointmentDate && "text-muted-foreground"
                                                    )}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {appointmentDate ? format(appointmentDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={appointmentDate}
                                                    onSelect={(selectedDate) => {
                                                        setAppointmentDate(selectedDate)
                                                    }}
                                                    disabled={(date) =>
                                                        String(workdaysArray[(new Date(date).getDay() + 1) % 7]) === '0' || date < new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <input type="number" id="patient-contact-number" className="w-full number-input h-10 p-2 border text-black border-gray-600 rounded-md" placeholder="Enter your Contact Number" pattern="[0-9]{11}" title="Please enter a valid 11 digit phone number" />
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel className="bg-red-700 border border-red-700 text-white px-3 py-1 text-sm rounded-md ml-2 font-semibold hover:bg-gray-50 hover:text-red-600"
                                onClick={() => {
                                    setAppointmentDate(null)
                                    setOpenDialog(false)
                                }}
                            >Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-green-700 border border-green-600 text-white px-3 py-1 text-sm rounded-md ml-2 font-semibold hover:bg-gray-100 hover:text-green-600"
                                onClick={() => requestAppointment()}
                            >Request</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )

}

function AppointmentsSection({ userId, className }) {
    const [comingAppointments, setComingAppointments] = useState([
        // {
        //     location: "Dhaka Medical College Hospital",
        //     startTime: "09:00",
        //     endTime: "17:00",
        //     date: "2021-09-01",
        //     fees: "500 BDT"
        // },
        // {
        //     location: "Dhaka Medical College Hospital",
        //     startTime: "09:00",
        //     endTime: "17:00",
        //     date: "2021-09-01",
        //     fees: "500 BDT"
        // }
    ])

    return (
        <>
            {comingAppointments.length > 0 ? (
                <>
                    <div className={cn("flex flex-col items-center w-full rounded-md px-4 py-3 ", className)}>
                        <h1 className="text-2xl font-semibold flex  font-sans items-center"><CalendarSearch strokeWidth={2.5} size={32} className="mr-3 text-purple-600" />Upcoming Appointments</h1>
                        <div className="flex flex-col w-full mt-3">
                            {comingAppointments.map((appointment, index) => (
                                <AppointmentCard key={index} location={appointment.location} startTime={appointment.startTime} endTime={appointment.endTime} date={appointment.date} fees={appointment.fees} rotateDirection={index % 2} />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={cn("flex flex-row justify-between w-full mt-4 rounded-md px-6 h-auto", className)}>
                        <div className="flex flex-row items-center justify-evenly ml-10 h-full">
                            <span className="text-lg font-semibold">You have no upcoming appointments</span>
                            <Lottie
                                animationData={EmptyAppointment}
                                className="flex justify-center items-center w-64"
                                loop={true}
                            />
                        </div>
                        <Separator orientation="vertical" className="w-[2px] h-10/12 mt-5 bg-pink-300" />
                        <div className="flex flex-row items-center justify-evenly mr-10">
                            <Lottie
                                animationData={AddAppointAnimation}
                                className="flex justify-center items-center w-64"
                                loop={true}
                            />
                            <span className="text-lg font-semibold">Go to Consultations to add an appointment</span>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

function AppointmentCard({ location, startTime, endTime, date, fees, rotateDirection }) {
    return (
        <div className={cn("flex flex-row w-full m-1 bg-white rounded-md shadow h-auto")}>
            <div className="flex flex-col w-4/12 px-4 py-2">
                <h1 className="text font-semibold line-clamp-1">{location}</h1>
                <p className="mt-2 line-clamp-2">{fees}</p>
            </div>
            <div className="flex flex-col w-4/12 px-4 py-2 h-full justify-center">
                <div className="flex flex-row items-center h-full">
                    <p className="text-base font-semibold ml-2">{startTime + " to " + endTime}</p>
                </div>
                <div className="flex flex-row items-center mt-4">
                    <span className="text-sm font-semibold text-end w-full">{date}</span>
                </div>
            </div>
            <div className="flex flex-col w-4/12 px-4 py-2 items-end justify-center h-full">
                <button className="bg-pink-500 to-pink-500 text-black px-2 py-1 text-sm rounded-md ml-2 font-semibold max-w-32 hover:scale-90 hover:bg-gray-200 hover:text-purple-700 transition ease-out hover:text-base">Cancel Appointment</button>
            </div>
        </div>
    )
}