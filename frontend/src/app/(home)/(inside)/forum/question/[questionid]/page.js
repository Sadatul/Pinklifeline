'use client';

import Avatar from "@/app/components/avatar";
import Loading from "@/app/components/loading";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import { useSessionContext } from "@/app/context/sessionContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import axiosInstance from "@/utils/axiosInstance";
import { avatarAang, displayDate, forumAnswers, forumAnswersAnonymous, forumAnswersById, forumAnswerVote, forumQuestionByIdAnonymousUrl, forumQuestionByIdUrl, forumQuestionsAnonymousUrl, forumQuestionsUrl, forumQuestionvoteUrl, pagePaths, radicalGradient, ReportTypes, voteStates, voteTypes } from "@/utils/constants";
import firebase_app from "@/utils/firebaseConfig";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { set } from "lodash";
import { ArrowBigDownIcon, ArrowBigUpIcon, ArrowLeft, ArrowRight, CalendarClockIcon, CornerDownRight, CornerLeftUp, Ellipsis, Filter, LinkIcon, Loader, Loader2, LoaderIcon, MessageCircle, MoveLeft, SearchX, Send, SendHorizonal, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { createRef, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { toast } from "sonner";

export default function QuestionThreadPage() {
    const params = useParams();
    const [relatedQuestions, setRelatedQuestions] = useState([]);
    const [questionTags, setQuestionTags] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [fetchRepliesAgain, setFetchRepliesAgain] = useState(false);


    useEffect(() => {
        if (questionTags) {
            axiosInstance.get(forumQuestionsAnonymousUrl, {
                params: {
                    tags: questionTags?.join(",")
                }
            }).then((response) => {
                setRelatedQuestions(response.data.content?.map((question) => ({
                    id: question.id,
                    title: question.title
                })).filter((question) => String(question.id) !== String(params.questionid)))
            }).catch((error) => {
                console.log("error getting related questions", error)
            })
        }
    }, [params.questionid, questionTags])


    if (notFound) {
        return (
            <h1 className="text-4xl text-red-500 w-full h-full text-center m-auto flex flex-row items-center justify-center">
                <SearchX size={64} className="text-red-500" />
                <span className="text-red-500">Question Not Found</span>
            </h1>
        )
    }

    return (
        <ScrollableContainer className={cn("flex flex-col w-full h-full p-5 overflow-x-hidden bg-stone-100")}>
            <div className="flex flex-row w-full gap-2 h-full relative">
                <div className="flex flex-col flex-1 items-end">
                    <div className="flex flex-col w-11/12 rounded p-1 gap-2 mt-2">
                        <QuestionInfoSection setQuestionTags={setQuestionTags} setNotFound={setNotFound} fetchRepliesAgain={fetchRepliesAgain} setFetchRepliesAgain={setFetchRepliesAgain} />
                    </div>
                    <div className="flex flex-col w-11/12 rounded p-1 gap-2 mt-2 px-6">
                        <AnswerSection fetchRepliesAgain={fetchRepliesAgain} setFetchRepliesAgain={setFetchRepliesAgain} />
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
                                        <div className="text-base text-blue-600 w-11/12">
                                            {question.title}
                                        </div>
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

function QuestionInfoSection({ setQuestionTags, setNotFound, fetchRepliesAgain, setFetchRepliesAgain }) {
    const params = useParams();
    const textareaRef = useRef(null);
    const questionId = params.questionid;
    const [giveAnswer, setGiveAnswer] = useState(false);
    const [loadingQuestion, setLoadingQuestion] = useState(true);
    const [textareaHeight, setTextareaHeight] = useState(0);
    const [questionInfo, setQuestionInfo] = useState(null);
    const sessionContext = useSessionContext()
    const router = useRouter()

    function giveReply(parentId, body) {
        console.log("Giving reply", parentId, body)
        if (!body || body === "") {
            toast.dismiss()
            return;
        }
        toast.loading("Giving Reply")
        axiosInstance.post(forumAnswers, {
            questionId: params.questionid,
            parentId: parentId,
            body: body
        }).then((response) => {
            setFetchRepliesAgain(true)
            toast.dismiss()
        }).catch((error) => {
            console.log("error giving reply", error)
        }).finally(() => {
            toast.dismiss()
        })
    }

    useEffect(() => {
        const loadQuestion = (url) => {
            axiosInstance.get(url).then((response) => {
                setQuestionInfo(response.data)
                setQuestionTags(response.data?.tags)
            }).catch((error) => {
                console.log("error getting question", error)
                if (error.response?.status === 404) {
                    setNotFound(true)
                }
            }).finally(() => {
                setLoadingQuestion(false)
            })
        }
        if (sessionContext?.sessionData && sessionContext?.sessionData?.userId) {
            loadQuestion(forumQuestionByIdUrl(params.questionid))
        }
        else if (!sessionContext?.sessionData?.userId) {
            loadQuestion(forumQuestionByIdAnonymousUrl(params.questionid))
        }
    }, [params.questionid, sessionContext?.sessionData])

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
            if (!textarea) return;
            textarea.style.height = 'auto'; // Reset the height
            textarea.style.height = `${textarea.scrollHeight}px`; // Adjust to the scroll height
        };

        if (textarea) {
            // Attach the input event listener
            textarea?.addEventListener('input', handleInput);
        }
        // Clean up the event listener when the component unmounts
        return () => {
            textarea?.removeEventListener('input', handleInput);
        };
    }, [textareaRef.current]);

    if (loadingQuestion) return <Loader2 size={66} className="animate-spin text-gray-600 m-auto" />

    return (
        <div className="flex flex-col w-full rounded gap-2">
            <button className="w-fit bg-white fixed z-30 left-4 top-24 text-gray-700 p-2 rounded-full border border-gray-300 hover:scale-95 transition-all ease-linear" onClick={() => {
                router.push(pagePaths.forumPage)
            }}>
                <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col w-full bg-white rounded-xl shadow-md py-2 px-4 gap-1 relative">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className=" absolute top-2 right-3">
                            <Ellipsis size={25} className="text-gray-700" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {(sessionContext?.sessionData?.userId === questionInfo.authorId) &&
                            <>
                                <DropdownMenuItem>
                                    <Link href={pagePaths.updateQuestionById(questionInfo.id)} className="flex items-center w-full">
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <button className="flex items-center w-full" onClick={() => {
                                        toast.loading("Deleting Answer")
                                        axiosInstance.delete(forumQuestionByIdUrl(questionInfo.id)).then((response) => {
                                            toast.dismiss()
                                            toast.success("Answer Deleted")
                                            window.location.href = pagePaths.forumPage
                                        }).catch((error) => {
                                            toast.dismiss()
                                            toast.error("Error deleting answer")
                                            console.log("error deleting answer", error)
                                        })
                                    }}>
                                        Delete
                                    </button>
                                </DropdownMenuItem>
                            </>
                        }
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Link href={pagePaths.reportPage(questionInfo.id, ReportTypes.forumQuestion)} className="flex items-center w-full">
                                Report
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <h1 className="text-2xl font-bold">
                    {questionInfo?.title}
                </h1>
                <div className="flex flex-row gap-2">
                    <div className="text-base text-gray-900 flex items-center gap-1">
                        <Avatar avatarImgSrc={questionInfo?.authorProfilePicture} size={24} />
                        <Link href={pagePaths.redirectProfile(questionInfo?.authorId)} className=" hover:underline">
                            {questionInfo?.author}
                        </Link>
                    </div>
                    {"--"}
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                        <CalendarClockIcon size={16} />
                        {displayDate(questionInfo?.createdAt)}
                    </span>
                </div>
                <div className="flex flex-row gap-2 py-1">
                    {questionInfo?.tags.map((tag, index) => (
                        <div key={index} className="text-xs bg-gray-200 p-1 rounded font-semibold">
                            {tag}
                        </div>
                    ))}
                </div>
                <div className="text-lg text-gray-950 flex flex-wrap text-wrap break-normal">
                    {questionInfo?.body}
                </div>
                {/* <Separator className="w-full bg-gray-500 h-[1.5px] mx-auto" /> */}
                <div className="flex flex-row items-center justify-between pr-20">
                    <div className="flex flex-row gap-0 items-center">
                        <button className="text-blue-500 rounded p-1 flex items-center w-fit" onClick={() => {
                            axiosInstance.put(forumQuestionvoteUrl(questionInfo?.id), {
                                voteType: questionInfo.voteByUser === voteStates.upvote ? voteTypes.unvote : voteTypes.upvote
                            }).then((response) => {
                                setQuestionInfo({
                                    ...questionInfo,
                                    voteByUser: questionInfo?.voteByUser === voteStates.upvote ? null : voteStates.upvote,
                                    voteCount: questionInfo?.voteCount + response.data?.voteChange
                                })
                            }).catch((error) => {
                                console.log(error);
                            })
                        }}>
                            <ArrowBigUpIcon size={24} fill={questionInfo?.voteByUser === voteStates.upvote ? "rgb(59 130 246)" : "rgb(255,255,255)"} />
                        </button>
                        <span className="text-lg">
                            {questionInfo?.voteCount}
                        </span>
                        <button className="text-red-500 rounded p-1  flex items-center w-fit" onClick={() => {
                            axiosInstance.put(forumQuestionvoteUrl(questionInfo?.id), {
                                voteType: questionInfo?.voteByUser === voteStates.downvote ? voteTypes.unvote : voteTypes.downvote
                            }).then((response) => {
                                setQuestionInfo({
                                    ...questionInfo,
                                    voteByUser: questionInfo?.voteByUser === voteStates.downvote ? null : voteStates.downvote,
                                    voteCount: questionInfo?.voteCount + response.data?.voteChange
                                })
                            }).catch((error) => {
                                console.log(error);
                            })
                        }}>
                            <ArrowBigDownIcon size={24} fill={questionInfo?.voteByUser === voteStates.downvote ? "rgb(239 68 68)" : "rgb(255,255,255)"} />
                        </button>
                    </div>
                    {(sessionContext?.sessionData?.userId) &&
                        <button className="text-green-500 rounded size-fit" onClick={() => { setGiveAnswer(prev => !prev) }}>
                            <MessageCircle size={24} />
                        </button>
                    }
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
                <button className="text-gray-700 rounded p-2 right-4 top-4" onClick={() => {
                    giveReply(null, textareaRef.current?.value)
                    setGiveAnswer(false)
                }}>
                    <Send size={32} />
                </button>
            </div>
        </div>
    )
}

const AnswerSection = React.memo(
    function AnswerSection({ fetchRepliesAgain, setFetchRepliesAgain }) {
        const params = useParams();
        const [ansewers, setAnswers] = useState([]);
        const [loadingAns, setLoadingAns] = useState(true)
        const [isMounted, setIsMounted] = useState(false)
        const sessionContext = useSessionContext()
        const [sortType, setSortType] = useState("TIME")
        const [sortDirection, setSortDirection] = useState("DESC")

        useEffect(() => {
            const loadAns = (url) => {
                if (!isMounted) {
                    setIsMounted(true)
                }
                else {
                    axiosInstance.get(url, {
                        params: {
                            questionId: params.questionid,
                            sortType: document.getElementById("sortType")?.value,
                            sortDirection: document.getElementById("sortDirection")?.value
                        }
                    }).then((res) => {
                        setAnswers(res.data)
                    }).catch((error) => {
                        console.log("error getting ans ", error)
                    }).finally(() => {
                        setLoadingAns(false)
                    })
                }
            }
            if (sessionContext?.sessionData && sessionContext?.sessionData?.userId) {
                loadAns(forumAnswers)
            }
            else if (!sessionContext?.sessionData?.userId) {
                loadAns(forumAnswersAnonymous)
            }
        }, [params.questionid, isMounted, sessionContext?.sessionData])

        useEffect(() => {
            const loadAns = (url) => {
                console.log("loading ans again, fetchRepliesAgain", fetchRepliesAgain)
                if (fetchRepliesAgain) {
                    console.log("Loading answers from depth", -1)
                    axiosInstance.get(url, {
                        params: {
                            questionId: params.questionid,
                            sortType: document.getElementById("sortType")?.value,
                            sortDirection: document.getElementById("sortDirection")?.value
                        }
                    }).then((res) => {
                        setAnswers(res.data)
                    }).catch((error) => {
                        console.log("error getting ans ", error)
                    }).finally(() => {
                        setLoadingAns(false)
                        setFetchRepliesAgain(false)
                    })
                }
            }
            console.log("UserID", sessionContext?.sessionData?.userId)
            if (sessionContext?.sessionData?.userId) {
                loadAns(forumAnswers)
            }
            else if (!sessionContext?.sessionData?.userId) {
                loadAns(forumAnswersAnonymous)
            }
        }, [fetchRepliesAgain, sessionContext?.sessionData, params.questionid])

        if (loadingAns) return <Loading chose="hand" />

        return (
            <div className="flex flex-col w-full gap-1">
                <div className="flex flex-row w-full justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        Answers
                    </h2>
                    <div className="flex flex-row gap-3">
                        <select id="sortType" value={sortType} className="rounded-2xl p-2 bg-white shadow-inner border border-gray-300" onChange={(e) => {
                            setFetchRepliesAgain(true)
                            setSortType(e.target.value)
                        }} >
                            <option value={"TIME"} >Time</option>
                            <option value={"VOTES"} >Votes</option>
                        </select>
                        <select id="sortDirection" value={sortDirection} className="rounded-2xl p-2 bg-white shadow-inner border border-gray-300" onChange={(e) => {
                            setFetchRepliesAgain(true)
                            setSortDirection(e.target.value)
                        }} >
                            <option value={"ASC"} >Ascending</option>
                            <option value={"DESC"} >Descending</option>
                        </select>
                        <button className="text-blue-500 px-2" onClick={() => {
                            setLoadingAns(true)
                            axiosInstance.get(forumAnswers, {
                                params: {
                                    questionId: params.questionid,
                                    sortType: document.getElementById("sortType")?.value,
                                    sortDirection: document.getElementById("sortDirection").value
                                }
                            }).then((res) => {
                                setAnswers(res.data)
                            }).catch((error) => {
                                console.log("error getting ans ", error)
                            }).finally(() => {
                                setLoadingAns(false)
                            })
                        }}>
                            <Filter size={24} />
                        </button>
                    </div>
                </div>
                <Separator className="w-full bg-gray-500 h-[1.5px] mx-auto" />
                <div className="flex flex-col w-full gap-4 py-3 px-2">
                    {ansewers.map((answer, index) => (
                        <Answer key={index} answer={answer} setParentFetchRepliesAgain={setFetchRepliesAgain} />
                    ))}
                </div>
            </div>
        )
    })

const Answer = React.memo(
    function Answer({ answer, allowReply = true, setParentFetchRepliesAgain, depth = 0 }) {
        const sessionContext = useSessionContext();
        const textareaRef = useRef(null);
        const params = useParams()
        const [replies, setReplies] = useState(null);
        const [giveReply, setGiveReply] = useState(false);
        const [showReplies, setShowReplies] = useState(false);
        const [mutableAnswer, setMutableAnswer] = useState(answer);
        const [textareaHeight, setTextareaHeight] = useState(0);
        const [loadingReplies, setLoadingReplies] = useState(true);
        const [editable, setEditable] = useState(false)
        const designLineRef = useRef(null);
        const repliesButtonRef = useRef(null);
        const verticalDesignLineRef = useRef(null);
        const baseRef = useRef(null);
        const editTextRef = useRef(null);
        const [fetchRepliesAgain, setFetchRepliesAgain] = useState(false);

        useEffect(() => {
            setMutableAnswer(answer);
        }, [answer]);

        useEffect(() => {
            if (giveReply && textareaRef.current) {
                const height = textareaRef.current.scrollHeight;
                setTextareaHeight(height + 50);
            } else {
                setTextareaHeight(0);
            }
        }, [giveReply]);

        useEffect(() => {
            const loadReplies = (url) => {
                if (fetchRepliesAgain) {
                    console.log("Loading answers from depth", depth)
                    setLoadingReplies(true)
                    axiosInstance.get(url, {
                        params: {
                            questionId: params.questionid,
                            parentId: answer.id
                        }
                    }).then((response) => {
                        console.log(response)
                        setReplies(response.data)
                    }).catch((error) => {
                        console.log(error)
                    }).finally(() => {
                        setLoadingReplies(false)
                        setFetchRepliesAgain(false)
                    })
                }
            }
            if (sessionContext?.sessionData?.userId) {
                loadReplies(forumAnswers)
            }
            else if (!sessionContext?.sessionData?.userId) {
                loadReplies(forumAnswersAnonymous)
            }
        }, [fetchRepliesAgain, answer?.id, params.questionid, sessionContext?.sessionData])

        // useEffect(() => {
        //     if (!showReplies && mutableAnswer.numberOfReplies > 0) {
        //         const rectA = designLineRef.current?.getBoundingClientRect();
        //         const rectB = repliesButtonRef.current?.getBoundingClientRect();
        //         const baseRect = baseRef.current?.getBoundingClientRect();
        //         if (!rectA || !rectB || !baseRect) return;
        //         const height = Math.abs(rectA?.top - rectB?.top) + repliesButtonRef.current?.clientHeight / 2 + 5;
        //         designLineRef.current.style.height = `${height}px`;
        //         // verticalDesignLineRef.current.style.top = `${Math.abs(baseRect.top - rectA.bottom + 4)}px`;
        //         verticalDesignLineRef.current.style.width = `${Math.abs(rectA.right - rectB.left)}px`;
        //     }
        // }, [showReplies, mutableAnswer.numberOfReplies, answer]);

        const handleInput = useCallback(() => {
            if (!textareaRef.current) return;
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }, []);

        const handleUpvote = useCallback(() => {
            axiosInstance.put(forumAnswerVote(mutableAnswer.id), {
                voteType: Number(mutableAnswer.voteByUser) === voteStates.upvote ? voteTypes.unvote : voteTypes.upvote
            }).then((response) => {
                setMutableAnswer(prev => ({
                    ...prev,
                    voteByUser: prev.voteByUser === voteStates.upvote ? null : voteStates.upvote,
                    voteCount: prev.voteCount + response.data?.voteChange
                }));
            }).catch(console.log);
        }, [mutableAnswer]);

        const handleDownvote = useCallback(() => {
            axiosInstance.put(forumAnswerVote(mutableAnswer.id), {
                voteType: Number(mutableAnswer.voteByUser) === voteStates.downvote ? voteTypes.unvote : voteTypes.downvote
            }).then((response) => {
                setMutableAnswer(prev => ({
                    ...prev,
                    voteByUser: prev.voteByUser === voteStates.downvote ? null : voteStates.downvote,
                    voteCount: prev.voteCount + response.data?.voteChange
                }));
            }).catch(console.log);
        }, [mutableAnswer]);

        useEffect(() => {
            if (textareaRef?.current) {
                const textarea = textareaRef.current;
                textarea.addEventListener('input', handleInput);
            }
        }, [handleInput, textareaRef.current]);

        if (!answer) return <Loader size={36} className="text-gray-500 animate-spin m-auto" />

        return (
            <div ref={baseRef} className="flex items-start space-x-4 w-full relative">
                {showReplies && replies?.length > 0 && <div className={"absolute left-8 top-[10px] bottom-[10px] w-[2px] bg-gray-400"}></div>}
                {!showReplies && (answer.numberOfReplies > 0) && <div className={"absolute left-8 top-[10px] bottom-[14px] w-[2px] bg-gray-400"}></div>}
                {(mutableAnswer.numberOfReplies > 0 && !showReplies) &&
                    <div ref={designLineRef} className="absolute top-[36px] left-[30px] w-[2px] bg-gray-500 z-10 "></div>
                }
                {(!showReplies && mutableAnswer.numberOfReplies > 0) &&
                    <div ref={verticalDesignLineRef} className="absolute left-[16px] h-[7px] bg-gray-500 z-30 flex flex-row justify-end" style={{
                        clipPath: "polygon(0 42%, 50% 41%, 50% 3%, 100% 50%, 50% 100%, 49% 66%, 0 65%)",
                        width: "36px",
                        bottom: "11px",
                    }}>
                    </div>
                }
                <div className="flex flex-col">
                    <Avatar avatarImgSrc={mutableAnswer.authorProfilePicture} size={36} />
                </div>
                <div className={cn("flex flex-col w-full gap-0")}>
                    <div className="relative bg-white px-4 pt-1 rounded-b-lg rounded-r-lg shadow-lg flex flex-col w-full gap-[1px]">
                        <div className="absolute top-0 -left-3 w-0 h-0 border-l-[15px] border-l-transparent border-t-[15px] border-t-white"></div>
                        <div className="flex flex-row justify-between items-center">
                            <Link href={pagePaths.redirectProfile(mutableAnswer.authorId)} className="hover:underline text-black text-base font-semibold">
                                {mutableAnswer.author}
                            </Link>
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <CalendarClockIcon size={16} />
                                {displayDate(mutableAnswer.createdAt)}
                            </span>
                        </div>
                        {!editable ? (
                            <>
                                <div className="text-gray-900 text-wrap break-all">{mutableAnswer.body}</div>
                                <div className="flex flex-row gap-7 items-center justify-between">
                                    <div className="flex flex-row gap-1 items-center">
                                        <div className="flex flex-row gap-1 items-center">
                                            <button className="text-gray-600 rounded  flex items-center gap-0"
                                                onClick={() => handleUpvote()}>
                                                <ArrowBigUpIcon size={22} fill={mutableAnswer.voteByUser === voteStates.upvote ? "rgb(59 130 246)" : "rgb(255,255,255)"} />
                                            </button>
                                            <span className="text-base text-gray-700 font-[500]">{mutableAnswer.voteCount}</span>
                                            <button className="text-gray-600 rounded  flex items-center gap-1"
                                                onClick={() => handleDownvote()} >
                                                <ArrowBigDownIcon size={22} fill={mutableAnswer.voteByUser === voteStates.downvote ? "rgb(239 68 68)" : "rgb(255,255,255)"} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-6">
                                        {(sessionContext?.sessionData?.userId) &&
                                            <button disabled={!allowReply} className=" rounded flex items-center text-black gap-1" onClick={() => {
                                                setGiveReply(prev => !prev)
                                            }}>
                                                {mutableAnswer.numberOfReplies}
                                                <MessageCircle size={20} className="text-gray-700" />
                                            </button>
                                        }
                                        {(sessionContext?.sessionData?.userId) &&
                                            <DropdownMenu>
                                                <DropdownMenuTrigger disabled={giveReply} asChild>
                                                    <button className="">
                                                        <Ellipsis size={24} className="text-gray-700" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {(sessionContext?.sessionData?.userId === mutableAnswer.authorId) &&
                                                        <>
                                                            <DropdownMenuItem>
                                                                <button className="flex items-center w-full" onClick={() => { setEditable(true) }}>
                                                                    Edit
                                                                </button>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>
                                                                <button className="flex items-center w-full" onClick={() => {
                                                                    toast.loading("Deleting Answer")
                                                                    axiosInstance.delete(forumAnswersById(answer.id)).then((response) => {
                                                                        toast.dismiss()
                                                                        setParentFetchRepliesAgain(true)
                                                                        toast.success("Answer Deleted")
                                                                    }).catch((error) => {
                                                                        toast.dismiss()
                                                                        toast.error("Error deleting answer")
                                                                        console.log("error deleting answer", error)
                                                                    })
                                                                }}>
                                                                    Delete
                                                                </button>
                                                            </DropdownMenuItem>
                                                        </>
                                                    }
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Link href={pagePaths.reportPage(answer.id, ReportTypes.forumAnswer)} className="flex items-center w-full">
                                                            Report
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        }
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {sessionContext?.sessionData?.userId === mutableAnswer.authorId &&
                                    <>
                                        <textarea
                                            className="flex-1 min-h-20 p-3 bg-gray-100 rounded-3xl shadow-inner overflow-hidden resize-none"
                                            defaultValue={mutableAnswer.body}
                                            maxLength={65535}
                                            ref={editTextRef}
                                        />
                                        <div className="flex flex-row items-center gap-2">
                                            <button className="bg-gray-700 text-white rounded px-2 py-1 shadow-inner border border-gray-600" onClick={() => {
                                                if (!editTextRef.current || editTextRef.current?.value === "") return;
                                                axiosInstance.put(forumAnswersById(mutableAnswer.id), {
                                                    body: editTextRef.current?.value
                                                }).then((response) => {
                                                    setMutableAnswer({
                                                        ...mutableAnswer,
                                                        body: editTextRef.current?.value
                                                    })
                                                    setEditable(false)
                                                }).catch((error) => {
                                                    console.log(error)
                                                    setEditable(false)
                                                })
                                            }}>
                                                Save
                                            </button>
                                            <button className="text-gray-700 rounded px-2 py-1 shadow-inner border border-gray-600" onClick={() => setEditable(false)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                }
                            </>
                        )}
                        {/* Reply Section */}
                        <div className={cn(`transition-[max-height] duration-500 ease-in-out overflow-hidden w-full flex items-start relative bg-white rounded`, giveReply && "p-1")}
                            style={{ maxHeight: `${textareaHeight}px` }} >
                            <textarea
                                ref={textareaRef}
                                className="flex-1 min-h-20 p-3 bg-gray-100 rounded-3xl shadow-inner overflow-hidden resize-none"
                                placeholder="Write your answer here..."
                            />

                            <button className="text-gray-700 rounded right-4 top-4" onClick={() => {
                                if (!textareaRef.current || textareaRef.current?.value === "") {
                                    toast.dismiss()
                                    setGiveReply(false)
                                    return;
                                }
                                toast.loading("Giving Reply")
                                axiosInstance.post(forumAnswers, {
                                    questionId: params.questionid,
                                    parentId: answer.id,
                                    body: textareaRef.current?.value
                                }).then((response) => {
                                    setParentFetchRepliesAgain(true)
                                    toast.dismiss()
                                }).catch((error) => {
                                    console.log("error giving reply", error)
                                }).finally(() => {
                                    toast.dismiss()
                                })
                                setGiveReply(false)
                            }}>
                                <Send size={32} />
                            </button>
                        </div>
                    </div>
                    {answer.numberOfReplies > 0 &&
                        <>
                            {showReplies ? (
                                <div className="flex flex-col w-full gap-2 mt-4">
                                    {!loadingReplies ?
                                        <>
                                            {replies?.map((reply, index) => (
                                                <Answer key={index}
                                                    answer={reply}
                                                    allowReply={true}
                                                    setParentFetchRepliesAgain={setFetchRepliesAgain}
                                                    depth={depth + 1}
                                                />
                                            ))}
                                        </> :
                                        <>
                                            <LoaderIcon size={36} className="text-gray-500 animate-spin m-auto"></LoaderIcon>
                                        </>
                                    }
                                </div>
                            ) : (
                                <button ref={repliesButtonRef} className="text-gray-700 rounded p-2 flex items-center gap-0 w-fit" onClick={() => {
                                    setShowReplies(prev => !prev)
                                    setLoadingReplies(true)
                                    const url = sessionContext?.sessionData?.userId ? forumAnswers : forumAnswersAnonymous
                                    axiosInstance.get(url, {
                                        params: {
                                            questionId: params.questionid,
                                            parentId: answer.id
                                        }
                                    }).then((response) => {
                                        console.log(response)
                                        setReplies(response.data)
                                    }).catch((error) => {
                                        console.log(error)
                                    }).finally(() => {
                                        setLoadingReplies(false)
                                    })
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
                        const filePath = `questionVault/${new Date().toString()}/${file?.name}`;
                        const storageRef = ref(storage, filePath);
                        const uploadTask = uploadBytesResumable(storageRef, file);
                        uploadTask.on(
                            'state_changed',
                            (snapshot) => {
                                const progress = (snapshot?.bytesTransferred / snapshot?.totalBytes) * 100;
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
                    {vaultData?.map((data, index) => {
                        return (
                            <div key={index} className="flex flex-col w-full gap-3 p-2 bg-gray-100 rounded-lg">
                                <div className="flex flex-row items-center gap-3 p-1 justify-between w-full">
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="text-lg font-semibold flex items-center gap-2 relative w-full">
                                            {data?.type}
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
                                                    const fileRef = ref(storage, data?.url);
                                                    deleteObject(fileRef).then((res) => {
                                                        const newData = vaultData?.filter((_, i) => i !== index)
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
                                {data?.type?.includes("image") && <Image sizes="100vw" width={0} height={0} style={{ width: '100%', height: 'auto' }} src={data?.url} alt="Vault Image" />}
                            </div>
                        )
                    })}
                </ScrollableContainer>
            </SheetContent>
        </Sheet>
    )
}