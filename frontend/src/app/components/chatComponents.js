'use client'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getChats, getMessages } from "@/utils/dataRepository";
import Avatar from "./avatar";
import { getChatsUrl, getMessagesUrl, messageSendUrl, pagePaths, testingAvatar } from "@/utils/constants";
import ScrollableContainer from "./StyledScrollbar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Ripple } from "primereact/ripple";
import { ArrowLeft, ArrowRight, EllipsisVertical, ImageUp, Paperclip, Send } from 'lucide-react';
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
import { SmileIcon } from "lucide-react";
import Picker from '@emoji-mart/react';
import data from "@emoji-mart/data";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStompContext } from "../context/stompContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";



export function ChatLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter();
    const params = useParams();
    const [openedChat, setOpenedChat] = useState(null);
    const stompContext = useStompContext();

    useEffect(() => {
        const id = localStorage.getItem('userId')
        const token = localStorage.getItem('token')
        if (!token || !id) {
            console.error('Token not found')
            toast.error('Token not found', {
                description: 'You need to login to continue'
            })
            router.push('/login')
        }
        const headers = { 'Authorization': `Bearer ${token}` }
        axios.get(getChatsUrl(id), {
            headers: headers
        }).then((response) => {
            console.log("Chats fetched")
            stompContext.chatManager.current.addChats(response.data)
            stompContext.setChats(response.data)
        }).catch((error) => {
            console.error(error)
        })
    }, [])

    useEffect(() => {
        if (openedChat && stompContext.chats.length > 0) {
            for (const chat of stompContext.chats) {
                if (chat.roomId === openedChat.roomId) {
                    const id = localStorage.getItem('userId')
                    const token = localStorage.getItem('token')
                    if (!token || !id) {
                        console.error('Token not found')
                        toast.error('Token not found', {
                            description: 'You need to login to continue'
                        })
                        router.push('/login')
                    }
                    const headers = { 'Authorization': `Bearer ${token}` }
                    axios.get(getMessagesUrl(openedChat.roomId), {
                        headers: headers
                    }).then((response) => {
                        stompContext.setMessages(response.data)
                    }).catch((error) => {
                        console.error(error)
                    })
                    break;
                }
            }
        }
    }, [stompContext.chats, openedChat])

    return (
        <ResizablePanelGroup direction="horizontal"
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    router.push(pagePaths.inbox)
                }
            }}
        >
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
                <ChatSideBar isCollapsed={isCollapsed} chats={stompContext.chats} openedChat={openedChat} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
                defaultSize={70}
                minSize={70}
                className="flex-grow overflow-auto"
            >
                {stompContext.messages.length > 0 ? (
                    <ChatWindow stompContext={stompContext} router={router} openedChat={openedChat} />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-zinc-100 via-slate-200 to-gray-300">
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

export function ChatSideBar({ isCollapsed = false, chats, openedChat }) {
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
                        <Link href={openedChat?.roomId === chat.roomId ? pagePaths.inbox : pagePaths.inboxChat(`chat?roomId=${chat.roomId}&userId=${chat.userId}&name=${chat.name}&profilePicture=${chat.profilePicture}`)}
                            className="flex flex-row items-center justify-between rounded-md px-5 py-2 w-full p-ripple relative overflow-hidden group"
                            onClick={() => {
                                console.log("Chat clicked")
                                console.log(JSON.stringify(chat))
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
                        </Link>
                        <Separator className="bg-gray-300" />
                    </React.Fragment>
                ))}
            </ScrollArea>
        </>
    )
}

