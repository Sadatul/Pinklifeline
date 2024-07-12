'use client'
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner";
import { useStompContext } from "@/app/context/stompContext";
import { messageSendUrl, roles } from "@/utils/constants";
import Image from "next/image";
import { MessageCirclePlus, MessageCircleReply, Send, Star, StarHalf, ThumbsUp } from "lucide-react";
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


export default function Profile() {
    const params = useParams()
    const containerRef = useRef(null)
    const [selectedTab, setSelectedTab] = useState(0)
    const [showProfileNavbar, setShowProfileNavbar] = useState(false)
    const [tabs, setTabs] = useState([
        {
            title: "Posts",
            scrollPosition: 0
        },
        {
            title: "About",
            scrollPosition: 0
        },
        {
            title: "Reviews",
            scrollPosition: 0
        },
        {
            title: "Appointments",
            scrollPosition: 0
        },
        {
            title: "Consultations",
            scrollPosition: 0
        }
    ])
    const rating = 4
    const ratingArray = [52, 48, 86, 75, 50]
    const profileName = "The Last Airbender Aang"
    const workPlace = "Air Temple"
    const designation = "Avater"
    const profilePic = "https://sm.ign.com/t/ign_nordic/cover/a/avatar-gen/avatar-generations_prsz.300.jpg"
    const ratingIcon = rating <= 2.5 ? <Star strokeWidth={1.5} size={24} className={cn(" text-transparent text-[#FFD700]")} /> : rating < 4 ? <StarHalf size={24} fill="#FFD700" className={cn("text-transparent")} /> : <Star size={24} fill="#FFD700" className={cn("text-transparent")} />
    const stompContext = useStompContext();
    const [userId, setUserId] = useState('')
    useEffect(() => {
        setUserId(localStorage.getItem('userId'))
    }, [])

    const sendMessage = () => {
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

    return (
        <ScrollableContainer id="container" ref={containerRef} className="flex w-screen overflow-x-hidden flex-col flex-grow p-4 items-center bg-gradient-to-r from-gray-100 via-zinc-100 to-slate-100"
            onScroll={(e) => {
                if (containerRef.current?.scrollTop > 300 && !showProfileNavbar) {
                    setShowProfileNavbar(true)
                }
                else if (containerRef.current?.scrollTop <= 300 && showProfileNavbar) {
                    setShowProfileNavbar(false)
                }
            }}>

            <div id="profile-navbar" hidden={true} className={cn(showProfileNavbar ? "bg-gradient-to-b from-gray-200 from-75%  to-transparent to-100% h-16 p-3 w-full flex sticky -top-6 z-50 flex-row gap-5 justify-between items-center flex-wrap flex-shrink rounded-b-lg shadow" : "hidden")}>
                <Image src={profilePic} width={48} height={52} className="rounded-full ml-16" alt="profile-picture" />
                <div className="flex flex-row gap-3">
                    {tabs.map((tab, index) => (
                        <button key={index} onClick={() => setSelectedTab(index)} className={cn("text-base flex flex-col font-semibold px-2 mx-5", selectedTab === index ? "text-pink-600" : "text-gray-800")}>
                            {tab.title}
                            <hr hidden={selectedTab !== index} className={cn("w-full mt-1 h-[3px] bg-pink-600")} />
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col w-11/12 items-center bg-white">
                <div className="relative w-full h-28 rounded-t-md">
                    <Image
                        src={"https://img.freepik.com/free-vector/watercolor-hot-pink-background_23-2150815041.jpg?size=626&ext=jpg&uid=R109267787&ga=GA1.1.1367600061.1718446141&semt=sph"}
                        alt="Background"
                        layout="fill"
                        className="absolute inset-0 w-full h-full object-cover rounded-t-md"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white from-10% via-50% via-transparent to-transparent rounded-t-md"></div>
                </div>
                <div className="flex flex-row w-full bg-white rounded-b-md p-4 relative justify-between px-7">
                    <div className="absolute -top-20 flex flex-col items-center">
                        <Image src={profilePic} width={200} height={200} className="rounded  shadow-md" alt="profile-picture" />
                        {params.role === roles.doctorProfile && <Badge className={"mt-2 text-sm"}>Doctor</Badge>}
                    </div>
                    <div className="flex flex-col ml-56">
                        <h1 className="text-2xl font-bold ">{profileName}</h1>
                        <h1 className="text-base ">{designation}{", "}{workPlace}</h1>
                        <Popover>
                            <PopoverTrigger className="w-12">
                                <div className="flex flex-row items-center mt-3">
                                    {ratingIcon}
                                    <span className="text-base font-semibold ml-2">{rating}</span>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto ">
                                {ratingArray.map((rating, index) => (
                                    <div key={index} className="flex flex-row items-center p-2">
                                        <div className="flex flex-row flex-1">
                                            {ratingArray.slice(index).map((rating2, index2) => (
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="bg-blue-500 text-white px-2 py-2 rounded-md text-base flex flex-row items-center">
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
                        <button className="bg-purple-500 text-white px-2 py-2 text-base rounded-md ml-2 font-semibold">Request Appointment</button>
                    </div>
                </div>
                <Separator className="w-11/12 mt-10 h-[2px]" />
                <div className="flex flex-row w-11/12 mt-4 py-3">
                    {tabs.map((tab, index) => (
                        <button key={index} onClick={() => setSelectedTab(index)} className={cn("text-base flex flex-col font-semibold px-2 mx-5 p-ripple rounded-t-md", selectedTab === index ? "text-pink-600" : "text-gray-800")}>
                            {tab.title}
                            <Ripple
                                pt={{
                                    root: { style: { background: 'rgba(156, 39, 176, 0.3)' } }
                                }} />
                            <hr hidden={selectedTab !== index} className={cn("w-full mt-1 h-[3px] bg-pink-600")} />
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col w-full items-center mt-4">
                <ReviewSection />
            </div>
        </ScrollableContainer>
    )
}

// function PostSection({ userId }) {
//     const [selectedTab, setSelectedTab] = useState("blogPosts")
//     const [currentBlogPostPage, setCurrentBlogPostPage] = useState(1)
//     const [currentForumQuestionPage, setCurrentForumQuestionPage] = useState(1)
//     const [totalBlogPostPages, setTotalBlogPostPages] = useState(15)
//     const [totalForumQuestionPages, setTotalForumQuestionPages] = useState(12)
//     const [posts, setPosts] = useState([
//         {
//             title: "Does hormone replacement therapy increase cancer risk?",
//             content: "Hormone replacement therapies (HRT) are hormonal medications that can help reduce menopause symptoms. While these therapies offer welcome symptom relief for many people, they have also been associated with side effects, including increased breast cancer risk.",
//             date: "2021-09-01",
//             imageSrc: "https://www.mdanderson.org/cancerwise/2024/07/medullary-thyroid-cancer-survivor-trusts-md-anderson-for-long-term-care/jcr:content/blog/adaptiveimage.resize.648.0.medium.dir.jpg/1720705182439.jpg"
//         },
//         {
//             title: "Does hormone replacement therapy increase cancer risk?",
//             content: "Hormone replacement therapies (HRT) are hormonal medications that can help reduce menopause symptoms. While these therapies offer welcome symptom relief for many people, they have also been associated with side effects, including increased breast cancer risk.",
//             date: "2021-09-01",
//             imageSrc: "https://www.mdanderson.org/cancerwise/2024/07/does-hormone-replacement-therapy-increase-cancer-risk/jcr:content/blog/adaptiveimage.resize.648.0.medium.dir.jpg/1719869273826.jpg"
//         },
//         {
//             title: "Does hormone replacement therapy increase cancer risk?",
//             content: "Hormone replacement therapies (HRT) are hormonal medications that can help reduce menopause symptoms. While these therapies offer welcome symptom relief for many people, they have also been associated with side effects, including increased breast cancer risk.",
//             date: "2021-09-01",
//             imageSrc: "https://www.mdanderson.org/cancerwise/2024/07/does-hormone-replacement-therapy-increase-cancer-risk/jcr:content/blog/adaptiveimage.resize.648.0.medium.dir.jpg/1719869273826.jpg"
//         },
//         {
//             title: "Does hormone replacement therapy increase cancer risk?",
//             content: "Hormone replacement therapies (HRT) are hormonal medications that can help reduce menopause symptoms. While these therapies offer welcome symptom relief for many people, they have also been associated with side effects, including increased breast cancer risk.",
//             date: "2021-09-01",
//             imageSrc: "https://www.mdanderson.org/cancerwise/2024/07/does-hormone-replacement-therapy-increase-cancer-risk/jcr:content/blog/adaptiveimage.resize.648.0.medium.dir.jpg/1719869273826.jpg"
//         },
//     ])
//     return (
//         <div className="flex flex-row w-11/12 mt-4 bg-white rounded">
//             <div className="flex flex-col rounded p-4 w-9/12">
//                 <Tabs defaultValue={"blogPosts"} onValueChange={(value) => {
//                     console.log(value)
//                     setSelectedTab(value)
//                 }}>
//                     <TabsList className="p-2 h-12">
//                         <TabsTrigger value={"blogPosts"} onClick={() => { setSelectedTab("blogPosts") }}>
//                             <div type="button" className={cn("text-xl font-bold", selectedTab === "blogPosts" ? "text-purple-500" : "")}>Blog Posts</div>
//                         </TabsTrigger>
//                         <TabsTrigger value={"forumQuestions"} onClick={() => { setSelectedTab("forumQuestions") }} >
//                             <div type="button" className={cn("text-xl font-bold", selectedTab === "forumQuestions" ? "text-purple-500" : "")}>Forum Questions</div>
//                         </TabsTrigger>
//                     </TabsList>
//                     <TabsContent value={"blogPosts"}>
//                         <div className="flex flex-col">
//                             {posts.map((post, index) => (
//                                 <BlogCard key={index} title={post.title} content={post.content} date={post.date} imageSrc={post.imageSrc} />
//                             ))}
//                         </div>
//                     </TabsContent>
//                     <TabsContent value={"forumQuestions"}>
//                         <div className="flex flex-col">
//                             <ForumCard title="How to deal with anxiety?" content="I have been feeling anxious lately. How do I deal with it?" date="2021-09-01" likesCount={10} commentsCount={15} />
//                             <ForumCard title="How to deal with anxiety?" content="I have been feeling anxious lately. How do I deal with it?" date="2021-09-01" likesCount={14} commentsCount={9} />
//                         </div>
//                     </TabsContent>
//                 </Tabs>
//                 <div className="w-full flex justify-center mt-4">
//                     <Pagination count={selectedTab === "blogPosts" ? totalBlogPostPages : totalForumQuestionPages}
//                         page={selectedTab === "blogPosts" ? currentBlogPostPage : currentForumQuestionPage}
//                         boundaryCount={3}
//                         size="large"
//                         variant="outlined"
//                         onChange={(event, value) => {
//                             if (selectedTab === "blogPosts") {
//                                 setCurrentBlogPostPage(value)
//                             }
//                             else if (selectedTab === "forumQuestions") {
//                                 setCurrentForumQuestionPage(value)
//                             }
//                         }}
//                         color={selectedTab === "blogPosts" ? "primary" : "secondary"}
//                     />
//                 </div>
//             </div>
//             <div className="flex flex-col rounded p-4 ml-4 w-3/12">
//                 <h1 className="text-2xl font-semibold">Similar Persons</h1>
//             </div>
//         </div>
//     )
// }

// function BlogCard({ title, content, date, imageSrc }) {
//     return (
//         <div className="flex flex-row w-full m-1 bg-white rounded-md shadow">
//             <div className="relative w-full h-40 rounded-l-md overflow-hidden">
//                 <Image
//                     src={imageSrc}
//                     layout="fill"
//                     className="absolute inset-0 w-full h-full object-left object-contain rounded-l-md"
//                     alt="Blog Image"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-l from-white from-75%  to-transparent to-90% rounded-t-md flex flex-col items-end">
//                     <div className="relative w-9/12 z-10 px-4 py-2 text-black flex flex-col items-end text-end">
//                         <h1 className="text-2xl font-bold line-clamp-1">{title}</h1>
//                         <p className="mt-4 line-clamp-3">{content}</p>
//                         <span className="mt-2 text-sm font-semibold">{date}</span>
//                     </div>
//                 </div>

//             </div>
//         </div>
//     )
// }

// function ForumCard({ title, content, date, likesCount, commentsCount }) {
//     return (
//         <div className="flex flex-row w-full m-1 bg-white rounded-md drop-shadow-sm h-28 bg-gradient-to-r from-slate-100 via-gray-100 to-zinc-100">
//             <div className="flex flex-col w-full px-4 py-2">
//                 <h1 className="text-2xl font-bold line-clamp-1">{title}</h1>
//                 <p className="mt-2 line-clamp-2">{content}</p>
//                 <div className="flex flex-row justify-between mt-1 py-1 w-full">
//                     <div className="flex flex-row">
//                         <span className="flex">
//                             <ThumbsUp size={20} fill="white" className="text-blue-400" />
//                             {likesCount}
//                         </span>
//                         <span className="flex">
//                             <MessageCircleReply size={20} className="text-pink-400 ml-6" />
//                             {commentsCount}
//                         </span>
//                     </div>
//                     <span className="text-sm font-semibold text-end w-full">{date}</span>
//                 </div>
//             </div>
//         </div>
//     )
// }

function ReviewSection({ userId }) {
    const [currentReviewPage, setCurrentReviewPage] = useState(1)
    const [totalReviewPages, setTotalReviewPages] = useState(12)
    const [reviews, setReviews] = useState([
        {
            content: "Dr. Aang is a very good doctor. He helped me with my anxiety and I am feeling much better now.",
            date: "2021-09-01",
            rating: 4,
            name: "John Doe"
        },
        {
            content: "Dr. Aang is a very good doctor. He helped me with my anxiety and I am feeling much better now.",
            date: "2021-09-01",
            rating: 5,
            name: "John Doe"
        },
        {
            content: "Dr. Aang is a very good doctor. He helped me with my anxiety and I am feeling much better now.",
            date: "2021-09-01",
            rating: 3,
            name: "John Doe"
        },
        {
            content: "Dr. Aang is a very good doctor. He helped me with my anxiety and I am feeling much better now.",
            date: "2021-09-01",
            rating: 4,
            name: "John Doe"
        },
    ])
    return (
        <div className="flex flex-col w-11/12 mt-4 bg-white rounded">
            <div className="flex flex-col rounded p-4 w-full">
                <div className="flex flex-col">
                    {reviews.map((review, index) => (
                        <ReviewCard key={index} reviewer={review.name} content={review.content} date={review.date} rating={review.rating} />
                    ))}
                </div>
                <div className="w-full flex justify-center mt-4">
                    <Pagination count={totalReviewPages}
                        page={currentReviewPage}
                        boundaryCount={3}
                        size="large"
                        variant="outlined"
                        onChange={(event, value) => {
                            setCurrentReviewPage(value)
                        }}
                        color={"primary"}
                    />
                </div>
            </div>
        </div>
    )
}

function ReviewCard({ content, date, rating, reviewer }) {
    return (
        <div className="flex flex-row w-full m-1 bg-white rounded-md shadow h-24">
            <div className="flex flex-col w-8/12 px-4 py-2">
                <h1 className="text-2xl font-semibold line-clamp-1">{reviewer}</h1>
                <p className="mt-2 line-clamp-2">{content}</p>
            </div>
            <div className="flex flex-col w-4/12 px-4 py-2 items-center justify-center">
                <div className="flex flex-row items-center">
                    {rating <= 2.5 ? <Star strokeWidth={1.5} size={24} className={cn(" text-transparent text-[#FFD700]")} /> : rating < 4 ? <StarHalf size={24} fill="#FFD700" className={cn("text-transparent")} /> : <Star size={24} fill="#FFD700" className={cn("text-transparent")} />}
                    <span className="text-lg font-semibold ml-2">{rating}</span>
                </div>
                <span className="text-sm font-semibold text-end w-full">{date}</span>
            </div>
        </div>
    )
}

function AboutSection(){
    
}