'use client'

import { useEffect, useMemo, useRef, useState } from "react";
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
} from "@/components/ui/alert-dialog"
import { FileUploader } from "react-drag-drop-files";
import { Button } from "@/components/ui/button";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import firebase_app from "@/utils/firebaseConfig";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { set } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { blogsUrl, pagePaths, roles } from "@/utils/constants";
import axiosInstance from "@/utils/axiosInstance";
import { Vault } from "@/app/components/firebaseVault";

import dynamic from "next/dynamic";
import { useSessionContext } from "@/app/context/sessionContext";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

function AddBlogPage2() {
    const sessionContext = useSessionContext()
    const config = useMemo(() => ({
        readonly: false,
        height: "480px",
        width: "100%",
        placeholder: "Type your blog content here...",
        spellcheck: true,
        useNativeTooltip: true,
    }), []);
    const [content, setContent] = useState("");
    const [charCount, setCharCount] = useState(0);

    const handleContentChange = (newContent) => {
        setContent(newContent);

        // Create a temporary element to extract text without HTML tags
        const tempElement = document.createElement("div");
        tempElement.innerHTML = newContent;
        const text = tempElement.innerText || tempElement.textContent;

        // Remove whitespaces and newlines using a regular expression
        const strippedText = text.replace(/\s+/g, "");

        setCharCount(strippedText.length); // Update character count
    };

    useEffect(() => {
        if (sessionContext?.sessionData) {
            if (!sessionContext?.sessionData?.userId || sessionContext?.sessionData?.role !== roles.doctor) {
                // window.location.href = pagePaths.blogsPage
            }
        }
    }, [sessionContext?.sessionData]);

    return (
        <div className="flex flex-col w-full h-full items-center gap-2 px-3 py-1 overflow-x-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]  from-gray-50 via-gray-50 to-gray-100 relative">
            <div className="absolute top-3 right-6 w-fit h-fit flex items-center gap-3 z-20">
                <Link href={pagePaths.blogsPage} target='_self' className="p-2 hover:scale-95 bg-gray-200 rounded-lg border border-black shadow-inner" >
                    Cancel
                </Link>
                <Button className="hover:scale-95" onClick={() => {
                    if (charCount === 0) {
                        toast.error("Blog content cannot be empty")
                        return
                    }
                    const title = document.getElementById("blog-title")?.value
                    if (title.length === 0) {
                        document.getElementById("error-title-msg").classList.remove("hidden")
                        return
                    }
                    else {
                        document.getElementById("error-title-msg").classList.add("hidden")
                    }
                    const coverText = document.getElementById("blog-cover-text")?.value
                    const coverImageLink = document.getElementById("blog-cover-image")?.value
                    const blogContent = `<covertext>${coverText}</covertext><coverimage>${coverImageLink}</coverimage><content>${content}</content>`
                    console.log(blogContent)
                    axiosInstance.post(blogsUrl, {
                        title: title,
                        content: blogContent,
                    }).then((res) => {
                        toast.success("Blog posted successfully")
                        window.location.href = pagePaths.blogsPage
                    }).catch((err) => {
                        console.log(err)
                    })
                }}>
                    Post
                </Button>

            </div>
            <h1 className="text-2xl font-bold">Add Blog</h1>
            <div className="flex flex-row w-10/12 gap-8 text-lg py-2 px-5 rounded  items-center justify-between scale-y-90 flex-wrap bg-purple-200">
                <div className="flex flex-col items-start gap-1 flex-wrap">
                    <input id="blog-title" type="text" placeholder="Title" className="border text-base border-gray-200 focus:outline-gray-400 px-2 py-1 rounded shadow-inner w-72" />
                    <span id="error-title-msg" className="text-sm text-red-500 hidden">Title cannot be empty</span>
                </div>
                <div className="flex flex-col items-start gap-1 flex-wrap">
                    {"Add cover text (optional)"}
                    <div className="flex flex-col gap-1 translate-y-3">
                        <textarea maxLength={200} id="blog-cover-text" className="border w-80 text-sm border-gray-500 p-2 shadow-inner rounded"
                            onChange={(e) => {
                                if (e.target?.value.length === 0) {
                                    document.getElementById("cover-text-characters").innerText = `Max 200 characters`
                                    return
                                }
                                document.getElementById("cover-text-characters").innerText = `Max 200 characters(${e.target?.value.length}/200)`
                            }}
                        />
                        <span id="cover-text-characters" className="text-sm text-gray-500 mb-1">Max 200 characters</span>
                    </div>
                </div>
                <div className="flex flex-col items-start gap-1">
                    {"Cover Image Url (optional)"}
                    <input id="blog-cover-image" type="text" className="border text-base border-gray-500 px-2 py-1 rounded shadow-inner w-72" />
                </div>
            </div>
            <div className="flex flex-col w-full flex-1">
                <JoditEditor
                    config={config}
                    onBlur={(newContent) => { handleContentChange(newContent) }}
                    tabIndex={-1}
                    value={content}
                    className="w-full"
                />
            </div>
            <Vault />
        </div>
    )
}

