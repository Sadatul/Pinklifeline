'use client'
import Link from "next/link"
import logoIcon from '../../../../public/Pink-removebg.png';
import logoText from '../../../../public/file.svg';
import Image from 'next/image';
import { useEffect, useState } from "react";
import Avatar from "../../components/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { extractLink, getProfilePicUrl, logoutUrlReq, pagePaths, roles, sessionDataItem, testingAvatar } from "@/utils/constants";
import { PrimeReactProvider } from 'primereact/api';
import { StompContextProvider } from "@/app/context/stompContext";

import { SocketInitializer } from "../../components/stompInitializer";
import axiosInstance from "@/utils/axiosInstance";
import { useSessionContext } from "@/app/context/sessionContext";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import { BookOpenTextIcon, CircleHelp, ExternalLink, Hospital, MessageCircle, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { CircleGaugeIcon } from "lucide-react";
import { cn } from "@/lib/utils";


export default function Layout({ children }) {
    const [sessionData, setSessionData] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        const sessionData = JSON.parse(localStorage.getItem(sessionDataItem))
        setSessionData(sessionData)
        setIsMounted(true)
    }, [])

    if (!isMounted) return null
    return (
        <PrimeReactProvider value={{ ripple: true }}>
            <StompContextProvider>
                <div className="w-screen h-screen flex flex-col text-black break-normal">
                    {sessionData && <NavBar />}
                    {sessionData && <SocketInitializer />}
                    <ScrollableContainer className="flex flex-col flex-grow overflow-y-auto rounded-l-lg overflow-x-hidden">
                        {children}
                    </ScrollableContainer>
                </div>
            </StompContextProvider>
        </PrimeReactProvider>
    )
}

/**
 * 
 * <Link href={pagePaths.dashboard} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Dashboard</Link>
                            <Link href={pagePaths.allHospitalsPage} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Hospitals</Link>
                            <Link href={pagePaths.inbox} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Inbox</Link>
                            <Link href={pagePaths.blogsPage} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Blog</Link>
                            <Link href={pagePaths.forumPage} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Forum</Link>
                            <Link href={pagePaths.searchPage("")} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Search</Link> 
 */
