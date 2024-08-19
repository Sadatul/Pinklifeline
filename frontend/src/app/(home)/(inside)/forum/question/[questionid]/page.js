'use client';

import Avatar from "@/app/components/avatar";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import axiosInstance from "@/utils/axiosInstance";
import { avatarAang, displayDate, forumAnswerVote, forumQuestionvoteUrl, pagePaths, radicalGradient, voteStates, voteTypes } from "@/utils/constants";
import firebase_app from "@/utils/firebaseConfig";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { ArrowRight, CalendarClockIcon, CornerDownRight, CornerLeftUp, Filter, LinkIcon, MessageCircle, Send, SendHorizonal, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { createRef, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { toast } from "sonner";

export default function QuestionThreadPage() {
    const params = useParams();
    const [relatedQuestions, setRelatedQuestions] = useState([{
        title: "Istanbul Complex Treat Istanbul Complex Treatmen tIstanbul Complex Treatment",
        id: 4,
    }, {
        title: "Istanbul Complex Treatment",
        id: 4,
    }]);

    return (
        <ScrollableContainer className={cn("flex flex-col w-full h-full p-5 overflow-x-hidden", radicalGradient, "from-gray-200 to-gray-100")}>
            <div className="flex flex-row w-full gap-2 h-full relative">
                <div className="flex flex-col flex-1 items-end">
                    <div className="flex flex-col w-11/12 rounded p-1 gap-2 mt-2">
                        <QuestionInfoSection />
                    </div>
                    <div className="flex flex-col w-11/12 rounded p-1 gap-2 mt-2 px-6">
                        <AnswerSection />
                    </div>
                </div>
                <Separator orientation="vertical" className="h-full bg-gray-500 w-[1.5px]" />
                <div className="flex flex-col w-1/5 py-3 h-full">
                    <div className="flex flex-col w-full bg-white rounded p-2 gap-2 h-full">
                        <h2 className="text-xl font-semibold">
                            Related Questions
                        </h2>
                        <Separator className="w-full bg-gray-500 h-[1.5px] mx-auto" />
                        <div className="flex flex-col w-full gap-2 mt-4">
                            {relatedQuestions.map((question, index) => (
                                <Link key={index} href={pagePaths.questionPageById(question.id)} className="hover:underline">
                                    <div className="flex flex-row gap-2 items-start">
                                        <ArrowRight className="w-1/12" />
                                        <p className="text-base text-blue-600 w-11/12">
                                            {question.title}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <Vault />
            </div>
        </ScrollableContainer>
    )
}

function QuestionInfoSection() {
    const params = useParams();
    const textareaRef = useRef(null);
    const questionId = params.questionid;
    const [giveAnswer, setGiveAnswer] = useState(false);
    const [textareaHeight, setTextareaHeight] = useState(0);
    const [questionInfo, setQuestionInfo] = useState({
        "id": 4,
        "title": "Istanbul Complex Treatment",
        "body": "m libero natoque hac hendrerit nibh amet, torquent ornare.",
        "voteByUser": null,
        "author": "Sadatul",
        "authorId": 2,
        "authorProfilePicture": avatarAang,
        "voteCount": 1,
        "createdAt": "2024-06-16T21:00:06",
        "tags": ["Hospital", "Heart"]
    });

    useEffect(() => {
        if (giveAnswer && textareaRef.current) {
            // Calculate the content's height when expanding
            const height = textareaRef.current.scrollHeight;
            setTextareaHeight(height + 50); // Add some padding for smoother transition
        } else {
            // Collapse to 0px when hidden
            setTextareaHeight(0);
        }
    }, [giveAnswer]);

    useEffect(() => {
        const textarea = textareaRef.current;

        const handleInput = () => {
            textarea.style.height = 'auto'; // Reset the height
            textarea.style.height = `${textarea.scrollHeight}px`; // Adjust to the scroll height
        };

        // Attach the input event listener
        textarea.addEventListener('input', handleInput);

        // Clean up the event listener when the component unmounts
        return () => {
            textarea.removeEventListener('input', handleInput);
        };
    }, []);

    return (
        <div className="flex flex-col w-full rounded gap-2">
            <div className="flex flex-col w-full bg-white rounded py-2 px-4 gap-1">
                <h1 className="text-2xl font-bold">
                    {questionInfo.title}
                </h1>
                <div className="flex flex-row gap-2">
                    <p className="text-base text-gray-900 flex items-center gap-1">
                        <Avatar avatarImgScr={questionInfo.authorProfilePicture} size={24} />
                        <Link href={pagePaths.redirectUserToProfileWithId(questionInfo.authorId)} className=" hover:underline">
                            {questionInfo.author}
                        </Link>
                    </p>
                    {"--"}
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                        <CalendarClockIcon size={16} />
                        {displayDate(questionInfo.createdAt)}
                    </span>
                </div>
                <div className="flex flex-row gap-2 py-2">
                    {questionInfo.tags.map((tag, index) => (
                        <div key={index} className="text-xs bg-gray-200 p-1 rounded font-semibold">
                            {tag}
                        </div>
                    ))}
                </div>
                <p className="text-lg text-gray-950 p-2">
                    {questionInfo.body}
                </p>
                <Separator className="w-full bg-gray-500 h-[1.5px] mx-auto" />
                <div className="flex flex-row gap-7 items-center justify-between pr-20">
                    <div className="flex flex-row gap-1 items-center">
                        <div className="flex flex-row gap-0 items-center">
                            <button className="text-blue-500 rounded p-1 flex items-center gap-0" onClick={() => {
                                axiosInstance.put(forumQuestionvoteUrl(questionInfo.id), {
                                    voteType: questionInfo.voteByUser === voteStates.upvote ? voteTypes.unvote : voteTypes.upvote
                                }).then((response) => {
                                    setQuestionInfo({
                                        ...questionInfo,
                                        voteByUser: questionInfo.voteByUser === voteStates.upvote ? null : voteStates.upvote,
                                        voteCount: questionInfo.voteCount + response.body?.voteChange
                                    })
                                }).catch((error) => {
                                    console.log(error);
                                })
                            }}>
                                <ThumbsUp size={20} fill={questionInfo.voteByUser === voteStates.upvote ? "rgb(59 130 246)" : "rgb(255,255,255)"} />
                            </button>
                            <button className="text-red-500 rounded p-1  flex items-center gap-1" onClick={() => {
                                axiosInstance.put(forumQuestionvoteUrl(questionInfo.id), {
                                    voteType: questionInfo.voteByUser === voteStates.downvote ? voteTypes.unvote : voteTypes.downvote
                                }).then((response) => {
                                    setQuestionInfo({
                                        ...questionInfo,
                                        voteByUser: questionInfo.voteByUser === voteStates.downvote ? null : voteStates.downvote,
                                        voteCount: questionInfo.voteCount + response.body?.voteChange
                                    })
                                }).catch((error) => {
                                    console.log(error);
                                })
                            }}>
                                <ThumbsDown size={20} fill={questionInfo.voteByUser === voteStates.downvote ? "rgb(239 68 68)" : "rgb(255,255,255)"} />
                            </button>
                        </div>
                        <spa className="text-lg">
                            {questionInfo.voteCount}
                        </spa>
                    </div>
                    <button className="text-green-500 rounded p-2" onClick={() => { setGiveAnswer(prev => !prev) }}>
                        <MessageCircle size={26} />
                    </button>
                </div>
            </div>
            <div className={cn(`transition-[max-height] duration-500 ease-in-out overflow-hidden w-full flex items-start relative bg-white rounded`, giveAnswer && "p-2")}
                style={{ maxHeight: `${textareaHeight}px` }} >
                <textarea
                    ref={textareaRef}
                    id="answerContent"
                    className="flex-1 min-h-24 p-3 bg-gray-100 rounded-3xl shadow-inner overflow-hidden resize-none"
                    placeholder="Write your answer here..."
                />
                <button className="text-gray-700 rounded p-2 right-4 top-4" onClick={() => setGiveAnswer(prev => !prev)}>
                    <Send size={32} />
                </button>
            </div>
        </div>
    )
}

function AnswerSection() {
    const params = useParams();
    const [ansewers, setAnswers] = useState([{
        "id": 10,
        "body": "Very good Reply to 8",
        "parentId": 8,
        "voteByUser": null,
        "author": "Dr. QQW Ahmed",
        "authorId": 4,
        "authorProfilePicture": avatarAang,
        "voteCount": 1,
        "createdAt": "2024-08-17T07:56:27",
        "numberOfReplies": 1
    }, {
        "id": 10,
        "body": "Very good Reply to 8",
        "parentId": 8,
        "voteByUser": null,
        "author": "Dr. QQW Ahmed",
        "authorId": 4,
        "authorProfilePicture": avatarAang,
        "voteCount": 1,
        "createdAt": "2024-08-17T07:56:27",
        "numberOfReplies": 0
    }]);
    const [checkAgain, setCheckAgain] = useState("check")

    return (
        <div className="flex flex-col w-full gap-1">
            <div className="flex flex-row w-full justify-between items-center">
                <h2 className="text-xl font-semibold">
                    Answers
                </h2>
                <div className="flex flex-row gap-3">
                    <select id="sortType" defaultValue={"TIME"} className="rounded-2xl p-2 bg-white shadow-inner border border-gray-300" >
                        <option value={"TIME"} >Time</option>
                        <option value={"VOTES"} >Votes</option>
                    </select>
                    <select id="sortOrder" defaultValue={"ASC"} className="rounded-2xl p-2 bg-white shadow-inner border border-gray-300" >
                        <option value={"ASC"} >Ascending</option>
                        <option value={"DESC"} >Descending</option>
                    </select>
                    <button className="text-blue-500 px-2">
                        <Filter size={24} />
                    </button>
                </div>
            </div>
            <Separator className="w-full bg-gray-500 h-[1.5px] mx-auto" />
            <div className="flex flex-col w-full gap-4 py-3 px-2">
                {ansewers.map((answer, index) => (
                    <Answer key={index} answer={answer} checkAgain={checkAgain} setCheckAgain={setCheckAgain} />
                ))}
            </div>
        </div>
    )
}

const Answer = React.memo(
    function Answer({ answer, allowReply = true, answerBoxRef = null, coords = null, setCoords = null, checkAgain = null, setCheckAgain = null, isChild = true, parentCoords = null, padding = 0 }) {
        const textareaRef = useRef(null);
        const dummyReplies = useMemo(() => [{
            "id": 10,
            "body": "Very good Reply to 8",
            "parentId": 8,
            "voteByUser": null,
            "author": "Dr. QQW Ahmed",
            "authorId": 4,
            "authorProfilePicture": avatarAang,
            "voteCount": 1,
            "createdAt": "2024-08-17T07:56:27",
            "numberOfReplies": 1
        }, {
            "id": 10,
            "body": "Very good Reply to 8",
            "parentId": 8,
            "voteByUser": null,
            "author": "Dr. QQW Ahmed",
            "authorId": 4,
            "authorProfilePicture": avatarAang,
            "voteCount": 1,
            "createdAt": "2024-08-17T07:56:27",
            "numberOfReplies": 1
        },], []);
        const [replies, setReplies] = useState(dummyReplies);
        const [giveReply, setGiveReply] = useState(false);
        const [showReplies, setShowReplies] = useState(false);
        const [mutableAnswer, setMutableAnswer] = useState(answer);
        const [textareaHeight, setTextareaHeight] = useState(0);
        const [childCoords, setChildCoords] = useState(null);

        const childRef = useRef(null);
        const designLineRef = useRef(null);
        const repliesButtonRef = useRef(null);
        const verticalDesignLineRef = useRef(null);
        const baseRef = useRef(null);
        const childToParentLineRef = useRef(null);

        useEffect(() => {
            if (giveReply && textareaRef.current) {
                const height = textareaRef.current.scrollHeight;
                setTextareaHeight(height + 50);
            } else {
                setTextareaHeight(0);
            }
        }, [giveReply]);

        useEffect(() => {
            if (isChild && parentCoords) {
                const baseRect = baseRef.current.getBoundingClientRect();
                const childToParentLineCoords = childToParentLineRef.current.getBoundingClientRect();
                const width = Math.abs(baseRect.left - parentCoords.right);
                childToParentLineRef.current.style.top = `${12}px`;
                childToParentLineRef.current.style.width = `${width}px`;
                childToParentLineRef.current.style.left = `-${width + Math.abs(childToParentLineCoords.left - baseRect.left) / 2}px`;
            }
        }, [isChild, parentCoords, checkAgain]);

        useEffect(() => {
            if (answerBoxRef && setCoords) {
                setCoords(answerBoxRef.current.getBoundingClientRect());
            }
        }, [answerBoxRef, checkAgain]);

        useEffect(() => {
            if (showReplies && mutableAnswer.numberOfReplies > 0 && childCoords) {
                const designLineRect = designLineRef.current.getBoundingClientRect();
                const height = Math.abs(designLineRect.top - childCoords.top) + childCoords.width / 2;
                designLineRef.current.style.height = `${height}px`;
            } else if (!showReplies && mutableAnswer.numberOfReplies > 0) {
                const rectA = designLineRef.current.getBoundingClientRect();
                const rectB = repliesButtonRef.current.getBoundingClientRect();
                const baseRect = baseRef.current.getBoundingClientRect();
                const height = Math.abs(rectA.top - rectB.top) + repliesButtonRef.current.clientHeight / 2 + 5;
                designLineRef.current.style.height = `${height}px`;
                verticalDesignLineRef.current.style.top = `${Math.abs(baseRect.top - rectA.bottom + 4)}px`;
                verticalDesignLineRef.current.style.width = `${Math.abs(rectA.right - rectB.left)}px`;
            }
        }, [showReplies, childCoords, mutableAnswer.numberOfReplies]);

        const handleInput = useCallback(() => {
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }, []);

        const handleUpvote = useCallback(() => {
            axiosInstance.put(forumAnswerVote(mutableAnswer.id), {
                voteType: mutableAnswer.voteByUser === voteStates.upvote ? voteTypes.unvote : voteTypes.upvote
            }).then((response) => {
                setMutableAnswer(prev => ({
                    ...prev,
                    voteByUser: prev.voteByUser === voteStates.upvote ? null : voteStates.upvote,
                    voteCount: prev.voteCount + response.body?.voteChange
                }));
            }).catch(console.log);
        }, [mutableAnswer]);

        const handleDownvote = useCallback(() => {
            axiosInstance.put(forumAnswerVote(mutableAnswer.id), {
                voteType: mutableAnswer.voteByUser === voteStates.downvote ? voteTypes.unvote : voteTypes.downvote
            }).then((response) => {
                setMutableAnswer(prev => ({
                    ...prev,
                    voteByUser: prev.voteByUser === voteStates.downvote ? null : voteStates.downvote,
                    voteCount: prev.voteCount + response.body?.voteChange
                }));
            }).catch(console.log);
        }, [mutableAnswer]);

        useEffect(() => {
            const textarea = textareaRef.current;
            textarea.addEventListener('input', handleInput);
            return () => textarea.removeEventListener('input', handleInput);
        }, [handleInput]);


        return (
            <div ref={baseRef} className="flex items-start space-x-4 w-full relative">
                <div ref={designLineRef} className="absolute top-[36px] left-[30px] w-[2px] bg-black z-10 "></div>
                {(!showReplies && mutableAnswer.numberOfReplies > 0) &&
                    <div ref={verticalDesignLineRef} className="absolute left-[14px] h-[7px] bg-black z-30 flex flex-row justify-end " style={{ clipPath: "polygon(0 42%, 50% 41%, 50% 3%, 100% 50%, 50% 100%, 49% 66%, 0 65%)" }}>
                    </div>
                }
                {isChild &&
                    <div ref={childToParentLineRef} className={cn("absolute h-[7px] bg-black z-30 flex flex-row justify-end")} style={{ clipPath: "polygon(0 42%, 50% 41%, 50% 3%, 100% 50%, 50% 100%, 49% 66%, 0 65%)" }}>
                    </div>
                }
                <div ref={answerBoxRef} className="flex flex-col">
                    <Avatar avatarImgScr={mutableAnswer.authorProfilePicture} size={36} />
                </div>
                <div className={cn("flex flex-col w-full gap-0")}>
                    <div className="relative bg-white px-4 pt-1 rounded-b-lg rounded-r-lg shadow-lg flex flex-col w-full gap-3">
                        <div className="absolute top-0 -left-3 w-0 h-0 border-l-[15px] border-l-transparent border-t-[15px] border-t-white"></div>
                        <div className="flex flex-row justify-between items-center">
                            <Link href={pagePaths.redirectUserToProfileWithId(mutableAnswer.authorId)} className="hover:underline text-black text-base font-semibold">
                                {mutableAnswer.author}
                            </Link>
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <CalendarClockIcon size={16} />
                                {displayDate(mutableAnswer.createdAt)}
                            </span>
                        </div>
                        <p className="text-gray-900">{mutableAnswer.body}</p>
                        <div className="flex flex-row gap-7 items-center justify-between">
                            <div className="flex flex-row gap-1 items-center">
                                <div className="flex flex-row gap-2 items-center">
                                    <button className="text-gray-600 rounded  flex items-center gap-0"
                                        onClick={() => handleUpvote()}>
                                        <ThumbsUp size={16} fill={mutableAnswer.voteByUser === voteStates.upvote ? "rgb(59 130 246)" : "rgb(255,255,255)"} />
                                    </button>
                                    <button className="text-gray-600 rounded  flex items-center gap-1"
                                        onClick={() => handleDownvote()} >
                                        <ThumbsDown size={16} fill={mutableAnswer.voteByUser === voteStates.downvote ? "rgb(239 68 68)" : "rgb(255,255,255)"} />
                                    </button>
                                </div>
                                <span className="text-lg">{mutableAnswer.voteCount}</span>
                            </div>
                            <button disabled={!allowReply} className=" rounded flex items-center text-black" onClick={() => {
                                setGiveReply(prev => !prev)
                                setCheckAgain(new Date().getMilliseconds())
                            }}>
                                {mutableAnswer.numberOfReplies}
                                <MessageCircle size={20} className="text-gray-700" />
                            </button>
                        </div>

                        {/* Reply Section */}
                        <div className={`transition-[max-height] duration-500 ease-in-out overflow-hidden w-full flex items-start relative bg-white rounded`}
                            style={{ maxHeight: `${textareaHeight}px` }} >
                            <textarea
                                ref={textareaRef}
                                id="answerContent"
                                className="flex-1 min-h-24 p-3 bg-gray-100 rounded-3xl shadow-inner overflow-hidden resize-none"
                                placeholder="Write your answer here..."
                            />

                            <button className="text-gray-700 rounded right-4 top-4" onClick={() => setGiveReply(false)}>
                                <Send size={32} />
                            </button>
                        </div>
                    </div>
                    {mutableAnswer.numberOfReplies > 0 &&
                        <>
                            {showReplies ? (
                                <div className="flex flex-col w-full gap-2 mt-4">
                                    {replies.map((reply, index) => (
                                        <Answer key={index}
                                            answer={reply}
                                            allowReply={true}
                                            answerBoxRef={index === (replies.length - 1) ? childRef : null}
                                            coords={index === (replies.length - 1) ? childCoords : null}
                                            setCoords={index === (replies.length - 1) ? setChildCoords : null}
                                            checkAgain={checkAgain}
                                            setCheckAgain={setCheckAgain}
                                            isChild={true}
                                            parentCoords={designLineRef.current.getBoundingClientRect()}
                                            padding={padding + 1}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <button ref={repliesButtonRef} className="text-gray-700 rounded p-2 flex items-center gap-0" onClick={() => {
                                    setShowReplies(prev => !prev)
                                    setCheckAgain(new Date().getMilliseconds())
                                }}>
                                    <span className="text-base translate-y-[3px]">
                                        {mutableAnswer.numberOfReplies} Replies
                                    </span>
                                </button>
                            )}
                        </>}
                </div>
            </div>
        )
    }
)

function Vault() {
    const [vaultData, setVaultData] = useState([{
        type: "image/jpeg",
        url: "https://firebasestorage.googleapis.com/v0/b/javafest-87433.appspot.com/o/questionVault%2FMon%20Aug%2019%202024%2003%3A08%3A49%20GMT%2B0600%20(Bangladesh%20Standard%20Time)%2Fpacifier-96504_640.jpg?alt=media&token=0e62749e-8afe-407d-a209-279144f77c1a"
    }])
    const storage = getStorage(firebase_app)
    return (
        <Sheet >
            <SheetTrigger asChild>
                <button className="bg-gray-600 border-b-gray-900 hover:scale-95 px-3 py-1 text-xl rotate-90 rounded text-white fixed top-1/2 -left-6">
                    Open Vault
                </button>
            </SheetTrigger>
            <SheetContent side={"left"}>
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