export default function AddBlogPage() {
    const [isMounted, setIsMounted] = useState(false);
    const sessionContext = useSessionContext()
    const config = useMemo(() => ({
        readonly: false,
        height: "650px",
        width: "100%",
        placeholder: "Type your blog content here...",
        spellcheck: true,
        useNativeTooltip: true,
    }), []);
    const [content, setContent] = useState("");
    const [charCount, setCharCount] = useState(0);

    const handleContentChange = (newContent) => {
        setContent(newContent);

        // Create a temporary element to extract text without HTML tags
        const tempElement = document.createElement("div");
        tempElement.innerHTML = newContent;
        const text = tempElement.innerText || tempElement.textContent;

        // Remove whitespaces and newlines using a regular expression
        const strippedText = text.replace(/\s+/g, "");

        setCharCount(strippedText.length); // Update character count
    };

    useEffect(() => {
        if (sessionContext?.sessionData) {
            if (sessionContext?.sessionData?.role !== roles.doctor) {
                window.location.href = pagePaths.blogsPage
            }
            else {
                setIsMounted(true)
            }
        }
    }, [sessionContext?.sessionData]);
    
    if (!isMounted) return null

    return (
        <div className="flex flex-row w-full h-full bg-slate-100 overflow-hidden">
            <div className="w-1/4 h-full flex flex-col items-center p-3 overflow-hidden">
                <div className="gap-4 flex flex-col w-full flex-1 items-center relative">
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex flex-row items-center gap-2 w-full">
                            <Link href={pagePaths.blogsPage} target='_self' className="p-[6px] hover:scale-95 rounded-full border border-gray-300 bg-white" >
                                <ArrowLeft />
                            </Link>
                            <h1 className="text-2xl font-semibold">
                                Add Blog
                            </h1>
                        </div>
                        <Separator />
                    </div>
                    <div className="flex flex-col flex-1 gap-4 w-full items-center pt-12 drop-shadow">
                        <div className="flex flex-col items-start gap-1 flex-wrap w-full">
                            <input autoComplete="off" id="blog-title" type="text" placeholder="Title" className="border text-lg border-gray-300 focus:outline-gray-400 px-2 py-1 rounded-xl shadow-inner w-full" />
                            <span id="error-title-msg" className="text-sm text-red-500 hidden">Title cannot be empty</span>
                        </div>
                        <div className="flex flex-col items-start gap-1 flex-wrap w-full">
                            <div className="flex flex-col w-full items-end">
                                <textarea maxLength={200} id="blog-cover-text" placeholder="Add cover text. (Optional)" className="border w-full text-base border-gray-300 focus:outline-gray-400 p-2 shadow-inner rounded-xl"
                                    onChange={(e) => {
                                        if (e.target?.value.length === 0) {
                                            document.getElementById("cover-text-characters").innerText = `Max 200 characters`
                                            return
                                        }
                                        document.getElementById("cover-text-characters").innerText = `Max 200 characters(${e.target?.value.length}/200)`
                                    }}
                                    rows={8}
                                />
                                <span id="cover-text-characters" className="text-sm text-gray-500 mb-1">Max 200 characters</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-start gap-1 w-full">
                            <input id="blog-cover-image" type="text" placeholder="Cover Image(Optional)" className="border text-base border-gray-300 focus:outline-gray-400 px-2 py-1 rounded-xl shadow-inner w-full" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-3 justify-evenly w-full p-3 h-16">
                    <Vault className=" static rotate-0 rounded-xl bg-gray-300 text-gray-800 shadow-inner text-sm h-full font-[550]" side="left" />
                    <Button size='sm' className="hover:scale-95 rounded-2xl h-full" onClick={() => {
                        if (charCount === 0) {
                            toast.error("Blog content cannot be empty")
                            return
                        }
                        const title = document.getElementById("blog-title")?.value
                        if (title.length === 0) {
                            document.getElementById("error-title-msg").classList.remove("hidden")
                            return
                        }
                        else {
                            document.getElementById("error-title-msg").classList.add("hidden")
                        }
                        const coverText = document.getElementById("blog-cover-text")?.value
                        const coverImageLink = document.getElementById("blog-cover-image")?.value
                        const blogContent = `<covertext>${coverText}</covertext><coverimage>${coverImageLink}</coverimage><content>${content}</content>`
                        console.log(blogContent)
                        axiosInstance.post(blogsUrl, {
                            title: title,
                            content: blogContent,
                        }).then((res) => {
                            toast.success("Blog posted successfully")
                            window.location.href = pagePaths.blogsPage
                        }).catch((err) => {
                            console.log(err)
                        })
                    }}>
                        Post
                    </Button>
                </div>
            </div>
            <div className="flex flex-col w-full h-full flex-1 drop-shadow-md bg-white p-3 rounded-tl-lg overflow-hidden">
                <JoditEditor
                    config={config}
                    onBlur={(newContent) => { handleContentChange(newContent) }}
                    tabIndex={-1}
                    value={content}
                    className="w-full h-full"
                />
            </div>
        </div>
    )
}