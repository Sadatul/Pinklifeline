'use client'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { complaintUrl, pagePaths, radicalGradient, reportCategories, ReportTypes, resolveComplaint } from "@/utils/constants"
import { format } from "date-fns"
import { CalendarIcon, Check, ExternalLink, Loader2, X } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import ReactSelect from "react-select"
import makeAnimated from 'react-select/animated';
import { toast } from "sonner"

export default function ComplaintsPage() {
    const animatedComponents = makeAnimated()
    const [complaints, setComplaints] = useState([
        {
            "createdAt": "2024-08-19T22:18:24",
            "resourceId": 3,
            "description": "This was very offensive content",
            "id": 1,
            "type": "BLOG",
            "category": "Sexual content"
        }, {
            "createdAt": "2024-08-19T22:18:24",
            "resourceId": 3,
            "description": "This was very offensive content",
            "id": 1,
            "type": "BLOG",
            "category": "Sexual content"
        }, {
            "createdAt": "2024-08-19T22:18:24",
            "resourceId": 3,
            "description": "This was very offensive content",
            "id": 1,
            "type": "BLOG",
            "category": "Sexual content"
        }, {
            "createdAt": "2024-08-19T22:18:24",
            "resourceId": 3,
            "description": "This was very offensive content",
            "id": 1,
            "type": "BLOG",
            "category": "Sexual content"
        },
    ])

    const [isMounted, setIsMounted] = useState(false)

    const [fetchAgain, setFetchAgain] = useState(true)
    const [filter, setFilter] = useState({
        category: null,
        type: null,
        startDate: null,
        endDate: null,
        sortDirection: null,
        pageNo: 0,
    })
    const [loadingComplaints, setLoadingComplaints] = useState(true)
    const [pageInfo, setPageInfo] = useState()
    const [selectedCategories, setSelectedCategories] = useState([])
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null
    })

    useEffect(() => {
        if (!isMounted) {
            setIsMounted(true)
        }
    }, [])

    useEffect(() => {
        if (fetchAgain) {
            setLoadingComplaints(true)
            axiosInstance.get(complaintUrl, {
                params: filter
            }).then((response) => {
                setComplaints(response.data.content)
                setPageInfo(response.data.page)
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setLoadingComplaints(false)
                setFetchAgain(false)
            })
        }
    }, [filter, fetchAgain])

    const handleViolated = (complaintId, isViolated) => {
        axiosInstance.get(resolveComplaint(complaintId), {
            params: {
                violation: isViolated
            }
        }).then((response) => {
            setFetchAgain(true)
        }).catch((error) => {
            console.log(error)
        })
    }

    if (!isMounted) return null

    return (
        <div className={cn("flex flex-col gap-10 w-full flex-1 p-4", radicalGradient, "from-zinc-300 to-zinc-200")}>
            <h1 className="text-2xl font-bold">Complaints</h1>
            <div className="flex flex-row gap-4 w-full flex-wrap p-7 bg-gray-50 rounded-md">
                <label className="flex flex-col gap-2 w-fit">
                    Category
                    <ReactSelect
                        options={reportCategories.map((category) => ({ value: category.label, label: category.label }))}
                        isMulti={false}
                        components={animatedComponents}
                        onChange={(selected) => {
                            setSelectedCategories(selected)
                        }}
                        value={selectedCategories}
                        placeholder="Select Category"
                        className="w-64 rounded-md border border-gray-600"
                        isClearable
                    />
                </label>
                <label className="flex flex-col gap-2 w-fit">
                    Type
                    <select id="complaints-category" defaultValue={"select-category"} className="w-fit px-3 py-2 text-lg text-gray-600 border border-gray-500 rounded-md focus:outline-none">
                        <option value="select-category" disabled>Select Category</option>
                        <option value={ReportTypes.blog}>Blog</option>
                        <option value={ReportTypes.forumQuestion}>Forum Question</option>
                        <option value={ReportTypes.forumAnswer}>Forum Answer</option>
                    </select>
                </label>
                <div className="flex flex-col gap-2 w-fit">
                    Date range
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-fit justify-start text-left font-normal border border-purple-500",
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
            </div>
            <div className="flex flex-col gap-3 w-full px-7">
                <div className="flex flex-row gap-4 w-full justify-end items-center text-black font-semibold">
                    Time
                    <select id="complaints-sort" className="px-3 py-1 text-base text-gray-900 border border-gray-500 rounded-md focus:outline-none" onChange={(e) => {
                        setFilter({
                            ...filter,
                            sortDirection: e.target.value,
                            pageNo: 0
                        })
                    }}>
                        <option value={"ASC"}>Ascending</option>
                        <option value={"DESC"}>Descending</option>
                    </select>
                </div>
                <Separator className="h-[2px] w-full bg-black bg-opacity-60" />
                <div className="flex flex-col gap-4 w-full min-h-60 items-center bg-white p-3 rounded">
                    {loadingComplaints ? (
                        <Loader2 size={48} className="text-gray-700 m-auto animate-spin" />
                    ) : (
                        <>
                            {complaints.map((complaint, index) => (
                                <React.Fragment key={index}>
                                    <div className="flex flex-col gap-1 w-10/12">
                                        <div className="flex flex-row justify-between items-center">
                                            <Link href={pagePaths.complaintDetailsPage(complaint.id, complaint.type, complaint.resourceId)} className="text-lg font-semibold flex items-center gap-2 hover:underline">
                                                {complaint.type}
                                                <ExternalLink size={20} className="text-gray-700" />
                                            </Link>
                                            <h3 className="text-sm font-normal">{format(new Date(complaint.createdAt), "EEEE hh:mm a, LLL dd, y")}</h3>
                                        </div>
                                        <div className="flex flex-row justify-between items-center">
                                            <h3 className="text-base font-normal">{complaint.category}</h3>
                                            <h3 className="text-base font-normal">Resource ID: {complaint.resourceId}</h3>
                                        </div>
                                        <p className="text-base font-normal text-wrap break-all">{complaint.description}</p>
                                        <div className="flex flex-row justify-end gap-10">
                                            <button className="rounded w-fit px-2 b py-1order text-sm bg-green-300 text-black shadow-inner hover:scale-95" onClick={() => {
                                                handleViolated(complaint.id, false)
                                            }}>
                                                Not Violated
                                            </button>
                                            <button className="rounded w-fit px-2 py-1 border text-sm bg-red-300 text-black shadow-inner hover:scale-95" onClick={() => {
                                                handleViolated(complaint.id, true)
                                            }}>
                                                Violated
                                            </button>
                                        </div>
                                    </div>
                                    {index !== complaints.length - 1 &&
                                        <Separator className="h-[2px] w-full bg-gray-300" />
                                    }
                                </React.Fragment>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    )

}