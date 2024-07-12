'use client'
import Link from "next/link"
import logoIcon from '../../../public/fav.ico';
import logoText from '../../../public/file.svg';
import Image from 'next/image';
import { useEffect } from "react";
import Avatar from "../components/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { pagePaths, testingAvatar } from "@/utils/constants";
import { PrimeReactProvider } from 'primereact/api';
import { StompContextProvider } from "@/app/context/stompContext";
import { useCallback } from "react";

import { SocketInitializer } from "../components/stompInitializer";

export default function Layout({ children }) {
    const navBarLinksCSS = "h-full text-center items-center justify-center transition-transform ease-out duration-300 hover:scale-110 hover:underline-offset-8 hover:underline";

    const checkScroll = () => {
        console.log("scrolling")
        console.log(window.scrollY)
        if (window.scrollY > 0) {
            document.getElementById('navbar').classList.add('scale-90', 'shadow-md');
        }
        else {
            document.getElementById('navbar').classList.remove('scale-90', 'shadow-md');
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', checkScroll);
    }, []);


    return (
        <PrimeReactProvider value={{ ripple: true }}>
            <StompContextProvider>
                <div className="w-screen h-screen flex flex-col">
                    <nav
                        id="navbar" className="bg-zinc-100 h-14 flex sticky top-0 z-50 flex-row justify-between items-center flex-wrap flex-shrink shadow"
                    >
                        <Link href={"/"} className=" pt-3 ml-6 h-full flex flex-row justify-center items-center flex-wrap">
                            <Image loading="lazy" className="hidden md:block mr-5 shrink animate-bounce delay-700" src={logoIcon.src} alt="logo" width={35} height={35} />
                            <Image loading='lazy' className="shrink hidden md:block mb-3" src={logoText.src} alt="logo-text" width={170} height={75} />
                        </Link >
                        <div className="text-xl text-center flex flex-row justify-center items-center space-x-6 flex-wrap">
                            <Link href={pagePaths.inbox} className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Inbox</Link>
                            <Link href="#blog" className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Blog</Link>
                            <Link href="#forum" className={navBarLinksCSS} style={{ textDecorationColor: 'pink', textDecorationThickness: '2.5px' }}>Forum</Link>
                        </div>
                        <div className="flex flex-shrink flex-row justify-center items-center mr-28">
                            <Popover>
                                <PopoverTrigger >
                                    <Avatar avatarImgScr={testingAvatar} size={44} className={"border-2 shadow-md"} />
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <div className="w-32 rounded-md py-2 flex flex-col justify-between items-center">
                                        <Link className="text-center p-1 m-1 text-black hover:scale-105 transition ease-in w-full" href="/profile">Profile</Link>
                                        <Link className="text-center p-1 m-1 font-semibold hover:scale-105 transition ease-in w-5/6 rounded bg-red-300 text-black" href={pagePaths.login}>Logout</Link>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </nav>
                    {/* <SocketInitializer /> */}
                    {children}
                </div>
            </StompContextProvider>
        </PrimeReactProvider>
    )
}


