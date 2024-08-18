'use client'

import { CalendarIcon, Filter, Flame, LoaderIcon, PencilLine, PenLine, SearchIcon, ThumbsUp, X } from "lucide-react";
import { useSearchParams } from "next/navigation"
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
import { avatarAang, pagePaths } from "@/utils/constants";
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

export default function ForumPage() {
    const searchParams = useSearchParams();
    const animatedComponents = makeAnimated();
    const searchTerms = searchParams.get('search') || '';
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [pageInfo, setPageInfo] = useState()
    const [isMounted, setIsMounted] = useState(false);
    const [questions, setQuestions] = useState([{
        "id": 3,
        "title": "Cancer Patient Diet",
        "voteByUser": null,
        "author": "Sadatul",
        "authorId": 2,
        "authorProfilePicture": avatarAang,
        "voteCount": 0,
        "createdAt": "2024-03-16T20:59:42"
    }, {
        "id": 3,
        "title": "Cancer Patient Diet",
        "voteByUser": null,
        "author": "Sadatul",
        "authorId": 2,
        "authorProfilePicture": avatarAang,
        "voteCount": 0,
        "createdAt": "2024-03-16T20:59:42"
    },]);

    const [showFilterOptions, setShowFilterOptions] = useState(false);

    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
    })
    const [filter, setFilter] = useState({
        searchTerms: null,
        tags: null,
        dateRange: null,
        sortDirection: null,
        sortType: null,
    })
    const [tagOptions, setTagOptions] = useState([])
    const [selectedTags, setSelectedTags] = useState([])

    function displayDate(date) {
        const currentDate = new Date();
        const givenDate = new Date(date);
        const difference = differenceInDays(currentDate, givenDate);

        // Check if the date is within the last 7 days
        if (difference < 7) {
            // Display how many days ago
            return formatDistanceToNow(givenDate, { addSuffix: true });
        } else {
            // Display the formatted date in "Friday, 12 August, 2023" format
            return format(givenDate, 'EEEE, dd MMMM, yyyy');
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingQuestions(false);
        }, 1000);
        setIsMounted(true);
        return () => clearTimeout(timer);
    }, [])

    if (!isMounted) return <Loading chose="hand" />

    return (
        <ScrollableContainer className="flex flex-col w-full gap-3 p-5 overflow-x-hidden h-full">
            <div className="flex flex-col w-full bg-gradient-to-r from-purple-100 to-transparent p-3 rounded gap-3">
                <h1 className="text-3xl font-bold">Question Threads</h1>
                <div className="flex flex-row w-full justify-between">
                    <div className="relative flex items-center gap-5">
                        <input
                            type="text"
                            id="question-searchBox"
                            placeholder="Search titles..."
                            className="pl-8 pr-4 py-1 border rounded border-purple-500 shadow-inner min-w-96 text-black"
                            defaultValue={searchTerms}
                        />
                        <SearchIcon size={20} className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-700" />
                        <button onClick={() => { console.log(filter); }} className="rounded bg-pink-800 text-white hover:scale-95 px-3 py-1">Search</button>

                        {/* Filter Options Div */}

                    </div>
                    <Link href={pagePaths.askQuestionPage} target='_self' className="bg-gray-100 border-gray-900 hover:scale-95 px-3 py-1 text-white ml-10 border rounded">
                        <PencilLine size={28} className="text-black" />
                    </Link>
                </div>

            </div>
            <Separator className="h-[2.5px] bg-gradient-to-b from-purple-200 to-purple-700" />
            <div className="flex flex-col w-full gap-5 h-full">
                <div className="flex flex-row gap-5 w-full flex-1 py-3 relative">
                    <div className={cn(" flex flex-col items-center bg-gray-50 rounded transition-transform duration-500 ease-in-out", showFilterOptions ? "translate-x-0 w-1/5" : "-translate-x-full")}>
                        {showFilterOptions && (
                            <>
                                <h2 className="text-lg p-2">
                                    Filter Options
                                </h2>
                                <Separator className="h-[1.5px] bg-gradient-to-b from-purple-200 to-gray-400 w-10/12 mx-auto" />
                                <div className="flex flex-col gap-5 px-4 mt-5 w-full h-96 justify-between">
                                    <div className="flex flex-col gap-5">
                                        <div className="flex flex-col gap-2">
                                            User Id to filter
                                            <input id="userId-input" className="border border-gray-600 shadow-inner px-2 text-base rounded" />
                                        </div>
                                        <CreatableSelect
                                            options={tagOptions}
                                            isMulti={true}
                                            onCreateOption={(inputValue) => {
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
                                                        "w-fit justify-start text-left font-normal border border-purple-500",
                                                        !dateRange && "text-muted-foreground"
                                                    )}
                                                >
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
                                        <button className="bg-red-400 shadow-inner w-fit py-1 px-2 rounded hover:scale-95" onClick={() => { setShowFilterOptions(false); }}>
                                            <X size={24} />
                                        </button>
                                        <button onClick={() => { console.log(filter); }} className="rounded bg-purple-800 text-white hover:scale-95 px-3 py-1 flex items-center flex-row gap-2 text-sm w-fit">
                                            <Filter size={24} />
                                        </button>
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
                    <div className={cn("flex flex-col gap-2 flex-1", !showFilterOptions && "ml-10")}>
                        <div className="flex flex-row gap-5 w-full justify-between items-center px-4 py-3 bg-gradient-to-r from-purple-100 to-transparent rounded">
                            <h2 className="text-xl font-semibold">{filter.searchTerms ? `Result for '${filter.searchTerms}'` : "Question Threads"}</h2>
                            <div className="flex flex-row gap-3 items-end text-base">
                                <div className="flex flex-col w-fit gap-1">
                                    Sort type
                                    <select id="sortType" defaultValue={"TIME"} className="border px-2 shadow-inner border-purple-500 w-36 rounded text-base">
                                        <option value="TIME">Time</option>
                                        <option value="VOTES">Vote</option>
                                    </select>
                                </div>
                                <div className="flex flex-col w-fit gap-1">
                                    Sort direction
                                    <select id="sortDirection" defaultValue={"ASC"} className="border px-2 shadow-inner border-purple-500 w-36 rounded text-base">
                                        <option value="ASC">Ascending</option>
                                        <option value="DESC">Descending</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <Separator className="h-[1.5px] bg-gradient-to-b from-purple-200 to-gray-400" />
                        {loadingQuestions ? <LoaderIcon size={64} className="text-purple-800 mx-auto animate-spin" /> :
                            <div className="flex flex-col gap-5 rounded p-3">
                                {questions.map((question, index) => (
                                    <React.Fragment key={index}>
                                        <div className="flex flex-col gap-2 p-2 bg-transparent bg-gradient-to-r from-pink-100 to-transparent rounded px-4 py-2">
                                            <Link href={pagePaths.questionPageById(question.id)} className="text-3xl font-semibold hover:underline">{question.title}</Link>
                                            <div className="flex flex-row gap-3 items-center">
                                                <Avatar avatarImgScr={question.authorProfilePicture} size={52} />
                                                <div className="flex flex-col gap-[0px]">
                                                    <Link href={pagePaths.userProfile(question.authorId)} className="hover:underline">{question.author}</Link>
                                                    <span className="text-sm text-gray-500">{displayDate(question.createdAt)}</span>
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <ThumbsUp size={16} className="text-purple-800" />
                                                        <span className="text-sm text-gray-500">{question.voteCount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        }
                        <Pagination count={10} shape="rounded" className="m-auto" />
                    </div>
                    <Separator orientation="vertical" className="bg-gray-300 w-[1.5px] h-10/12 mt-10" />
                    <div className="flex flex-col gap-4 w-3/12 bg-gradient-to-b from-zinc-100 to-transparent rounded p-3">
                        <div className="flex flex-col w-full gap-2">
                            <h2 className="text-2xl font-bold text-amber-600">Trending Topics</h2>
                            <Separator className="h-[1.5px] bg-gradient-to-b from-purple-200 to-gray-400" />
                            <div className="flex flex-row max-w-72 gap-2 flex-wrap p-3 justify-center">
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Cancer</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Breast Cancer</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Health</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Recently Happened</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Popular</Badge>
                            </div>
                        </div>
                        < div className="flex flex-col w-full gap-5">
                            <div className="flex flex-col gap-2 items-center">
                                <h2 className="text-2xl font-bold text-gray-700 flex items-center">New Hots <Flame size={24} fill="rgb(217 119 6)" className="text-red-600" /> </h2>
                                <Separator className="h-[1.5px] bg-gradient-to-b from-purple-200 to-gray-400 w-10/12 mx-auto" />
                            </div>
                            <div className="flex flex-col">
                                {questions.map((question, index) => (
                                    <React.Fragment key={index}>
                                        <div className="flex flex-col gap-1 px-2 bg-transparent scale-75">
                                            <Link href={pagePaths.questionPageById(question.id)} className="text-2xl font-semibold hover:underline">{question.title}</Link>
                                            <div className="flex flex-row gap-3 items-center">
                                                <Avatar avatarImgScr={question.authorProfilePicture} size={52} />
                                                <div className="flex flex-col gap-[2px]">
                                                    <Link href={pagePaths.userProfile(question.authorId)} className="hover:underline">{question.author}</Link>
                                                    <span className="text-sm text-gray-500">{displayDate(question.createdAt)}</span>
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <ThumbsUp size={16} className="text-purple-800" />
                                                        <span className="text-sm text-gray-500">{question.voteCount}</span>
                                                    </div>
                                                </div>
                                            </div>
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
