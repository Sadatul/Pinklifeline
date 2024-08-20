'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { FileUploader } from "react-drag-drop-files";
import { Button } from "@/components/ui/button";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import firebase_app from "@/utils/firebaseConfig";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { set } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { capitalizeFirstLetter, forumQuestionsUrl, pagePaths } from "@/utils/constants";
import axiosInstance from "@/utils/axiosInstance";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import { LinkIcon, Trash2 } from "lucide-react";
import CreatableSelect from 'react-select/creatable'
import makeAnimated from 'react-select/animated';
import Loading from "@/app/components/loading";
import { Vault } from "@/app/components/firebaseVault";

export default function AskQuestionPage() {
    const [selectedTags, setSelectedTags] = useState([]);
    const [options, setOptions] = useState([]);
    const [isMounted, setIsMounted] = useState(false)
    const animatedComponents = makeAnimated();

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return <Loading chose="hand" />

    return (
        <div className="flex flex-col w-full h-full items-center gap-3 p-3 overflow-x-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]  from-gray-200 via-gray-200 to-gray-300 relative">
            <h1 className="text-2xl font-bold">Ask Question</h1>
            <div className="flex flex-row w-10/12 gap-8 text-lg py-3 px-2 rounded bg-purple-100 flex-wrap">
                <div className="flex flex-row gap-3 flex-1">
                    <span className="">Question Title</span>
                    <div className="flex flex-col gap-1">
                        <input id="question-title" type="text" autoComplete="off" className="border text-base border-gray-500 px-2 py-1 rounded shadow-inner w-96" onChange={(e) => {
                            const title = e.target.value
                            document.getElementById("title-characters").textContent = `Max characters 255(${title.length}/255)`
                        }} />
                        <span id="title-characters" className="text-sm text-gray-500">{`Max characters 255(0/255)`}</span>
                        <span id="error-msg-title" className="text-sm text-red-500 hidden">Thsi field is required</span>
                    </div>
                </div>
                <div className="flex flex-row gap-3 flex-1">
                    <span className="">Add Tags</span>
                    <div>
                        <CreatableSelect
                            isMulti={true}
                            options={options}
                            onChange={(value) => {
                                setSelectedTags(value)
                            }}
                            components={animatedComponents}
                            closeMenuOnSelect={false}
                            onCreateOption={(keyword) => {
                                if (options.find((option) => option.value === keyword)) return
                                setOptions([...options, { value: keyword, label: keyword }])
                                setSelectedTags([...selectedTags, { value: keyword, label: keyword }])
                            }}
                            value={selectedTags}
                            className="min-w-64 -translate-y-1"
                        />
                        <span id="error-msg-tags" className="text-sm text-red-500 hidden">Thsi field is required</span>
                    </div>
                </div>
                <Vault />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
                <textarea id="question-content" className="w-10/12 h-96 border border-gray-500 rounded-lg p-2 shadow-inner" />
                <span id="error-msg-content" className="text-sm text-red-500 hidden">Thsi field is required</span>
            </div>
            <span className="text-base text-gray-900">Use the vault to upload any file and refer in text with url.</span>
            <div className="w-8/12 flex flex-row justify-between h-fit items-center gap-3">
                <Link href={pagePaths.forumPage} target='_self' className="p-2 hover:scale-95 bg-orange-200 rounded-lg border border-black shadow-inner" >
                    Cancel
                </Link>
                <Button className="hover:scale-95" onClick={() => {
                    const title = document.getElementById("question-title").value
                    const tags = selectedTags.map((tag) => tag.value)
                    const content = document.getElementById("question-content").value
                    if (!title) {
                        document.getElementById("error-msg-title").classList.remove("hidden")
                    }
                    else {
                        document.getElementById("error-msg-title").classList.add("hidden")
                    }
                    if (!tags.length) {
                        document.getElementById("error-msg-tags").classList.remove("hidden")
                    }
                    else {
                        document.getElementById("error-msg-tags").classList.add("hidden")
                    }
                    if (!content) {
                        document.getElementById("error-msg-content").classList.remove("hidden")
                    }
                    else {
                        document.getElementById("error-msg-content").classList.add("hidden")
                    }
                    if (!title || !tags.length || !content) return
                    //remove duplicates ignoring case
                    const uniqueTags = [...new Set(tags.map((tag) => tag.toLowerCase()))]
                    const data = {
                        title: title,
                        body: content,
                        tags: uniqueTags.map(tag => capitalizeFirstLetter(tag.toLowerCase())),
                    }
                    console.log(data)
                    axiosInstance.post(forumQuestionsUrl, data).then((res) => {
                        toast.success("Question posted successfully")
                        window.location.href = pagePaths.forumPage
                    }).catch((err) => {
                        toast.error("Error posting question", {
                            description: "Please try again later",
                        })
                        console.log(err)
                    })
                }}>
                    Ask Question
                </Button>

            </div>
        </div>
    )
}

