'use client'

import { ArrowLeft, CalendarIcon, Filter, LoaderIcon, PencilLine, PenLine, SearchIcon, ThumbsUp } from "lucide-react";
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
import { avatarAang, blogsAnonymousUrl, blogsUrl, generateFormattedDate, pagePaths } from "@/utils/constants";
import { differenceInDays, format, formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import babyImage from "../../../../../public/babyImage.jpg"
import Image from "next/image";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import { Pagination } from "@mui/material";
import Avatar from "@/app/components/avatar";
import axiosInstance from "@/utils/axiosInstance";
import { useSessionContext } from "@/app/context/sessionContext";

export default function BlogsPage() {

    const [loadingBlogs, setLoadingBlogs] = useState(true);
    const [pageInfo, setPageInfo] = useState()
    const [blogs, setBlogs] = useState([]);
    const [trendingBlogs, setTrendingBlogs] = useState([]);
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
    })
    console.log("dummmy");
    const [filter, setFilter] = useState({
        docId: null,
        doctorName: null,
        title: null,
        startDate: null,
        endDate: null,
        sortType: "TIME",
        sortDirection: "DESC",
        pageNo: 0,
    })
    const sessionContext = useSessionContext();

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
        axiosInstance.get(blogsAnonymousUrl, { params: filter }).then((response) => {
            console.log(response.data);
            setBlogs(response.data.content.map(blog => {
                const content = blog.content.match(/<covertext>(.*?)<\/covertext>/s)
                const coverImage = blog.content.match(/<coverimage>(.*?)<\/coverimage>/s)
                return {
                    ...blog,
                    content: content ? content[1] : null,
                    coverImage: coverImage ? coverImage[1] : null,
                }
            }));
            setPageInfo(response.data.page);
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            setLoadingBlogs(false);
        })
    }, [filter])

    useEffect(() => {
        axiosInstance.get(blogsAnonymousUrl, {
            params: {
                endDate: generateFormattedDate(new Date()),
                startDate: generateFormattedDate(new Date(new Date().setDate(new Date().getDate() - 7))),
                sortType: 'VOTES',
                sortDirection: 'DESC',
            }
        }).then((response) => {
            console.log(response.data);
            setTrendingBlogs(response.data.content.slice(0, 7).map(blog => {
                return {
                    id: blog.id,
                    title: blog.title,
                }
            }));
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            setLoadingBlogs(false);
        })
    }, [])

    useEffect(() => {
        console.log("filter", filter);
    }, [filter])

    return (
        <ScrollableContainer className="flex flex-col w-full gap-4 px-5 py-2 overflow-x-hidden h-full">
            <div className="flex flex-col w-full p-3 rounded gap-5">
                <div className="flex flex-row gap-3 items-center">
                    <button className="rounded-full p-1 bg-gray-300 " onClick={() => {
                        if (sessionContext?.sessionData?.userId) {
                            window.history.back()
                        } else {
                            window.location.href = pagePaths.baseUrl
                        }
                    }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold">Blogs</h1>
                </div>
                <div className="flex flex-row w-full justify-between gap-5 px-5">
                    <div className="relative flex items-center gap-5">
                        <input type="text" placeholder="Search titles..." className="pl-8 pr-4 py-1 border border-gray-300 focus:outline-zinc-400 shadow-inner min-w-96 text-black rounded-2xl" id="search-title-field" defaultValue={filter.title} />
                        <SearchIcon size={20} className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-700" />
                        <button className="bg-pink-800 text-white hover:scale-95 px-3 py-1 rounded-2xl" onClick={() => {
                            setFilter({ ...filter, title: document.getElementById('search-title-field') ? document.getElementById('search-title-field').value.trim() === "" ? null : document.getElementById('search-title-field').value.trim() : null });
                        }}>
                            Search
                        </button>
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="bg-gray-600 border-b-gray-900 hover:scale-95 px-3 py-1 rounded-2xl text-white">
                                    Add Filter
                                </button>
                            </SheetTrigger>
                            <SheetContent className="flex flex-col justify-between h-full">
                                <SheetHeader>
                                    <SheetTitle>Filter</SheetTitle>
                                    <SheetDescription>
                                        Add other filters to your search
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="flex flex-col gap-10 p-5 text-lg flex-1">
                                    <div className="flex flex-col gap-2 text-base">
                                        <input defaultValue={filter.doctorName || ""} placeholder="Doctor name" autoComplete="off" id="doctorName" className="border shadow-inner border-gray-300 focus:outline-gray-400 w-full px-3 py-1 rounded-xl" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="date"
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full rounded-xl  justify-start text-left font-normal border border-gray-300 focus:outline-gray-400 shadow-inner",
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
                                    <div className="flex flex-row gap-5 items-center text-black text-lg">
                                        <select id="sortType" defaultValue={filter.sortType} className=" px-3 py-1 shadow-inner border border-gray-300 focus:outline-gray-400 w-fit rounded-xl text-base">
                                            <option value="TIME">Time</option>
                                            <option value="VOTES">Vote</option>
                                        </select>
                                        <select id="sortDirection" defaultValue={filter.sortDirection} className=" px-3 py-1 shadow-inner border border-gray-300 focus:outline-gray-400 w-fit rounded-xl text-base">
                                            <option value="ASC">Ascending</option>
                                            <option value="DESC">Descending</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-row gap-2 items-center text-black text-lg">
                                    </div>
                                </div>
                                <SheetFooter>
                                    <div className="flex flex-row justify-between items-center w-full">
                                        <Button className="bg-red-500 text-white rounded-2xl hover:text-red-500 hover:scale-95 hover:border hover:border-red-500" size="lg" variant={"outline"} onClick={() => {
                                            document.getElementById('doctorName').value = '';
                                            document.getElementById('sortDirection').value = 'DESC';
                                            document.getElementById('sortType').value = 'TIME';
                                            setDateRange({ from: null, to: null });
                                            setFilter({ doctorName: null, dateRange: null, sortDirection: null, sortType: null });
                                        }}>
                                            Reset
                                        </Button>
                                        <Button size="lg" onClick={() => {
                                            setFilter({
                                                ...filter,
                                                title: null,
                                                doctorName: document.getElementById('doctorName') ? document.getElementById('doctorName').value.trim() === "" ? null : document.getElementById('doctorName').value.trim() : null,
                                                sortType: document.getElementById('sortType') ? document.getElementById('sortType').value : 'TIME',
                                                sortDirection: document.getElementById('sortDirection') ? document.getElementById('sortDirection').value : 'DESC',
                                                startDate: generateFormattedDate(dateRange.from),
                                                endDate: generateFormattedDate(dateRange.to),
                                            });
                                        }} className="hover:scale-95 hover:border hover:bg-white shadow-inner hover:text-black rounded-2xl">
                                            Apply
                                        </Button>
                                    </div>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                        <Link href={pagePaths.addBlogPage} target='_self' className="bg-gray-100 border-gray-900 hover:scale-95 p-1  text-white ml-10 border rounded-full">
                            <PencilLine size={24} className="text-black" />
                        </Link>
                    </div>
                </div>
            </div>
            <Separator className="h-[2.5px] bg-gradient-to-b from-purple-200 to-purple-700" />
            <div className="flex flex-col w-full gap-5 flex-grow drop-shadow-xl">
                <div className="flex flex-row gap-5 w-full flex-1 py-3">
                    <div className="flex flex-col gap-2 flex-1 justify-between">
                        <div className="flex flex-col flex-1">
                            {loadingBlogs ? <LoaderIcon size={64} className="text-purple-800 mx-auto animate-spin" /> :
                                <div className="flex flex-col gap-5 rounded p-3">
                                    {
                                        blogs.map((blog, index) => (
                                            <React.Fragment key={index}>
                                                <div className={cn("flex flex-row justify-between gap-2 p-5 rounded-2xl shadow-lg")}>
                                                    <div className="flex flex-col gap-2 flex-1 p-1">
                                                        <Link href={pagePaths.blogPageById(blog.id)} className="text-2xl font-bold hover:underline w-fit">{blog.title}</Link>
                                                        <div className="flex flex-row items-center gap-2">
                                                            <Link href={pagePaths.doctorProfile(blog.authorId)} className="text-lg hover:underline mr-1 gap-1 flex items-center">
                                                                <Avatar avatarImgSrc={blog.authorProfilePicture} size={32} />
                                                                {blog.author}
                                                            </Link>
                                                            <p className="text-sm text-gray-600">{displayDate(blog.createdAt)}</p>
                                                        </div>
                                                        {blog.content && <p className="text-lg line-clamp-3 break-normal">{blog.content}</p>}
                                                        <span className="flex items-center gap-1">
                                                            <ThumbsUp size={20} className="text-pink-700" />
                                                            <span className="text-sm">{blog.upvoteCount}</span>
                                                        </span>
                                                    </div>
                                                    {blog.coverImage && <Image src={blog.coverImage} alt="babyImage" width={200} height={200} />}
                                                </div>
                                            </React.Fragment>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                        <div className="w-full h-fit flex flex-col justify-center items-center">
                            {(pageInfo?.totalPages > 1) &&
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
                    <Separator orientation="vertical" className="bg-gray-500 w-[1.5px] h-full" />
                    <div className="flex flex-col gap-4 w-3/12 bg-zinc-50  rounded-2xl shadow-lg p-3">
                        <div className="flex flex-col w-full gap-2">
                            <h2 className="text-2xl font-bold text-amber-600">Trending Topics</h2>
                            <Separator className="h-[1.5px] bg-gradient-to-b from-purple-200 to-gray-400" />
                            <div className="flex flex-row w-full gap-2 flex-wrap justify-center items-center">
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Cancer</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Breast Cancer</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Health</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Recently Happened</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Popular</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Explore</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Otther Cancer</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Issues</Badge>
                                <Badge variant='outline' className="text-black text-base border border-gray-400 shadow-inner cursor-pointer">Health issues</Badge>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full items-center">
                            <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
                                Trending Blogs
                                <PenLine size={24} className="text-purple-800 translate-y-1" />
                            </h2>
                            <Separator className="h-[1.5px] bg-gradient-to-b from-purple-200 to-gray-400" />
                            <div className="flex flex-col gap-3 items-start p-3 text-lg w-full">
                                {trendingBlogs.map((blog, index) => (
                                    <Link key={index} href={pagePaths.blogPageById(blog.id)} className="hover:underline text-blue-500 break-all text-wrap">
                                        {blog.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ScrollableContainer>
    )
}

