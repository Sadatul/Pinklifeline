'use client'

import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import ReactSelect from "react-select"
import makeAnimated from 'react-select/animated';
import { act, useEffect, useRef, useState } from "react"
import Image from "next/image"
import ScrollableContainer from "@/app/components/StyledScrollbar"
import { Pagination } from "@mui/material"
import { addReportUrl, capitalizeFirstLetter, cleanString, generateFormattedDate, pagePaths, roles } from "@/utils/constants"
import axiosInstance from "@/utils/axiosInstance"
import { FaUserDoctor } from "react-icons/fa6"
import { ChevronDown, ChevronUp, HospitalIcon, Key, Loader2, Lock, Plus } from "lucide-react"
import Link from "next/link"
import CreatableSelect from 'react-select/creatable'
import { useSessionContext } from "@/app/context/sessionContext"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function PrescriptionVaultPage() {
    const animatedComponents = makeAnimated();
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const selectedKeywords = useRef([])
    const [currentPage, setCurrentPage] = useState(1)
    const [isMounted, setIsMounted] = useState(false)
    const [keyWordsOption, setKeyWordsOption] = useState([])
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
    })
    const [showFilter, setShowFilter] = useState(false)
    const sessionContext = useSessionContext()
    const [verified, setVerified] = useState(false)
    const router = useRouter()

    useEffect(() => {
        console.log("fetching documents")
        if (sessionContext?.sessionData && sessionContext?.sessionData.role !== roles.doctor) {
            axiosInstance.get(addReportUrl).then((response) => {
                console.log("Response from filter", response)
                setData(response.data)
                setLoading(false)
                setIsMounted(true)
            }).catch((error) => {
                setIsMounted(true)
                setLoading(false)
                console.log("Error from filter", error)
            })
        }
    }, [sessionContext?.sessionData])


    useEffect(() => {
        const handleFilter = () => {
            const doctorName = cleanString(document.getElementById("search-doctorName")?.value)
            const hospitalName = cleanString(document.getElementById("search-hospitalName")?.value)
            const sort = document.getElementById("search-sort")?.value
            const startDate = generateFormattedDate(dateRange.from)
            const endDate = generateFormattedDate(dateRange.to)
            console.log("Filtering", doctorName, hospitalName, selectedKeywords.current, startDate, endDate, sort, currentPage)
            setShowFilter(false)
            axiosInstance.get(addReportUrl, {
                params: {
                    doctorName: doctorName === "" ? null : doctorName,
                    hospitalName: hospitalName === "" ? null : hospitalName,
                    keywords: selectedKeywords.current.length > 0 ? selectedKeywords.current.map((keyword) => keyword.value).join(",") : null,
                    startDate: startDate,
                    endDate: endDate,
                    sort: sort,
                    pageNo: currentPage - 1
                }
            }).then((response) => {
                console.log("Response from filter", response)
                setData(response.data)
                setLoading(false)
            }).catch((error) => {
                setLoading(false)
                console.log("Error from filter", error)
            })
        }
        if (loading && data) {
            handleFilter()
        }
    }, [loading])

    useEffect(() => {
        if (data) {
            setLoading(true)
        }
    }, [currentPage])

    useEffect(() => {
        if (sessionContext?.sessionData) {
            if (sessionContext?.sessionData.role === roles.doctor) {
                router.push(pagePaths.dashboardPages.sharedPrescriptionPage)
            }
            else {
                setVerified(true)
            }
        }
    }, [sessionContext?.sessionData])

    if (!verified) return null

    return (
        <div className={cn("flex flex-col w-full h-full px-3 py-5 gap-3 ", !(sessionContext?.sessionData?.subscribed > 0) && "relative p-0")}>
            {sessionContext?.sessionData && Number(sessionContext?.sessionData?.subscribed > 0) ? <></> :
                <div className="w-full h-full flex flex-row justify-between items-center absolute bg-gray-400 bg-opacity-50 rounded-lg z-30">
                    <div className="size-72 flex flex-col items-center gap-3 bg-transparent m-auto bg-opacity-50">
                        <Lock size={72} className="text-purple-600" />
                        <span className="text-2xl text-gray-800 text-nowrap">
                            You need to subscribe to access this page
                        </span>
                    </div>
                </div>
            }
            <h1 className="text-xl w-full text-center font-semibold">
                Reports Vault Page
            </h1>
            <div className={cn("flex flex-col gap-7 w-full flex-1", sessionContext?.sessionData && Number(sessionContext?.sessionData?.subscribed == 0) && " blur-md")}>
                <div className="flex flex-col gap-2 w-full flex-1">
                    <div className="flex flex-row justify-between items-center w-full">
                        <h2 className="text-xl">
                            Documents
                        </h2>
                        <div className="flex flex-row gap-4">
                            {sessionContext?.sessionData && Number(sessionContext?.sessionData.subscribed > 0) ?
                                <Link href={pagePaths.dashboardPages.addToVaultPage} className="hover:underline flex flex-row items-center gap-2 w-fit px-3 py-2 rounded-2xl bg-slate-200">
                                    Add Document {<Plus size={20} />}
                                </Link> : <></>
                            }
                            <Sheet open={showFilter} onOpenChange={(e) => {
                                setShowFilter(e)
                            }}>
                                <SheetTrigger asChild>
                                    <button className="bg-pink-500 text-white rounded-2xl p-1 w-20  hover:scale-95 active:scale-75 transition-all ease-in-out duration-300" onClick={() => {
                                        setShowFilter(true)
                                    }}>
                                        Filter
                                    </button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>
                                            Filter Documents
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="flex flex-col gap-3 w-full justify-between h-full pt-10">
                                        <div className="flex flex-col gap-8 flex-wrap w-full justify-evenly">
                                            <input autoComplete="off" id="search-doctorName" placeholder="Doctor Name" type="text" className="border shadow-inner border-gray-300 focus:outline-gray-400 text-gray-900 rounded-xl px-3 py-2 w-full h-fit" />
                                            <input autoComplete="off" id="search-hospitalName" type="text" placeholder="Hospital Name" className="border shadow-inner border-gray-300 focus:outline-gray-400 text-gray-900 rounded-xl px-3 py-2 w-full h-fit" />
                                            {isMounted ?
                                                    <CreatableSelect className="w-full border-gray-500 border rounded"
                                                        id="search-keywords"
                                                        options={keyWordsOption}
                                                        isMulti={true}
                                                        closeMenuOnSelect={false}
                                                        components={animatedComponents}
                                                        onChange={(newValue, actionMeta) => {
                                                            console.log(newValue, actionMeta)
                                                            selectedKeywords.current = newValue
                                                        }}
                                                        onCreateOption={(keyword) => {
                                                            setKeyWordsOption(prev => [...prev, { value: keyword.trim(), label: capitalizeFirstLetter(keyword.trim()) }])
                                                            selectedKeywords.current = [...selectedKeywords.current, { value: keyword.trim(), label: capitalizeFirstLetter(keyword.trim()) }]
                                                        }}
                                                    />
                                                : <></>
                                            }
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="date"
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal border border-gray-500",
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
                                            <select defaultValue={"DESC"} id="search-sort" className="border shadow-inner border-gray-300 focus:outline-gray-400 text-gray-900 rounded-xl px-3 py-2 w-full h-fit">
                                                <option value="ASC">Ascending</option>
                                                <option value="DESC">Descending</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-row justify-between items-center gap-4 m-3">
                                            <button className="bg-gray-600 text-white rounded p-2 w-20 hover:scale-95" onClick={() => {
                                                document.getElementById("search-doctorName").value = ""
                                                document.getElementById("search-hospitalName").value = ""
                                                document.getElementById("search-keywords").value = ""
                                                setDateRange({ from: null, to: null })
                                                document.getElementById("search-sort").value = "DESC"
                                                setLoading(true)
                                                setShowFilter(false)
                                            }}>
                                                Reset
                                            </button>
                                            <button className="bg-purple-500 text-white rounded p-2 w-20 hover:scale-95" onClick={() => { setLoading(true) }}>
                                                Search
                                            </button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                    <div className="flex flex-row gap-5 w-full justify-start items-center flex-wrap bg-slate-100 rounded-md border-gray-700 min-h-48 p-4 flex-1">
                        {loading ?
                            <div className="flex flex-col justify-center items-center w-full h-full">
                                <Loader2 className=" size-44 p-8 text-purple-600 animate-spin" />
                            </div>
                            :
                            <>
                                {(data?.content?.length === 0) &&
                                    <h2 className="text-xl w-full text-center font-semibold">
                                        No Documents Found
                                    </h2>
                                }
                                {data?.content?.map((doc, index) => (
                                    <Link prefetch={true} href={pagePaths.dashboardPages.prescriptionVaultPageById(doc.id)} key={index} className="flex flex-col gap-2 w-64 h-80 p-2 bg-white rounded-md border border-gray-700 items-center">
                                        <div className="w-full h-40 rounded-l-md overflow-hidden flex justify-center relative">
                                            <Image
                                                src={doc.fileLink}
                                                fill={true}
                                                className="w-full h-full object-contain object-center rounded-l-md"
                                                alt="Blog Image"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-between">
                                            <span className="text-base text-gray-800 flex gap-1 items-center">
                                                <FaUserDoctor size={16} />
                                                {doc.doctorName}
                                            </span>
                                            <span className="text-base text-gray-800 flex gap-1 items-center">
                                                <HospitalIcon size={16} />
                                                {doc.hospitalName}
                                            </span>
                                        </div>
                                        <div className="flex flex-row justify-between">
                                            <span className="text-sm text-gray-800 flex gap-1 items-center">
                                                <CalendarIcon size={16} />
                                                {format(doc.date, "LLL dd, y")}
                                            </span>
                                        </div>
                                        <div className="flex flex-row justify-between">
                                            <span className="text-sm text-gray-800 flex gap-1 items-center line-clamp-2">
                                                {doc.keywords.join(", ")}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                                }
                            </>
                        }
                    </div>
                    <div className="flex flex-col w-full items-center mb-5">
                        <Pagination
                            count={data?.page?.totalPages}
                            page={currentPage}
                            onChange={(event, page) => {
                                setCurrentPage(page)
                                setLoading(true)
                            }}
                            variant="outlined"
                            color="secondary"
                            shape="rounded"
                            boundaryCount={2} />
                    </div>
                </div>
            </div>
        </div>
    )
}