function NavBar() {
    const navBarLinksCSS = "h-full text-center items-center justify-center transition-transform ease-out duration-300 hover:scale-110 hover:underline-offset-8 hover:underline";

    const NavBarPageLinks = [
        { name: "Dashboard", link: pagePaths.dashboard, icon: <CircleGaugeIcon size={24} />, matchString: "dashboard" },
        { name: "Hospitals", link: pagePaths.allHospitalsPage, icon: <Hospital size={24} />, matchString: "hospitals", className: "bg-gray-100" },
        { name: "Inbox", link: pagePaths.inbox, icon: <MessageCircle size={24} />, matchString: "inbox", className: "bg-zinc-100" },
        { name: "Blog", link: pagePaths.blogsPage, icon: <BookOpenTextIcon size={24} />, matchString: "blogs", className: "bg-slate-100" },
        { name: "Forum", link: pagePaths.forumPage, icon: <CircleHelp size={24} />, matchString: "forum", className: "bg-stone-100" },
        { name: "Search", link: pagePaths.searchPage(""), icon: <Search size={24} />, matchString: "search" },
    ]

    const [profilePic, setProfilePic] = useState(testingAvatar)
    const sessionContext = useSessionContext()
    const pathname = usePathname()

    const checkScroll = () => {
        if (window.scrollY > 0) {
            document.getElementById('navbar').classList.add('scale-90', 'shadow-md');
        }
        else {
            document.getElementById('navbar').classList.remove('scale-90', 'shadow-md');
        }
    }

    useEffect(() => {
        if (sessionContext?.sessionData?.userId) {
            const profilePicLink = sessionStorage.getItem("profilePicLink")
            const userIdFromSessionStorage = sessionStorage.getItem("userId")
            if (!profilePicLink || (userIdFromSessionStorage !== sessionContext?.sessionData.userId)) {
                axiosInstance.get(getProfilePicUrl).then((res) => {
                    if (res.data.profilePicture && res.data.profilePicture !== "") {
                        sessionStorage.setItem("profilePicLink", res.data.profilePicture)
                        sessionStorage.setItem("userId", sessionContext?.sessionData.userId)
                        setProfilePic(res.data.profilePicture)
                        sessionContext?.setProfilePic(res.data.profilePicture)
                    }
                }).catch((error) => {
                    console.log("error getting profilepic", error)
                })
            }
            else {
                setProfilePic(profilePicLink)
                sessionContext?.setProfilePic(profilePicLink)
            }
        }
    }, [sessionContext?.sessionData])

    useEffect(() => {
        window.addEventListener('scroll', checkScroll);
    }, []);

    if (!sessionContext?.sessionData) return null

    return (
        <>
            <nav id="navbar" className={cn("bg-zinc-100 h-[65px] flex sticky top-0 z-50 flex-row justify-between items-center flex-wrap flex-shrink", NavBarPageLinks.filter(page => pathname.toLowerCase().includes(page.matchString))[0]?.className)}>
                <Link href={pagePaths.dashboardPages.userdetailsPage} className=" pt-2 ml-6 h-full flex flex-row justify-center items-center flex-wrap">
                    {(!pathname.includes("dashboard")) &&
                        <Image loading="lazy" className="hidden md:block mr-2 shrink delay-700 -translate-y-2" src={logoIcon.src} alt="logo" width={200} height={60} />
                    }
                    {(pathname.includes("dashboard")) &&
                        <Image loading="lazy" className="hidden md:block mr-2 shrink delay-700 -translate-y-3 -translate-x-3 left-5" src={logoIcon.src} alt="logo" width={250} height={100} />
                    }
                    {/* <Image loading='lazy' className="shrink hidden md:block mb-3" src={logoText.src} alt="logo-text" width={170} height={75} /> */}
                </Link >
                <div className="text-xl text-center flex flex-row justify-center items-center gap-5 flex-wrap">
                    {(!pathname.startsWith("/admin")) && NavBarPageLinks?.map((page, index) => (
                        <Link key={index} href={page.link} className={cn("flex items-center drop-shadow-md py-2 px-3 rounded-xl", pathname.toLowerCase().includes(page.matchString) ? "bg-pink-600 bg-opacity-70 text-gray-50 text-lg pointer-events-none shadow-xl" : "text-opacity-75 text-gray-600 text-base hover:bg-white hover:text-gray-800 hover:translate-y-[6px] transition-all ease-linear ")} >
                            <span className="flex flex-row items-center gap-2">
                                {/* {React.createElement(page.icon, { size: 24, className: "" })} */}
                                {page.icon}
                                {page.name}
                            </span>
                        </Link>
                    ))}
                </div>
                <div className="flex flex-shrink flex-row justify-center items-center mr-28 h-full">
                    <Popover>
                        <PopoverTrigger >
                            <Avatar avatarImgSrc={profilePic} size={50} />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <div className=" absolute border-l[1px] border-r[1px] border-t[1px] border-b[1px] border-gray-200 rounded-md top-12 right-0 w-0 h-0"></div>
                            <div className="w-32 rounded-md py-2 flex flex-col justify-between items-center gap-2 bg-white bg-opacity-70">
                                {(!pathname.startsWith("/admin")) &&
                                    <>
                                        <Link className="text-center text-black hover:scale-105 transition ease-in w-full" href={pagePaths.dashboardPages.userdetailsPage}>Profile</Link>
                                        <Separator />
                                        <Link className="text-center text-black hover:scale-105 transition ease-in w-full" href={pagePaths.dashboardPages.profilePicPage}>Profile Pic</Link>
                                        <Separator />
                                    </>
                                }
                                <button className="text-center font-semibold hover:scale-105 transition ease-in w-5/6 rounded bg-red-500 text-gray-100" onClick={() => {
                                    axiosInstance.get(logoutUrlReq).then((res) => {
                                        localStorage.removeItem(sessionDataItem)
                                        sessionStorage.removeItem("profilePicLink")
                                        sessionStorage.removeItem("userId")
                                        window.location.href = "/"
                                    }).catch((error) => {
                                        console.log("error logging out", error)
                                    })
                                }}>
                                    Logout
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </nav>
            {sessionContext?.sessionData?.isRegisterComplete === false && !pathname.startsWith("/userdetails") && sessionContext?.sessionData.role !== roles.admin &&
                <div className="flex flex-row p-3 w-full bg-red-100 justify-evenly">
                    <span className="text-lg font-semibold text-gray-800">
                        Your registration is not complete. Please complete your registration to access the site properly.
                    </span>
                    <Link href={pagePaths.userdetails} className="text-lg font-semibold text-blue-800 hover:underline flex items-center">
                        Complete Registration
                        <ExternalLink className="ml-1" size={20} />
                    </Link>
                </div>
            }
        </>
    )
}