export function ChatWindow({ openedChat, router, stompContext }) {
    const scrollAreaRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageFileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [stompContext.messages, openedChat]);



    const handleImageFileUploadClick = () => {
        if (imageFileInputRef.current) {
            imageFileInputRef.current.click();
        }
    };

    const handleImageFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("File uploaded:", file);
            setImageFile(file);
        }
    };

    const sendMesssage = (message) => {
        console.log('Sending message')
        console.log(message)
        stompContext.stompClientRef.current.publish({
                destination: messageSendUrl,
                body: JSON.stringify(message),
            }
        );
        const newChatMessage = {
            sender: message.sender,
            message: message.message,
            timestamp: message.timestamp,
            type: message.type
        }
        stompContext.setMessages([...stompContext.messages, newChatMessage]);
        if (stompContext.chatManager.current.exists(message.receiverId)) {
            stompContext.chatManager.current.moveToHead(message.receiverId)
            stompContext.setChats([...stompContext.chatManager.current.getChatsInOrder()])
        }
        document.getElementById("message-input").value = "";
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }

    const handleMessageInput = (event) => {
        event.preventDefault();
        const message = document.getElementById("message-input")?.value;
        console.log("Message sent:", message);
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('User not found')
            toast.error('User not found', {
                description: 'You need to login to continue'
            })
            router.push('/login')
        }
        if (message !== '') {
            const messageObject = {
                sender: userId,
                receiverId: openedChat.userId,
                message: message,
                timestamp: new Date().toISOString(),
                type: "TEXT",
            }
            sendMesssage(messageObject);
        }
    }

    return (
        <>
            <div className="flex flex-col h-full w-full"
                onKeyDown={(e) => {
                    if (e.key === "Escape") {
                        router.push(pagePaths.inbox)
                    }
                }}
            >
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
                    <div className="flex flex-col-reverse"
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                router.push(pagePaths.inbox)
                            }
                        }}
                    >
                        {stompContext.messages.toReversed().map((message, index) => (
                            <div key={index} className={cn('flex flex-col my-4', message.sender === userId ? "items-end" : "items-start")}>
                                <div className={cn('flex flex-row', message.sender === userId ? "justify-end" : "justify-start")}>
                                    <div className={cn('flex flex-row items-center', message.sender === userId ? "flex-row-reverse" : "flex-row")}>
                                        <Avatar avatarImgScr={testingAvatar} size={32} />
                                        <div className={cn('flex flex-col px-4 py-1 rounded-3xl mx-2', message.sender === userId ? "bg-gradient-to-br from-pink-600 via-pink-500 to-pink-400 text-white" : "bg-gradient-to-tr from-gray-200 via-zinc-200 to-stone-300 text-gray-800")}>
                                            {message.type === "TEXT" && <p>{message.message}</p>}
                                            {message.type === "IMAGE" && <Image src={message.message} width={200} height={200} />}
                                        </div>
                                    </div>
                                </div>
                                <div className={cn('flex flex-row mx-5', message.sender === userId ? "justify-end" : "justify-start")}>
                                    <p className={cn('text-xs text-gray-500', message.sender === userId ? "text-right" : "text-left")}>
                                        {message.timestamp}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollableContainer>

                {/* Chat Input Section */}
                <div className="flex-none p-3 border rounded-md bg-gradient-to-br from-gray-100 via-slate-200 to-gray-100">
                    <form onSubmit={handleMessageInput} className="flex flex-row items-center space-x-2"
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                router.push(pagePaths.inbox)
                            }
                        }}
                    >
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger >
                                    <div type="button" onClick={handleImageFileUploadClick} className="p-2 rounded-md border border-gray-300">
                                        <ImageUp size={24} />
                                    </div>
                                    <input
                                        type="file"
                                        ref={imageFileInputRef}
                                        onChange={handleImageFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </TooltipTrigger>
                                <TooltipContent side={'top'}>
                                    <p>
                                        Upload Image
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className="relative flex-1">
                            <input
                                placeholder="Type your message..."
                                className="p-2 rounded-md border border-gray-300 w-full pr-10"
                                id="message-input"
                                autocomplete="off"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <Popover>
                                    <PopoverTrigger>
                                        <div type="button">
                                            <SmileIcon size={24} className="" />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full">
                                        <Picker
                                            emojiSize={18}
                                            theme="light"
                                            data={data}
                                            maxFrequentRows={1}
                                            onEmojiSelect={(emoji) => {
                                                const messageInput = document.getElementById("message-input");
                                                if (messageInput) {
                                                    messageInput.value += emoji.native;
                                                }
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <button type="submit" className="border bg-pink-600 rounded-full p-[10px] p-ripple">
                            <Send size={24} color="white" />
                            <Ripple />
                        </button>
                    </form>
                </div>
            </div >
        </>
    )
}

