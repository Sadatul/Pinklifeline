'use client'

import { ArrowLeft, CalendarIcon, Filter, Flame, LoaderIcon, PencilLine, PenLine, SearchIcon, ThumbsUp, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"
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
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { avatarAang, displayDate, forumQuestionsAnonymousUrl, forumQuestionsUrl, generateFormattedDate, pagePaths } from "@/utils/constants";
import { differenceInDays, format, formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import babyImage from "../../../../../public/babyImage.jpg"
import Image from "next/image";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import { Pagination } from "@mui/material";
import Avatar from "@/app/components/avatar";
import makeAnimated from 'react-select/animated';
import CreatableSelect from 'react-select/creatable'
import Loading from "@/app/components/loading";
import axiosInstance from "@/utils/axiosInstance";
import { useSessionContext } from "@/app/context/sessionContext";
import { toast } from "sonner";

export default function ForumPage() {
    const searchParams = useSearchParams();
    const animatedComponents = makeAnimated();
    const [searchTerms, setSearchTerms] = useState(null);
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [pageInfo, setPageInfo] = useState()
    const [isMounted, setIsMounted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [hotQuestions, setHotQuestions] = useState([]);
    const sessionContext = useSessionContext()
    const router = useRouter();

    const [showFilterOptions, setShowFilterOptions] = useState(false);

    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
    })
    const [filter, setFilter] = useState({
        userId: null,
        tags: null,
        title: null,
        startDate: null,
        endDate: null,
        sortType: "TIME",
        sortDirection: "DESC",
        pageNo: 0
    })
    const [tagOptions, setTagOptions] = useState([])
    const [selectedTags, setSelectedTags] = useState([])

    useEffect(() => {
        if (sessionContext?.sessionData) {
            if (!sessionContext?.sessionData?.userId) {
                router.push(pagePaths.loginPage)
            }else {
                setIsMounted(true);
            }
        }
    }, [sessionContext?.sessionData])

    useEffect(() => {
        const loadQuestions = (url) => {
            axiosInstance.get(url, {
                params: {
                    pageNo: 0,
                    title: null,
                    tags: null,
                    userId: null,
                    startDate: generateFormattedDate(new Date(new Date().setDate(new Date().getDate() - 7))),
                    endDate: generateFormattedDate(new Date()),
                    sortType: "TIME",
                    sortDirection: "DESC"
                }
            }).then((response) => {
                console.log(response.data);
                setHotQuestions(response.data?.content.slice(0, 5));
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                setLoadingQuestions(false);
            })
        }
        if (sessionContext?.sessionData && sessionContext?.sessionData?.userId) {
            loadQuestions(forumQuestionsUrl)
        }
        else if (!sessionContext?.sessionData?.userId) {
            loadQuestions(forumQuestionsAnonymousUrl)
        }
    }, [sessionContext?.sessionData])

    useEffect(() => {
        const loadQuestions = (url) => {
            axiosInstance.get(url, {
                params: {
                    pageNo: filter.pageNo,
                    title: filter.title === "" ? null : filter.title?.trim(),
                    tags: filter.tags === "" ? null : filter.tags,
                    startDate: filter.startDate,
                    endDate: filter.endDate,
                    sortType: filter.sortType,
                    sortDirection: filter.sortDirection
                }
            }).then((response) => {
                console.log(response.data);
                setQuestions(response.data?.content);
                setPageInfo(response.data?.page);
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                setLoadingQuestions(false);
            })
        }
        setLoadingQuestions(true);
        console.log("Filter", filter);
        if (sessionContext?.sessionData?.userId) {
            loadQuestions(forumQuestionsUrl)
        }
        else if (!sessionContext?.sessionData?.userId) {
            loadQuestions(forumQuestionsAnonymousUrl)
        }
    }, [filter, sessionContext?.sessionData])

    if (!isMounted) return <Loading chose="hand" />

    return (
        <ScrollableContainer className="flex flex-col w-full gap-3 p-5 overflow-x-hidden h-full">
            <div className="flex flex-col w-full bg-slate-100 bg-opacity-60 shadow p-5 rounded-xl gap-3">
                <div className="flex flex-row gap-1 items-center">
                    <button className="bg-white rounded-full p-[6px] border border-gray-200 hover:scale-95" onClick={() => {
                        router.push(pagePaths.forumPage)
                    }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold">Question Threads</h1>
                </div>
                <div className="flex flex-row w-full gap-3 px-10 relative">
                    <input
                        type="text"
                        id="question-searchBox"
                        placeholder="Search titles..."
                        className="pl-8 pr-4 py-1 border rounded-2xl border-gray-300 focus:outline-gray-400 shadow-inner min-w-96 text-black "
                        defaultValue={filter.title}
                    />
                    <SearchIcon size={20} className="absolute top-1/2 left-12 transform -translate-y-1/2 text-gray-700" />
                    <button className=" bg-pink-800 text-white hover:scale-95 px-3 py-1 rounded-2xl" onClick={() => {
                        setFilter(prev => ({ ...prev, title: document.getElementById('question-searchBox').value.trim() === "" ? null : document.getElementById('question-searchBox').value.trim(), pageNo: 0 }))
                    }} >
                        Search
                    </button>
                    <Link href={pagePaths.askQuestionPage} target='_self' className="bg-gray-100 border-gray-900 hover:scale-95 px-3 py-1 text-white ml-10 border rounded-3xl">
                        <PencilLine size={24} className="text-black" />
                    </Link>
                </div>
            </div>
            <Separator className="h-[1.5px] bg-gradient-to-b from-pink-200 to-pink-700" />
            <div className="flex flex-col w-full gap-5 h-full">
                <div className="flex flex-row gap-5 w-full flex-1 py-3 relative">
                    <div className={cn(" flex flex-col items-center bg-gray-50 rounded transition-transform duration-500 ease-in-out", showFilterOptions ? "translate-x-0 w-1/5" : "-translate-x-full")}>
                        {showFilterOptions && (
                            <>
                                <h2 className="text-lg p-2">
                                    Filter Options
                                </h2>
                                <Separator className="h-[1.5px] bg-gradient-to-b from-pink-200 to-gray-400 w-10/12 mx-auto" />
                                <div className="flex flex-col gap-5 px-4 mt-5 w-full h-96 justify-between">
                                    <div className="flex flex-col gap-5">
                                        <CreatableSelect
                                            options={tagOptions}
                                            isMulti={true}
                                            onCreateOption={(inputValue) => {
                                                if (inputValue.trim() === "") return;
                                                setTagOptions(prev => [...prev, { value: inputValue, label: inputValue }]);
                                                setSelectedTags(prev => [...prev, { value: inputValue, label: inputValue }]);
                                            }}
                                            onChange={(selected) => {
                                                setSelectedTags(selected);
                                            }}
                                            placeholder="Filter by tags"
                                            components={animatedComponents}
                                            value={selectedTags}
                                            closeMenuOnSelect={false}
                                            className="min-w-64"
                                        />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="date"
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-fit justify-start text-left font-normal border border-pink-500",
                                                        !dateRange && "text-muted-foreground"
                                                    )}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dateRange?.from ? (
                                                        dateRange.to ? (
                                                            <>
                                                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                                                {format(dateRange.to, "LLL dd, y")}
                                                            </>
                                                        ) : (
                                                            format(dateRange.from, "LLL dd, y")
                                                        )
                                                    ) : (
                                                        <span>Pick a date range</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    initialFocus
                                                    mode="range"
                                                    defaultMonth={dateRange?.from}
                                                    selected={dateRange}
                                                    onSelect={setDateRange}
                                                    numberOfMonths={2}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex flex-row gap-3 items-center justify-between">
                                        <button className="bg-red-400 shadow-inner w-fit py-1 px-2 rounded hover:scale-95" onClick={() => {
                                            setShowFilterOptions(false);
                                            setDateRange({ from: null, to: null });
                                            setSelectedTags([]);
                                        }}>
                                            <X size={24} />
                                        </button>
                                        <div className="flex flex-row gap-3 items-center">
                                            <button className="bg-gray-600 w-fit py-1 px-2 rounded hover:scale-95 text-white" onClick={() => {
                                                setDateRange({ from: null, to: null });
                                                toast.info("Filter reset successfully");
                                                setSelectedTags([]);
                                                document.getElementById("sortType").value = "TIME";
                                                document.getElementById("sortDirection").value = "DESC";
                                                document.getElementById("question-searchBox").value = "";
                                                setFilter(prev => (
                                                    {
                                                        ...prev,
                                                        tags: null,
                                                        title: null,
                                                        startDate: null,
                                                        endDate: null,
                                                        sortType: "TIME",
                                                        sortDirection: "DESC",
                                                        pageNo: 0
                                                    }
                                                ));

                                            }}>
                                                Reset Filter
                                            </button>
                                            <button className="rounded bg-pink-800 text-white hover:scale-95 px-3 py-1 flex items-center flex-row gap-2 text-sm w-fit" onClick={() => {
                                                setFilter(prev => ({
                                                    ...prev,
                                                    tags: selectedTags.map(tag => tag.value?.trim()).join(','),
                                                    startDate: generateFormattedDate(dateRange.from),
                                                    endDate: generateFormattedDate(dateRange.to),
                                                }))
                                            }}>
                                                <Filter size={24} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    {!showFilterOptions && (
                        <button
                            onClick={() => setShowFilterOptions(true)}
                            className="rounded bg-gray-800 text-white hover:scale-95 px-3 py-1 fixed top-1/2 rotate-90 -left-5"
                        >
                            Add Filter
                        </button>
                    )}
                    <div className={cn("flex flex-col justify-between gap-2 flex-1", !showFilterOptions && "ml-10")}>
                        <div className="flex flex-col w-full gap-0 h-full">
                            <div className="flex flex-col w-full gap-0">
                                <div className="flex flex-row gap-5 w-full justify-between items-center px-4 py-3 rounded">
                                    <h2 className="text-xl font-semibold">{filter.searchTerms ? `Result for '${filter.searchTerms}'` : ""}</h2>
                                    <div className="flex flex-row gap-3 items-end text-base">
                                        <div className="flex flex-col w-fit gap-1">
                                            <select id="sortType" defaultValue={"TIME"} className="border h-8 shadow-inner border-gray-300 w-36 rounded-2xl text-center text-lg font-[500]" onChange={(e) => {
                                                setFilter(prev => (
                                                    {
                                                        ...prev,
                                                        sortType: e.target.value,
                                                        pageNo: 0
                                                    }
                                                ))
                                            }}>
                                                <option value="TIME">Time</option>
                                                <option value="VOTES">Vote</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col w-fit gap-1">
                                            <select id="sortDirection" defaultValue={"DESC"} className="border h-8 shadow-inner border-gray-300 w-36 rounded-2xl text-center text-lg font-[500]" onChange={(e) => {
                                                setFilter(prev => (
                                                    {
                                                        ...prev,
                                                        sortDirection: e.target.value,
                                                        pageNo: 0
                                                    }
                                                ))
                                            }}>
                                                <option value="ASC">Ascending</option>
                                                <option value="DESC">Descending</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <Separator className="h-[1.5px] bg-gradient-to-b from-pink-200 to-gray-400" />
                            </div>
                            {loadingQuestions ? <LoaderIcon size={64} className="text-pink-800 mx-auto animate-spin" /> :
                                <div className="flex flex-col gap-2 rounded p-3 ">
                                    {(questions.length === 0) && <h2 className="text-2xl font-semibold text-gray-500 text-center">No questions found</h2>}
                                    {questions.map((question, index) => (
                                        <React.Fragment key={index}>
                                            <div className="flex flex-col gap-2 p-2 bg-transparent bg-slate-100 px-4 py-5 drop-shadow-sm shadow-md rounded-lg">
                                                <Link href={pagePaths.questionPageById(question.id)} className="text-3xl font-semibold hover:underline w-fit">{question.title}</Link>
                                                <div className="flex flex-row gap-3 items-center">
                                                    <Avatar avatarImgSrc={question.authorProfilePicture} size={52} />
                                                    <div className="flex flex-col gap-[0px]">
                                                        <Link href={pagePaths.redirectProfile(question.authorId)} className="hover:underline">{question.author}</Link>
                                                        <span className="text-sm text-gray-500">{displayDate(question.createdAt, "hh:mm a, dd MMM, yyyy")}</span>
                                                        <div className="flex flex-row gap-2 items-center">
                                                            <ThumbsUp size={16} className="text-pink-800" />
                                                            <span className="text-sm text-gray-500">{question.voteCount}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            }
                        </div>
                        <div className="flex flex-col items-center w-full">
                            {(pageInfo?.totalPages > 0) &&
                                <Pagination
                                    count={pageInfo?.totalPages}
                                    shape="rounded"
                                    className="m-auto"
                                    showLastButton
                                    showFirstButton
                                    page={filter.pageNo + 1}
                                    onChange={(event, value) => {
                                        setFilter(prev => ({ ...prev, pageNo: value - 1 }))
                                    }}
                                />
                            }
                        </div>
                    </div>
                    <Separator orientation="vertical" className="bg-gray-300 w-[1.5px] h-10/12 mt-10" />
                    <div className="flex flex-col gap-4 w-3/12 bg-gradient-to-b from-zinc-100 to-transparent rounded-xl p-4 shadow-lg">
                        <div className="flex flex-col w-full gap-2 ">
                            <h2 className="text-2xl font-bold text-amber-600">Trending Topics</h2>
                            <Separator className="h-[1.5px] bg-gradient-to-b from-pink-200 to-gray-400" />
                            <div className="flex flex-row w-full gap-2 flex-wrap p-3 justify-center">
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Cancer</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Breast Cancer</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Health</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Recently Happened</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Popular</Badge>
                            </div>
                        </div>
                        <div className="flex flex-col w-full gap-5">
                            <div className="flex flex-col gap-2 items-center">
                                <h2 className="text-2xl font-bold text-gray-700 flex items-center">New Hots <Flame size={24} fill="rgb(217 119 6)" className="text-red-600" /> </h2>
                                <Separator className="h-[1.5px] bg-gradient-to-b from-pink-200 to-gray-400 w-10/12 mx-auto" />
                            </div>
                            <div className="flex flex-col">
                                {(hotQuestions.length === 0) && <h2 className="text-2xl font-semibold text-gray-500 text-center">No questions found</h2>}
                                {hotQuestions.map((question, index) => (
                                    <React.Fragment key={index}>
                                        <div className="flex flex-col gap-1 px-2 bg-transparent scale-75">
                                            <Link href={pagePaths.questionPageById(question.id)} className="text-2xl font-semibold hover:underline break-all text-wrap text-blue-500">{question.title}</Link>
                                            <Separator className="h-[1.5px] bg-gray-300" />
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ScrollableContainer>
    )
}
