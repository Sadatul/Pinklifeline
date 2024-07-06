import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getChats } from "@/utils/dataRepository";
import Avatar from "./avatar";
import { testingAvatar } from "@/utils/constants";
import ScrollableContainer from "./StyledScrollbar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Ripple } from "primereact/ripple";
import { ArrowLeft, ArrowRight, EllipsisVertical } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function ChatLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const chats = getChats()
    const [openedChat, setOpenedChat] = useState(null);

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
                defaultSize={24}
                collapsedSize={8}
                maxSize={24}
                collapsible={true}
                minSize={16}
                // maxSize={24}
                onCollapse={() => {
                    setIsCollapsed(true);
                }}
                onExpand={() => {
                    setIsCollapsed(false);
                }}
                className={cn(
                    isCollapsed && "min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out", "flex-grow overflow-auto"
                )}
            >
                <ChatSideBar isCollapsed={isCollapsed} chats={chats} openedChat={openedChat} setOpenedChat={setOpenedChat} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
                defaultSize={70}
                minSize={70}
                className="flex-grow overflow-auto"
            >
                <ChatWindow openedChat={openedChat} />
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

export function ChatSideBar({ isCollapsed = false, chats, openedChat, setOpenedChat }) {
    return (
        <>
            <div className="flex flex-row items-center p-2 justify-evenly shadow rounded-md">
                <div className="flex flex-row items-center">
                    <h1 className="text-3xl font-bold text-zinc-700 font-mono">Chats</h1>
                </div>
                {!isCollapsed &&
                    <div className="relative m-2">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="search" id="default-search" className=" px-3 py-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-2xl bg-gray-50" placeholder="Search Chats" />
                    </div>
                }
            </div>
            <ScrollArea className="h-full px-4">
                <ScrollBar className="" />
                {chats?.map((chat, index) => (
                    <React.Fragment key={index}>
                        <button
                            className="flex flex-row items-center justify-between rounded-md px-5 py-2 w-full p-ripple relative overflow-hidden group"
                            onClick={() => {
                                setOpenedChat((openedChat?.roomId === chat.roomId) ? null : chat);
                            }}
                            onKeyDown={(e) => {
                                if(e.key === "Escape")
                                {
                                    setOpenedChat(null);
                                }
                            }}
                        >
                            <Ripple
                                pt={{
                                    root: { style: { background: 'rgba(156, 39, 176, 0.3)' } }
                                }}
                            />
                            {isCollapsed ? (
                                <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger >
                                            <Avatar avatarImgScr={testingAvatar} size={44} />
                                        </TooltipTrigger>
                                        <TooltipContent side={'right'}>
                                            <p>
                                                {chat.name}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <>
                                    <Avatar avatarImgScr={testingAvatar} size={44} />
                                    <div className="flex flex-row items-center">
                                        <h1 className="text-xl font-bold text-zinc-700 font-mono flex items-center transform transition-transform duration-300 ease-in-out translate-x-5 group-hover:translate-x-0 mr-4">
                                            {chat.name}
                                        </h1>
                                        <span className="ml-4 transform transition-transform duration-500 ease-in-out opacity-0 translate-x-[-5px] group-hover:opacity-100 group-hover:translate-x-0">
                                            {(openedChat?.roomId === chat.roomId) ? <ArrowLeft size={24} color="rgb(255,0,0,0.5)" /> : <ArrowRight color="rgb(255,20,147,0.5)" size={24} />}
                                        </span>
                                    </div>
                                </>
                            )}
                        </button>
                        <Separator className="bg-gray-300" />
                    </React.Fragment>
                ))}
            </ScrollArea>
        </>
    )
}

export function ChatWindow({ messages = null, userId = null, openedChat }) {
    const scrollAreaRef = useRef(null);
    const [chatMessages, setChatMessages] = useState(["Hello", "Hi", "How are you?", "I am fine", "What about you?", "I am also fine", "Good to hear that", "Yes, it is good", "Bye", "Goodbye", "Hello", "Hi", "How are you?", "I am fine", "What about you?", "I am also fine", "Good to hear that", "Yes, it is good", "Bye", "Goodbye", "Hello", "Hi", "How are you?", "I am fine", "What about you?", "I am also fine", "Good to hear that", "Yes, it is good", "Bye", "Goodbye", "This is the bottom of the chat"]);

    useEffect(() => {
        // Scroll to bottom of the scroll area
        if (scrollAreaRef.current) {
            console.log("scrolling to bottom");
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
            console.log(scrollAreaRef.current.scrollHeight); //I'm getting 537 here
            console.log(scrollAreaRef.current.scrollTop); //I'm getting 0 here
        }
    }, [chatMessages, openedChat]);


    if (!openedChat) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-zinc-100 via-slate-200 to-gray-300">
            </div>
        )
    }
    else {
        return (
            <>
                <div className="flex flex-col h-full w-full">
                    {/* Chat Top Bar */}
                    <div className="flex flex-row items-center p-3 justify-between shadow">
                        <div className="flex flex-row items-center ml-3">
                            <Avatar avatarImgScr={testingAvatar} size={44} />
                            <h1 className="text-3xl font-bold text-zinc-700 font-mono ml-5">{openedChat.name}</h1>
                        </div>
                        <div className="flex flex-row items-center">
                            <Popover>
                                <PopoverTrigger >
                                    <div type="button" className=" rounded-full p-2 mr-5 p-ripple">
                                        <EllipsisVertical size={28} />
                                        <Ripple
                                            pt={{
                                                root: { style: { background: 'rgba(156, 39, 176, 0.3)' } }
                                            }}
                                        />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 mr-5">
                                    <div className=" rounded-md py-3 px-5 flex flex-col justify-between items-start divide-y-2">
                                        <button className="m-1 p-1">Archive</button>
                                        <button className="m-1 p-1">Mute</button>
                                        <button className="m-1 p-1">Block</button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Scrollable Chat Area */}
                    <ScrollableContainer id="chat-scroll" className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
                        {chatMessages.map((message, index) => (
                            <div key={index} className="mb-4">
                                <p className="text-sm">{message}</p>
                            </div>
                        ))}
                    </ScrollableContainer>

                    {/* Chat Input Section */}
                    <div className="flex-none p-3 bg-gray-200">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                className="w-full p-2 rounded-md border border-gray-300"
                            />
                            {/* Add emoji picker and other elements here */}
                            <button onClick={()=>{
                                console.log("scrolling to top")
                                console.log(document.getElementById('chat-scroll'))
                                console.log(document.getElementById('chat-scroll'))
                                // if(document.getElementById('chat-scroll').scrollTop === 0){
                                //     document.getElementById('chat-scroll').scrollTop = document.getElementById('chat-scroll').scrollHeight
                                // }
                                // else{
                                //     document.getElementById('chat-scroll').scrollTop = 0
                                // }
                            }}> top/bottom</button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
