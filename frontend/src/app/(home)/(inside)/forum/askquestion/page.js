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
import { ArrowLeft, LinkIcon, Trash2 } from "lucide-react";
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
        <div className="flex flex-col w-full h-full items-center gap-3 p-3 overflow-x-hidden bg-stone-100 relative">
            <div className="flex flex-row items-center gap-2 w-full px-10">
                <Link href={pagePaths.forumPage} className="hover:scale-95 rounded-full border border-gray-300 bg-white p-[6px]">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">Ask Question</h1>
            </div>
            <div className="flex flex-row w-10/12 justify-center gap-8 text-lg py-3 px-2 rounded flex-wrap">
                <div className="flex flex-row gap-3">
                    <div className="flex flex-col gap-1">
                        <input id="question-title" type="text" autoComplete="off" placeholder="Question Title" className="text-base border border-gray-300 focus:outline-gray-400 px-3 rounded-2xl shadow-inner w-96 h-[42px]" onChange={(e) => {
                            const title = e.target.value
                            document.getElementById("title-characters").textContent = `Max characters 255(${title.length}/255)`
                        }} />
                        <span id="title-characters" className="text-sm text-gray-500">{`Max characters 255(0/255)`}</span>
                        <span id="error-msg-title" className="text-sm text-red-500 hidden">Thsi field is required</span>
                    </div>
                </div>
                <div className="flex flex-row gap-3">
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
                                setOptions([...options, { value: capitalizeFirstLetter(keyword.trim()), label: capitalizeFirstLetter(keyword.trim()) }])
                                setSelectedTags([...selectedTags, { value: capitalizeFirstLetter(keyword.trim()), label: capitalizeFirstLetter(keyword.trim()) }])
                            }}
                            value={selectedTags}
                            className="w-96 rounded-2xl"
                            placeholder="Add Tags to your question"
                        />
                        <span id="error-msg-tags" className="text-sm text-red-500 hidden">Thsi field is required</span>
                    </div>
                </div>
                <Vault />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
                <textarea id="question-content" placeholder="Description..." className="w-10/12 h-96 border border-gray-500 rounded-2xl p-3 shadow-inner" />
                <span id="error-msg-content" className="text-sm text-red-500 hidden">Thsi field is required</span>
            </div>
            <span className="text-base text-gray-900">Use the vault to upload any file and refer in text with url.</span>
            <div className="w-10/12 flex flex-row justify-end h-fit items-center gap-3">
                <Button className="hover:scale-95 rounded-3xl" onClick={() => {
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
                    const uniqueTags = [...new Set(tags.map((tag) => tag.toLowerCase().trim()))]
                    const data = {
                        title: title?.trim(),
                        body: content?.trim(),
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

