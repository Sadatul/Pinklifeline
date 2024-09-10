'use client'
import Link from "next/link"
import logoIcon from '../../../../public/fav.ico';
import logoText from '../../../../public/file.svg';
import Image from 'next/image';
import { useEffect, useState } from "react";
import Avatar from "../../components/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { extractLink, getProfilePicUrl, logoutUrlReq, pagePaths, roles, testingAvatar } from "@/utils/constants";
import { PrimeReactProvider } from 'primereact/api';
import { StompContextProvider } from "@/app/context/stompContext";

import { SocketInitializer } from "../../components/stompInitializer";
import axiosInstance from "@/utils/axiosInstance";
import { useSessionContext } from "@/app/context/sessionContext";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import { ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export default function Layout({ children }) {
    const navBarLinksCSS = "h-full text-center items-center justify-center transition-transform ease-out duration-300 hover:scale-110 hover:underline-offset-8 hover:underline";

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
        if (sessionContext.sessionData?.userId) {
            const profilePicLink = sessionStorage.getItem("profilePicLink")
            if (!profilePicLink) {
                axiosInstance.get(getProfilePicUrl).then((res) => {
                    if (res.data.profilePicture && res.data.profilePicture !== "") {
                        sessionStorage.setItem("profilePicLink", res.data.profilePicture)
                        setProfilePic(res.data.profilePicture)
                    }
                }).catch((error) => {
                    console.log("error getting profilepic", error)
                })
            }
            else {
                setProfilePic(profilePicLink)
            }
        }
    }, [sessionContext.sessionData])

    useEffect(() => {
        window.addEventListener('scroll', checkScroll);
    }, []);

    return (
        <PrimeReactProvider value={{ ripple: true }}>
            <StompContextProvider>
                <div className="w-screen h-screen flex flex-col text-black break-all">
                    <nav id="navbar" className="bg-zinc-100 h-14 flex sticky top-0 z-50 flex-row justify-between items-center flex-wrap flex-shrink shadow" >
                        <Link href={"/"} className=" pt-3 ml-6 h-full flex flex-row justify-center items-center flex-wrap">
                            <Image loading="lazy" className="hidden md:block mr-2 shrink delay-700 -translate-y-2" src={logoIcon.src} alt="logo" width={35} height={35} />
                            <Image loading='lazy' className="shrink hidden md:block mb-3" src={logoText.src} alt="logo-text" width={170} height={75} />
                        </Link >
                        <div className="text-xl text-center flex flex-row justify-center items-center space-x-6 flex-wrap">
                            <Link href={pagePaths.dashboard} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Dashboard</Link>
                            <Link href={pagePaths.inbox} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Inbox</Link>
                            <Link href={pagePaths.blogsPage} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Blog</Link>
                            <Link href={pagePaths.forumPage} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Forum</Link>
                            <Link href={pagePaths.searchPage("")} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Search</Link>
                        </div>
                        <div className="flex flex-shrink flex-row justify-center items-center mr-28 h-full">
                            <Popover>
                                <PopoverTrigger >
                                    <Avatar avatarImgSrc={profilePic} size={50} />
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <div className="w-32 rounded-md py-2 flex flex-col justify-between items-center">
                                        <Link className="text-center p-1 m-1 text-black hover:scale-105 transition ease-in w-full" href={pagePaths.dashboardPages.userdetailsPage}>Profile</Link>
                                        <Link className="text-center p-1 m-1 text-black hover:scale-105 transition ease-in w-full" href={pagePaths.dashboardPages.profilePicPage}>Profile Pic</Link>
                                        <button className="text-center p-1 m-1 font-semibold hover:scale-105 transition ease-in w-5/6 rounded bg-red-300 text-black" onClick={() => {
                                            axiosInstance.get(logoutUrlReq).then((res) => {
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
                    {sessionContext?.sessionData?.isRegisterComplete === false && !pathname.startsWith("/userdetails") && sessionContext.sessionData.role !== roles.admin &&
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
                    <SocketInitializer />
                    <ScrollableContainer className="flex flex-col flex-grow overflow-y-auto rounded-l-lg overflow-x-hidden">
                        {children}
                    </ScrollableContainer>
                </div>
            </StompContextProvider>
        </PrimeReactProvider>
    )
}


