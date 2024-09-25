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
import { getChatsUrl, getMessagesUrl, isValidImgSrc, messageImageUploaPath, messageSendUrl, pagePaths, testingAvatar } from "@/utils/constants";
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
import axiosInstance from "@/utils/axiosInstance"
import { format, set } from "date-fns";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import firebase_app from "@/utils/firebaseConfig";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "react-drag-drop-files";
import { useSessionContext } from "@/app/context/sessionContext";
import { debounce } from "lodash";



export function ChatLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const stompContext = useStompContext();
    const sessionContext = useSessionContext()
    const router = useRouter();

    useEffect(() => {
        console.log('Opened chat changed')
        console.log(stompContext.openedChat)
        if (stompContext.openedChat && sessionContext?.sessionData) {
            axiosInstance.get(getMessagesUrl(stompContext.openedChat.roomId)).then((response) => {
                console.log("Messages fetched")
                console.log(response.data)
                stompContext.setMessages(response.data)
            }).catch((error) => {
                console.error(error)
            })
        }
    }, [stompContext.openedChat, router, sessionContext?.sessionData])

    return (
        <ResizablePanelGroup direction="horizontal" >
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
                <ChatSideBar isCollapsed={isCollapsed} stompContext={stompContext} router={router} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
                defaultSize={76}
                minSize={76}
                className="flex-grow overflow-auto"
            >
                {stompContext.openedChat ? (
                    <ChatWindow stompContext={stompContext} router={router} />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-zinc-100 via-slate-200 to-gray-300">
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

export function ChatSideBar({ isCollapsed = false, stompContext, router }) {
    const sessionContext = useSessionContext()
    const [chats, setChats] = useState([])

    useEffect(() => {
        if (sessionContext?.sessionData) {
            const headers = { 'Authorization': `Bearer ${sessionContext?.sessionData.token}` }
            axiosInstance.get(getChatsUrl(sessionContext?.sessionData.userId)).then((response) => {
                console.log("Chats fetched")
                console.log(response.data)
                stompContext.chatManager.current.addChats(response.data)
                stompContext.setChats(response.data)
            }).catch((error) => {
                console.error(error)
            })
        }
    }, [router, sessionContext?.sessionData])

    useEffect(() => {
        setChats(stompContext.chats)
    }, [stompContext.chats])

    const handleChatsSearch = debounce((text) => {
        if (text === '') {
            setChats(stompContext.chats)
        }
        else {
            const filteredChats = stompContext.chats.filter(chat => chat.name.toLowerCase().includes(text.toLowerCase()))
            setChats(filteredChats)
        }
    }, 500)

    return (
        <>
            <div className="flex flex-col items-center p-2 justify-evenly shadow rounded-md break-normal">
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
                        <input type="search" id="default-search" className=" px-3 py-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-2xl bg-gray-50" placeholder="Search Chats" onChange={(e) => {
                            handleChatsSearch(e.target.value?.trim())
                        }} />
                    </div>
                }
            </div>
            <ScrollArea className="h-full px-4">
                <ScrollBar className="" />
                {chats?.map((chat, index) => (
                    <React.Fragment key={index}>
                        <div
                            className="flex flex-row items-center justify-between rounded-md px-5 py-2 w-full p-ripple relative overflow-hidden group cursor-pointer break-normal"
                            onClick={() => {
                                console.log("Chat clicked")
                                console.log(JSON.stringify(chat))
                                stompContext.setOpenedChat(stompContext.openedChat?.roomId === chat.roomId ? null : chat)
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
                                            <Avatar avatarImgSrc={chat.profilePicture ? chat.profilePicture : testingAvatar} size={44} />
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
                                    <Avatar avatarImgSrc={chat.profilePicture ? chat.profilePicture : testingAvatar} size={44} />
                                    <div className="flex flex-row items-center">
                                        <h1 className="text-xl font-bold text-zinc-700 font-mono flex items-center transform transition-transform duration-300 ease-in-out translate-x-5 group-hover:translate-x-0 mr-4">
                                            {chat.name}
                                        </h1>
                                        <span className="ml-4 transform transition-transform duration-500 ease-in-out opacity-0 translate-x-[-5px] group-hover:opacity-100 group-hover:translate-x-0">
                                            {(stompContext.openedChat?.roomId === chat.roomId) ? <ArrowLeft size={24} color="rgb(255,0,0,0.5)" /> : <ArrowRight color="rgb(255,20,147,0.5)" size={24} />}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                        <Separator className="bg-gray-300" />
                    </React.Fragment>
                ))}
            </ScrollArea>
        </>
    )
}

export function ChatWindow({ stompContext }) {
    const sessionContext = useSessionContext()
    const scrollAreaRef = useRef(null);
    const imageFileInputRef = useRef(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageFilePreview, setImageFilePreview] = useState(null);
    const storage = getStorage(firebase_app);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [openImageUploadDialog, setOpenImageUploadDialog] = useState(false);
    const messageDateRef = useRef(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [stompContext.messages, stompContext.openedChat]);



    const handleImageFileUploadClick = () => {
        setOpenImageUploadDialog(true);
    };

    const handleImageFileChange = (file) => {
        console.log("Image file selected");
        if (file) {
            console.log("File uploaded:", file);
            setImageFile(file);
            const preview = URL.createObjectURL(file);
            console.log("File preview:", preview);
            setImageFilePreview(preview);
        }
    };

    const sendMesssage = (message) => {
        console.log('Sending message')
        console.log(message)
        stompContext.stompClientRef.current.publish({
            destination: messageSendUrl,
            body: JSON.stringify(message),
        });
        const newChatMessage = {
            sender: String(message.sender),
            message: message.message,
            timestamp: message.timestamp,
            type: message.type
        }
        stompContext.setMessages([...stompContext.messages, newChatMessage]);
        if (stompContext.chatManager.current.exists(message.receiverId)) {
            stompContext.chatManager.current.moveToHead(message.receiverId)
            stompContext.setChats([...stompContext.chatManager.current.getChatsInOrder()])
        }
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }

    const handleMessageInput = (event) => {
        event.preventDefault();
        const message = document.getElementById("message-input")?.value;
        console.log("Message sent:", message);
        if (message !== '') {
            const messageObject = {
                sender: sessionContext?.sessionData.userId,
                receiverId: stompContext.openedChat?.userId,
                message: message,
                timestamp: new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000).toISOString(),
                type: "TEXT",
            }
            sendMesssage(messageObject);
            document.getElementById("message-input").value = "";
        }
    }

    const sendImageMessage = () => {
        if (!imageFile) return;
        const filePath = messageImageUploaPath(stompContext.openedChat?.roomId, sessionContext?.sessionData.userId, imageFile.name);
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                toast.error("Error uploading image", {
                    description: "Please try again later",
                });
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('File available at', downloadURL);
                const messageObject = {
                    sender: sessionContext?.sessionData.userId,
                    receiverId: stompContext.openedChat.userId,
                    message: downloadURL,
                    timestamp: new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000).toISOString(),
                    type: "IMAGE",
                }
                sendMesssage(messageObject);
                setImageFile(null);
                setImageFilePreview(null);
                setOpenImageUploadDialog(false);
                setUploadProgress(null);
            }
        );
    }

    return (
        <>
            <div className="flex flex-col h-full w-full" >
                {/* Chat Top Bar */}
                <div className="flex flex-row items-center p-3 justify-between shadow">
                    <div className="flex flex-row items-center ml-3 gap-3">
                        <button className="">
                            <ArrowLeft size={24} color="rgb(255,0,0,0.5)" onClick={() => {
                                stompContext.setOpenedChat(null)
                            }} />
                        </button>
                        <Avatar avatarImgSrc={stompContext.openedChat?.profilePicture} size={44} />
                        <h1 className="text-xl font-bold text-zinc-700 font-mono ">{stompContext.openedChat.name}</h1>
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
                    <div className="flex flex-col-reverse gap-6" >
                        {stompContext.messages.toReversed().map((message, index) => {
                            const addDate = (messageDateRef.current && messageDateRef.current !== message.timestamp.split('T')[0]) || (index === stompContext.messages.length - 1)
                            messageDateRef.current = message.timestamp.split('T')[0]
                            return (
                                <div key={index} className={cn('flex flex-col ', (String(message.sender) === String(sessionContext?.sessionData.userId)) ? "items-end" : "items-start")}>
                                    <div className="flex flex-row items-center justify-center w-full">
                                        {addDate && <p className="text-sm font-semibold text-gray-800">{message.timestamp.split('T')[0]}</p>}
                                    </div>
                                    <div className={cn('flex flex-row', (String(message.sender) === String(sessionContext?.sessionData.userId)) ? "justify-end" : "justify-start")}>
                                        <div className={cn('flex items-end', (String(message.sender) === String(sessionContext?.sessionData.userId)) ? "flex-row-reverse" : "flex-row")}>
                                            {(String(message.sender) === String(sessionContext?.sessionData.userId)) &&
                                                <Avatar avatarImgSrc={sessionContext?.profilePic || testingAvatar} size={32} />
                                            }
                                            {(String(message.sender) !== String(sessionContext?.sessionData.userId)) &&
                                                <Avatar avatarImgSrc={stompContext.openedChat?.profilePicture || testingAvatar} size={32} />
                                            }
                                            <TooltipProvider delayDuration={500}>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <div className={cn('flex flex-col gap-0 px-4 py-1 rounded-3xl mx-2 min-w-32 break-all text-wrap cursor-text', message.type !== "TEXT" ? " bg-transparent" : ((String(message.sender) === String(sessionContext?.sessionData.userId)) ? "bg-gradient-to-br from-pink-600 to-pink-500 text-white text-right" : "bg-gradient-to-tr from-gray-500 to-stone-400 text-white text-left"))}>
                                                            {message.type === "TEXT" && <p className="text-sm">{message.message}</p>}
                                                            {message.type === "IMAGE" && isValidImgSrc(message.message) && <Image src={message.message} width={200} height={200} alt="message-image" />}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side={(String(message.sender) === String(sessionContext?.sessionData.userId)) ? "left" : "right"} className="bg-black bg-opacity-50 text-white">
                                                        {format(new Date(message.timestamp), 'hh:mm a')}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollableContainer>

                {/* Chat Input Section */}
                <div className="flex-none p-3 border rounded-md bg-gradient-to-br from-gray-100 via-slate-200 to-gray-100">
                    <form onSubmit={handleMessageInput} className="flex flex-row items-center space-x-2" >
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger >
                                    <div type="button" onClick={handleImageFileUploadClick} className="p-2 rounded-md border border-gray-300">
                                        <ImageUp size={24} color="rgb(190, 24, 93, 1)" />
                                    </div>
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
                                autoComplete="off"
                                maxLength={255}
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
                        <button type="submit" className="border p-ripple">
                            <Send size={32} className="text-pink-700" />
                            <Ripple />
                        </button>
                    </form>
                </div>
                <AlertDialog open={openImageUploadDialog} >
                    <AlertDialogTrigger asChild>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Image preview</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="flex flex-col items-center justify-evenly w-11/12">
                                    {imageFilePreview && (
                                        <div className="flex flex-col justify-center items-center ">
                                            <Image width={200} objectFit='scale-down' height={300} src={imageFilePreview} alt="Preview" className=" rounded-lg" />
                                            {uploadProgress !== null ? <Progress variant='secondary' value={uploadProgress} className="w-[80%] my-4" /> : <></>}
                                        </div>
                                    )}
                                    <FileUploader handleChange={handleImageFileChange}
                                        multiple={false}
                                        types={["JPEG", "PNG", "JPG"]}
                                        name="file"
                                        onTypeError={() => {
                                            toast.error("Invalid file type", {
                                                description: "Only jpg or png files are allowed",
                                            })
                                        }}
                                    />
                                    <input hidden id="file"></input>
                                    {/* <FileUploader handleChange={handleFileChange} name="file" types={fileTypes} /> */}
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                                setImageFile(null)
                                setImageFilePreview(null)
                                setOpenImageUploadDialog(false)
                            }}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction asChild >
                                <button onClick={sendImageMessage} >Send</button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div >
        </>
    )
}


