'use client'

import { CalendarIcon, Filter, LoaderIcon, PencilLine, PenLine, SearchIcon, ThumbsUp } from "lucide-react";
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

export default function BlogsPage() {
    
    const searchParams = useSearchParams();
    const pageNumber = searchParams.get('page') || 1;
    const searchTerms = searchParams.get('search') || '';
    const [loadingBlogs, setLoadingBlogs] = useState(true);
    const [pageInfo, setPageInfo] = useState()
    const [blogs, setBlogs] = useState([]);
    const [trendingBlogs, setTrendingBlogs] = useState([]);
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
    })
    const [filter, setFilter] = useState({
        docId: null,
        doctorName: null,
        title: null,
        startDate: null,
        endDate: null,
        sortType: "TIME",
        sortDirection: "ASC",
        pageNo: 0,
    })

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
        <ScrollableContainer className="flex flex-col w-full gap-3 p-5 overflow-x-hidden h-full">
            <div className="flex flex-col w-full bg-gradient-to-r from-purple-100 to-transparent p-3 rounded gap-3">
                <h1 className="text-3xl font-bold">Blogs</h1>
                <div className="flex flex-row w-full justify-between gap-5">
                    <div className="relative flex items-center gap-5">
                        <input type="text" placeholder="Search titles..." className="pl-8 pr-4 py-1 border rounded border-purple-500 shadow-inner min-w-96 text-black" id="search-title-field" defaultValue={filter.title} />
                        <SearchIcon size={20} className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-700" />
                        <button className="rounded bg-pink-800 text-white hover:scale-95 px-3 py-1" onClick={() => {
                            setFilter({ ...filter, title: document.getElementById('search-title-field').value });
                        }}>
                            Search
                        </button>
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="bg-gray-600 border-b-gray-900 hover:scale-95 px-3 py-1 rounded text-white">
                                    Add Filter
                                </button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Filter</SheetTitle>
                                    <SheetDescription>
                                        Add other filters to your search
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="flex flex-col gap-5 p-5 text-lg flex-1">
                                    <div className="flex flex-col gap-2">
                                        Doctor Name
                                        <input defaultValue={filter.doctorName || ""} autoComplete="off" id="doctorName" className="border shadow-inner border-purple-500 min-w-72 rounded px-2" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        Doctor Id
                                        <input type="number" defaultValue={filter.doctorName || ""} autoComplete="off" id="doctorId" className="border shadow-inner border-purple-500 min-w-72 rounded px-2 number-input" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        Start Date - End Date
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="date"
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-64 justify-start text-left font-normal border border-purple-500",
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
                                    <div className="flex flex-row gap-2 items-center text-black text-lg">
                                        Sort Type
                                        <select id="sortType" defaultValue={filter.sortType} className="border p-2 shadow-inner border-purple-500 w-36 rounded text-base">
                                            <option value="TIME">Time</option>
                                            <option value="VOTES">Vote</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-row gap-2 items-center text-black text-lg">
                                        Sort
                                        <select id="sortDirection" defaultValue={filter.sortDirection} className="border p-2 shadow-inner border-purple-500 w-36 rounded text-base">
                                            <option value="ASC">Ascending</option>
                                            <option value="DESC">Descending</option>
                                        </select>
                                    </div>
                                    <Separator className="h-[2px] bg-purple-800" />
                                </div>
                                <SheetFooter>
                                    <div className="flex flex-row justify-between items-center w-full">
                                        <Button className="bg-red-500 text-white hover:text-red-500 hover:scale-95 hover:border hover:border-red-500" size="lg" variant={"outline"} onClick={() => {
                                            document.getElementById('doctorName').value = '';
                                            document.getElementById('sortDirection').value = 'ASC';
                                            document.getElementById('sortType').value = 'TIME';
                                            setDateRange({ from: null, to: null });
                                            setFilter({ doctorName: null, dateRange: null, sortDirection: null, sortType: null });
                                        }}>
                                            Reset
                                        </Button>
                                        <Button size="lg" onClick={() => {
                                            setFilter({
                                                ...filter,
                                                docId: document.getElementById('doctorId').value,
                                                doctorName: document.getElementById('doctorName').value,
                                                sortType: document.getElementById('sortType').value,
                                                sortDirection: document.getElementById('sortDirection').value,
                                                startDate: generateFormattedDate(dateRange.from),
                                                endDate: generateFormattedDate(dateRange.to),
                                            });
                                        }} className="hover:scale-95 hover:border hover:bg-white shadow-inner hover:text-black">
                                            Apply
                                        </Button>
                                    </div>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                        <Link href={pagePaths.addBlogPage} target='_self' className="bg-gray-100 border-gray-900 hover:scale-95 px-3 py-1  text-white ml-10 border rounded">
                            <PencilLine size={28} className="text-black" />
                        </Link>
                    </div>
                </div>
            </div>
            <Separator className="h-[2.5px] bg-gradient-to-b from-purple-200 to-purple-700" />
            <div className="flex flex-col w-full gap-5 flex-grow">
                <div className="flex flex-row gap-5 w-full flex-1 py-3">
                    <div className="flex flex-col gap-2 flex-1 justify-between">
                        <div className="flex flex-col flex-1">
                            {loadingBlogs ? <LoaderIcon size={64} className="text-purple-800 mx-auto animate-spin" /> :
                                <div className="flex flex-col gap-5 rounded p-3">
                                    {
                                        blogs.map((blog, index) => (
                                            <React.Fragment key={index}>
                                                <div className={cn("flex flex-row justify-between gap-2 p-5 rounded bg-gradient-to-r from-indigo-100 to-transparent to-75%")}>
                                                    <div className="flex flex-col gap-2 flex-1 p-1">
                                                        <Link href={pagePaths.blogPageById(blog.id)} className="text-2xl font-bold hover:underline w-fit">{blog.title}</Link>
                                                        <div className="flex flex-row items-center gap-3">
                                                            <Link href={pagePaths.doctorProfile(blog.authorId)} className="text-base hover:underline mr-5 gap-1 flex items-center">
                                                                <Avatar avatarImgScr={blog.authorProfilePicture} size={32} />
                                                                {blog.author}
                                                            </Link>
                                                            <p className="text-sm">{displayDate(blog.createdAt)}</p>
                                                            <span className="flex items-center gap-1">
                                                                <ThumbsUp size={20} className="text-pink-700" />
                                                                <span className="text-sm">{blog.upvoteCount}</span>
                                                            </span>
                                                        </div>
                                                        {blog.content && <p className="text-lg line-clamp-3 break-all">{blog.content}</p>}
                                                    </div>
                                                    {blog.coverImage && <Image src={blog.coverImage} alt="babyImage" width={200} height={200} />}
                                                </div>
                                                <Separator className="h-[1.5px] bg-gradient-to-b from-purple-200 to-gray-400" />
                                            </React.Fragment>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                        <div className="w-full h-fit flex flex-col justify-center items-center">
                            {(pageInfo?.totalPages > 0) &&
                                <Pagination
                                    count={pageInfo?.totalPages}
                                    shape="rounded"
                                    className="m-auto"
                                    showLastButton
                                    page={filter.pageNo + 1}
                                    onChange={(event, value) => {
                                        setFilter(prev => ({ ...prev, pageNo: value - 1 }))
                                    }}
                                />
                            }
                        </div>
                    </div>
                    <Separator orientation="vertical" className="bg-gray-500 w-[1.5px] h-full" />
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

