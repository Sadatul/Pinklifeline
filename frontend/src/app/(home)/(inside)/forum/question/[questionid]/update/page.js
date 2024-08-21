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
import { capitalizeFirstLetter, forumQuestionByIdUrl, forumQuestionsUrl, pagePaths } from "@/utils/constants";
import axiosInstance from "@/utils/axiosInstance";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import { LinkIcon, Trash2 } from "lucide-react";
import CreatableSelect from 'react-select/creatable'
import makeAnimated from 'react-select/animated';
import Loading from "@/app/components/loading";
import { useParams } from "next/navigation";

export default function UpdateQuestionPage() {
    const [selectedTags, setSelectedTags] = useState([]);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true)
    const params = useParams()
    const [isMounted, setIsMounted] = useState(false)
    const [questionInfo, setQuestionInfo] = useState(null)
    const animatedComponents = makeAnimated();

    useEffect(() => {
        setIsMounted(true)
        setLoading(true)
        axiosInstance.get(forumQuestionByIdUrl(params.questionid)).then((res) => {
            setQuestionInfo({
                title: res.data.title,
                body: res.data.body,
                tags: res.data.tags
            })
            const tags = res.data.tags.map((tag) => {
                return { value: tag, label: tag }
            })
            setSelectedTags(tags)
            setOptions(tags)
        }).catch((err) => {
            console.log(err)
        }).finally(() => {
            setLoading(false)
        })
    }, [params.questionid])

    if (!isMounted || loading) return <Loading chose="hand" />

    return (
        <div className="flex flex-col w-full h-full items-center gap-3 p-3 overflow-x-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]  from-gray-200 via-gray-200 to-gray-300 relative">
            <h1 className="text-2xl font-bold">Ask Question</h1>
            <div className="flex flex-row w-10/12 gap-8 text-lg py-3 px-2 rounded bg-purple-100 flex-wrap">
                <div className="flex flex-row gap-3 flex-1">
                    <span className="">Question Title</span>
                    <div className="flex flex-col gap-1">
                        <input id="question-title" defaultValue={questionInfo.title} type="text" autoComplete="off" className="border text-base border-gray-500 px-2 py-1 rounded shadow-inner w-96" onChange={(e) => {
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
                <textarea id="question-content" defaultValue={questionInfo.body} className="w-10/12 h-96 border border-gray-500 rounded-lg p-2 shadow-inner" />
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
                    axiosInstance.put(forumQuestionByIdUrl(params.questionid), data).then((res) => {
                        toast.success("Question posted successfully")
                        window.location.href = pagePaths.forumPage
                    }).catch((err) => {
                        toast.error("Error posting question", {
                            description: "Please try again later",
                        })
                        console.log(err)
                    })
                }}>
                    Update Question
                </Button>

            </div>
        </div>
    )
}

function Vault() {
    const [vaultData, setVaultData] = useState([{
        type: "image/jpeg",
        url: "https://firebasestorage.googleapis.com/v0/b/javafest-87433.appspot.com/o/questionVault%2FMon%20Aug%2019%202024%2003%3A08%3A49%20GMT%2B0600%20(Bangladesh%20Standard%20Time)%2Fpacifier-96504_640.jpg?alt=media&token=0e62749e-8afe-407d-a209-279144f77c1a"
    }])
    const storage = getStorage(firebase_app)
    return (
        <Sheet >
            <SheetTrigger asChild>
                <button className="bg-gray-600 border-b-gray-900 hover:scale-95 px-3 py-1 text-xl rotate-90 rounded text-white absolute top-1/2 -right-3">
                    Open Vault
                </button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>File Vault</SheetTitle>
                    <SheetDescription>
                        Upload you images and files and refer in you question with link
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col mt-5">
                    <FileUploader handleChange={(file) => {
                        if (!file) return;
                        const type = file.type
                        console.log(type)
                        const filePath = `questionVault/${new Date().toString()}/${file.name}`;
                        const storageRef = ref(storage, filePath);
                        const uploadTask = uploadBytesResumable(storageRef, file);
                        uploadTask.on(
                            'state_changed',
                            (snapshot) => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            },
                            (error) => {
                                toast.error("Error uploading image", {
                                    description: "Please try again later",
                                });
                            },
                            async () => {
                                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                setVaultData([...vaultData, { type: type, url: downloadURL }])
                                toast.success("Image uploaded successfully")
                            }
                        );
                    }}
                        multiple={false}
                        types={['JPEG', 'PNG', 'JPG', 'PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX']}
                        name="file"
                        onTypeError={() => {
                            toast.error("Invalid file type", {
                                description: "Only jpg or png files are allowed",
                            })
                        }}
                    />
                </div>
                <ScrollableContainer className="overflow-x-auto h-[500px] mt-5 mb-3 overflow-y-auto">
                    {vaultData.map((data, index) => {
                        return (
                            <div key={index} className="flex flex-col w-full gap-3 p-2 bg-gray-100 rounded-lg">
                                <div className="flex flex-row items-center gap-3 p-1 justify-between w-full">
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="text-lg font-semibold flex items-center gap-2 relative w-full">
                                            {data.type}
                                            <div className="flex flex-row flex-1 gap-2 justify-between">
                                                <button id="copy-button" className="rounded-full p-2 text-black bg-pink-300 scale-75" onClick={() => {
                                                    navigator.clipboard.writeText(data.url)
                                                    if (!document.getElementById("copy-button")) return
                                                    document.getElementById("copy-button").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`
                                                    document.getElementById("copy-button").classList.remove("bg-pink-300")
                                                    document.getElementById("copy-button").classList.add("bg-gray-300")
                                                    if (!document.getElementById("copy-response-message")) return
                                                    document.getElementById("copy-response-message").classList.remove("hidden")
                                                    const timer = setTimeout(() => {
                                                        if (!document.getElementById("copy-button")) return
                                                        document.getElementById("copy-button").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
                                                        document.getElementById("copy-button").classList.remove("bg-gray-300")
                                                        document.getElementById("copy-button").classList.add("bg-pink-300")
                                                        if (!document.getElementById("copy-response-message")) return
                                                        document.getElementById("copy-response-message").classList.add("hidden")
                                                    }, 5000)
                                                    return () => clearTimeout(timer)
                                                }}>
                                                    <LinkIcon size={20} />
                                                </button>
                                                <span id="copy-response-message" className="p-1 absolute w-28 text-center left-40 bg-green-200 text-gray-500 text-sm rounded-md hidden">Link Copied</span>
                                                <button className="hover:scale-90 scale-95 bg-red-500 text-white p-1 rounded-full px-2 w-fit" onClick={() => {
                                                    // Create a reference to the file to delete
                                                    const fileRef = ref(storage, data.url);
                                                    // Delete the file
                                                    deleteObject(fileRef).then((res) => {
                                                        const newData = vaultData.filter((_, i) => i !== index)
                                                        setVaultData(newData)
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })
                                                }}>
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {data.type.includes("image") && <Image sizes="100vw" width={0} height={0} style={{ width: '100%', height: 'auto' }} src={data.url} alt="Vault Image" />}
                            </div>
                        )
                    })}
                </ScrollableContainer>
            </SheetContent>
        </Sheet>
    )
}