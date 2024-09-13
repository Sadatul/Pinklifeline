'use client'

import { useSessionContext } from "@/app/context/sessionContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { displayDate, generateFormattedDate, pagePaths, radicalGradient, workStatus, worksUrl, workTagsUrl } from "@/utils/constants"
import { Pagination } from "@mui/material"
import { format } from "date-fns"
import { set } from "lodash"
import { CalendarIcon, ChevronDown, ChevronUp, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import ReactSelect from "react-select"
import makeAnimated from "react-select/animated"

// Query params: startDate=2024-08-08
//  Query params: endDate=2024-09-08
//  Query params: tags=doctor,nursing
//  Query params: userId=1
//  Query params: status=POSTED
//  Query params: providerId=1
//  Query params: address=dhaka
//  Query params: sortDirection=ASC
//  Query params: pageNo=0

const animatedComponents = makeAnimated()

export default function WorksPage() {
    const sessionContext = useSessionContext()
    const [works, setWorks] = useState([])
    const [pageInfo, setPageInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({
        startDate: null,
        endDate: null,
        tags: null,
        userId: null,
        status: workStatus.POSTED,
        providerId: null,
        sortDirection: "ASC",
        pageNo: 0
    })
    const [allowStatusFilter, setAllowStatusFilter] = useState(false)
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
    })
    const tagsOptions = [{ label: "Doctor", value: "DOCTOR" }, { label: "Nursing", value: "NURSING" }]
    const [selectedTags, setSelectedTags] = useState([])
    const [showFilter, setShowFilter] = useState(false)

    useEffect(() => {
        console.log("filter", filter)
        axiosInstance.get(worksUrl, {
            params: filter
        }).then(res => {
            console.log("works", res.data)
            setWorks(res.data?.content)
            setPageInfo(res.data?.page)
        }).catch(err => {
            console.error(err)
        }).finally(() => {
            setLoading(false)
        })
    }, [filter])

    if (!sessionContext.sessionData) return null

    return (
        <div className={cn(radicalGradient, "from-slate-200 to-slate-100 p-4 flex flex-col items-center w-full flex-1 gap-6")}>
            <div className="w-11/12 bg-white px-4 py-2 rounded flex flex-col gap-6">
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex flex-row gap-2 items-center">
                        <h1 className="text-2xl font-bold">Works</h1>
                        <button className="w-fit px-2 py-1 flex items-center bg-gray-100 rounded" onClick={() => {
                            setShowFilter(prev => !prev)
                        }}>
                            {showFilter ? "Hide Filter" : "Show Filter"}
                            {
                                showFilter ? <ChevronUp size={28} /> : <ChevronDown size={28} />
                            }
                        </button>
                    </div>
                </div>
                <div className={cn("flex flex-col gap-4 transition-transform duration-500 ease-linear", showFilter ? "scale-100" : "scale-0")}>
                    {showFilter &&
                        <>
                            <div className="flex flex-row gap-5 flex-wrap">
                                <div className="flex flex-row gap-2 items-center">
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
                                <div className="flex flex-row gap-2 items-center">
                                    <span>Tags</span>
                                    <ReactSelect
                                        options={tagsOptions}
                                        isMulti
                                        className="w-80"
                                        onChange={(selected) => setSelectedTags(selected)}
                                        components={animatedComponents}
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions
                                        value={selectedTags}
                                    />
                                </div>
                                {(sessionContext.sessionData.subscribed > 0) &&
                                    <div className="flex flex-row gap-2 items-center">
                                        <span>
                                            Address
                                        </span>
                                        <input
                                            type='text'
                                            id="address"
                                            className="w-60 p-2 border border-gray-500 shadow-inner rounded-md "
                                        />
                                    </div>
                                }
                            </div>
                            <div className="flex flex-row gap-5 flex-wrap">
                                <button className="p-2 bg-blue-500 text-white rounded-md hover:scale-95" onClick={() => {
                                    setFilter({
                                        ...filter,
                                        startDate: generateFormattedDate(dateRange.from),
                                        endDate: generateFormattedDate(dateRange.to),
                                        tags: selectedTags.map(tag => tag.value).join(","),
                                        userId: document.getElementById("user-id").value === "" ? null : document.getElementById("user-id").value,
                                        providerId: document.getElementById("provider-id").value === "" ? null : document.getElementById("provider-id").value,
                                        address: document.getElementById("address").value === "" ? null : document.getElementById("address").value,
                                    })
                                }}>Filter</button>
                                <button className="p-2 bg-red-500 text-white rounded-md hover:scale-95" onClick={() => {
                                    setFilter({
                                        startDate: null,
                                        endDate: null,
                                        tags: null,
                                        userId: null,
                                        status: workStatus.POSTED,
                                        providerId: null,
                                        address: null,
                                        sortDirection: "ASC",
                                        pageNo: 0
                                    })
                                    setDateRange({
                                        from: null,
                                        to: null,
                                    })
                                    setSelectedTags([])
                                    if (sessionContext.sessionData.subscribed > 0) {
                                        document.getElementById("address").value = ''
                                    }
                                }}>Clear</button>
                            </div>
                        </>
                    }
                </div>
            </div>
            <div className="flex flex-col w-10/12 gap-4">
                <div className="flex flex-row items-center justify-end w-full">
                    <div className="flex flex-row gap-4">
                        <select className="p-2 border border-gray-500 shadow-inner rounded-md" onChange={(e) => {
                            if (e.target.value === "DEFAULT") {
                                setAllowStatusFilter(false)
                                setFilter({
                                    ...filter,
                                    status: workStatus.POSTED,
                                    userId: '',
                                    providerId: '',
                                    pageNo: 0
                                })
                            }
                            else if (e.target.value === "MYPOSTS") {
                                setAllowStatusFilter(true)
                                setFilter({
                                    ...filter,
                                    userId: sessionContext.sessionData.userId,
                                    providerId: '',
                                    status: workStatus.POSTED,
                                    pageNo: 0
                                })
                            }
                            else if (e.target.value === "MYPROVIDINGS") {
                                setAllowStatusFilter(true)
                                setFilter({
                                    ...filter,
                                    providerId: sessionContext.sessionData.userId,
                                    userId: '',
                                    status: workStatus.ACCEPTED,
                                    pageNo: 0
                                })
                            }
                        }}>
                            <option value="DEFAULT">Default</option>
                            <option value="MYPOSTS">My Posts</option>
                            <option value="MYPROVIDINGS">My Providings</option>
                        </select>
                        <select id="status" disabled={!allowStatusFilter} value={filter.status} className="p-2 border border-gray-500 shadow-inner rounded-md" onChange={(e) => {
                            setFilter({
                                ...filter,
                                status: e.target.value === "ALL" ? "" : e.target.value,
                                pageNo: 0
                            })
                        }}>
                            <option value="ALL">ALL</option>
                            <option value="POSTED">Posted</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="FINISHED">Finished</option>
                        </select>
                        <select id="sort" value={filter.sortDirection} className="p-2 border border-gray-500 shadow-inner rounded-md" onChange={(e) => {
                            setFilter({
                                ...filter,
                                sortDirection: e.target.value,
                                pageNo: 0
                            })
                        }}>
                            <option value="ASC">Ascending</option>
                            <option value="DESC">Descending</option>
                        </select>
                        <Link href={pagePaths.dashboardPages.addWorkPage} className="flex items-center gap-1 hover:underline text-lg">
                            Add Work <Plus size={24} />
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col gap-5 bg-white p-4 rounded">
                    <div className="flex flex-col gap-2 w-full">
                        {loading ? (
                            <div className="flex flex-row justify-center items-center w-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : works.length === 0 ? (
                            <div className="flex flex-row justify-center items-center w-full">
                                <span className="text-xl text-gray-500">No works found</span>
                            </div>
                        ) : (
                            works.map((work, index) => (
                                <WorkComponent key={index} work={work} />
                            ))
                        )}
                    </div>
                    <div className="flex flex-col w-full items-center justify-center">
                        <Pagination
                            count={pageInfo?.totalPages}
                            page={pageInfo?.number + 1}
                            onChange={(e, page) => {
                                setFilter({
                                    ...filter,
                                    pageNo: page - 1
                                })
                            }}
                            color="primary"
                            variant="outlined"
                            showLastButton
                            showFirstButton
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function WorkComponent({ work }) {
    const [tags, setTags] = useState([])
    useEffect(() => {
        if (work) {
            axiosInstance.get(workTagsUrl(work.id)).then(res => {
                setTags(res.data)
            }).catch(err => {
                console.error("error getting tags for work:", work.id, err)
            })
        }
    }, [work])

    return (
        <div className="flex flex-col items-center gap-2 p-2 border-b border-gray-500 break-all w-full">
            <div className="flex flex-col gap-1 w-full">
                <div className="flex flex-row gap-4 justify-between w-full">
                    <Link href={pagePaths.dashboardPages.worksByIdPage(work.id)} className="font-bold text-lg flex items-center gap-2 ">
                        <span className="hover:underline">
                            {work.title}
                        </span>
                        <Badge className={cn(work.status === workStatus.FINISHED && "bg-blue-700", work.status === workStatus.ACCEPTED && "bg-red-700", work.status === workStatus.POSTED && "bg-green-700", "text-white hover:no-underline")}>{work.status}</Badge>
                    </Link>
                    <span>{displayDate(work.createdAt)}</span>
                </div>
                <div className="flex flex-row gap-2 text-xs">
                    {tags.map((tag, index) => (
                        <div key={index} className="flex items-center gap-1 w-fit p-1 rounded bg-gray-100">
                            {tag}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <span>{work.description}</span>
            </div>
        </div>
    )
}