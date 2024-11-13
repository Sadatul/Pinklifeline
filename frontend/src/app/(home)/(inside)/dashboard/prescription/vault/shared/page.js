'use client'

import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Clock, Infinity } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import ReactSelect from "react-select"
import makeAnimated from 'react-select/animated';
import { act, Suspense, useEffect, useRef, useState } from "react"
import Image from "next/image"
import ScrollableContainer from "@/app/components/StyledScrollbar"
import { Pagination } from "@mui/material"
import { addReportUrl, capitalizeFirstLetter, cleanString, generateFormattedDate, getImageDimensions, pagePaths, shareReportUrl } from "@/utils/constants"
import axiosInstance from "@/utils/axiosInstance"
import { FaUserDoctor } from "react-icons/fa6"
import { HospitalIcon, Key, Loader2, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { set } from "lodash"
import { Separator } from "@radix-ui/react-dropdown-menu"
import Loading from "@/app/components/loading"
import { useSearchParams } from "next/navigation"
import CreatableSelect from 'react-select/creatable'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

function SharedReportsComponent() {
    const animatedComponents = makeAnimated();
    const searchParams = useSearchParams()
    const [data, setData] = useState(null)
    const [imageDimension, setImageDimension] = useState(null)
    const [selectedReport, setSelectedReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedKeywords, setSelectedKeywords] = useState([])
    const [keyWordsOption, setKeyWordsOption] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [isMounted, setIsMounted] = useState(false)
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
    })
    const [showfiler, setShowFilter] = useState(false)

    useEffect(() => {
        const handleFilter = () => {
            const doctorName = cleanString(document.getElementById("search-doctorName")?.value)
            const hospitalName = cleanString(document.getElementById("search-hospitalName")?.value)
            const patientUsername = cleanString(document.getElementById("search-patientUsername")?.value)
            const type = document.getElementById("search-type")?.value
            const startDate = generateFormattedDate(dateRange.from)
            const endDate = generateFormattedDate(dateRange.to)
            console.log("Filter params:", doctorName, hospitalName, patientUsername, type, startDate, endDate, selectedKeywords)
            setShowFilter(false)
            axiosInstance.get(shareReportUrl, {
                params: {
                    doctorName: doctorName === "" ? null : doctorName,
                    username: patientUsername === "" ? null : patientUsername,
                    hospitalName: hospitalName === "" ? null : hospitalName,
                    keywords: selectedKeywords.length === 0 ? null : selectedKeywords.map((keyword) => keyword.value).join(","),
                    startDate: startDate,
                    endDate: endDate,
                    type: type,
                    page: currentPage - 1
                }
            }).then((response) => {
                setData(response.data)
                setLoading(false)
                if (!isMounted) {
                    setIsMounted(true)
                }
                if (!selectedReport && searchParams.get("selectedReportId")) {
                    console.log("Selected Report Id", searchParams.get("selectedReportId"))
                    setSelectedReport(response.data.content.find((report) => String(report.reportId) === String(searchParams.get("selectedReportId"))))
                }
            }).catch((error) => {
                setLoading(false)
                console.log("Error from filter", error)
            })
        }
        if (loading) {
            handleFilter()
        }
    }, [loading])
    useEffect(() => {
        setLoading(true)
    }, [currentPage])

    useEffect(() => {
        const fetchImageDimensions = async (imgUrl) => {
            try {
                const { width, height } = await getImageDimensions(imgUrl);
                setImageDimension({ width, height });
            } catch (error) {
                console.error("Error fetching image dimensions:", error);
            }
        };
        if (selectedReport) {
            fetchImageDimensions(selectedReport.fileLink)
        }
    }, [selectedReport])



    return (
        <div className="flex flex-col w-full h-full px-3 py-5 gap-3">
            <h1 className="text-xl w-full text-center">
                Prescription/Reports Vault Page
            </h1>
            <div className="flex flex-col gap-2 w-full">

                <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-row justify-between items-center w-full">
                        <h2 className="text-lg">
                            Documents
                        </h2>
                        <Sheet open={showfiler} onOpenChange={(e) => {
                            setShowFilter(e)
                        }}>
                            <SheetTrigger asChild>
                                <button className="bg-pink-500 text-white rounded-2xl p-1 w-20  hover:scale-95 active:scale-50 transition-all ease-in-out duration-300" onClick={() => {
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
                                <div className="flex flex-col w-full gap-5 h-full p-3 rounded-md">
                                    <div className="flex flex-col gap-8 flex-wrap w-full justify-start flex-1">
                                        <input autoComplete="off" id="search-doctorName" placeholder="Doctor Name" type="text" className="border shadow-inner border-gray-300 focus:outline-gray-400 text-gray-900 rounded-xl px-3 py-2 w-full h-fit" />
                                        <input autoComplete="off" id="search-patientUsername" placeholder="Patient Username" type="text" className="border shadow-inner border-gray-300 focus:outline-gray-400 text-gray-900 rounded-xl px-3 py-2 w-full h-fit" />
                                        <input autoComplete="off" id="search-hospitalName" placeholder="Hospital Name" type="text" className="border shadow-inner border-gray-300 focus:outline-gray-400 text-gray-900 rounded-xl px-3 py-2 w-full h-fit" />
                                        {isMounted &&
                                            <CreatableSelect className="w-full border-gray-300 focus:outline-gray-400 border h-fit"
                                                id="search-keywords"
                                                options={keyWordsOption}
                                                isMulti={true}
                                                closeMenuOnSelect={false}
                                                value={selectedKeywords}
                                                components={animatedComponents}
                                                onChange={(newValue, actionMeta) => {
                                                    console.log(newValue, actionMeta)
                                                    setSelectedKeywords(newValue)
                                                }}
                                                onCreateOption={(keyword) => {
                                                    setKeyWordsOption(prev => [...prev, { value: keyword.trim(), label: capitalizeFirstLetter(keyword.trim()) }])
                                                    setSelectedKeywords([...selectedKeywords, { value: keyword.trim(), label: capitalizeFirstLetter(keyword.trim()) }])
                                                }}
                                                placeholder="Select Keywords..."
                                            />
                                        }
                                        <label className="flex flex-col gap-1">
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
                                        </label>
                                        <label className="flex flex-col justify-evenly">
                                            <select defaultValue={"ALL"} id="search-type" className="shadow-inner border-gray-300 focus:outline-gray-400 border text-gray-800 rounded-xl p-2">
                                                <option value="ALL">ALL Reports</option>
                                                <option value="UNLIMITED">Unlimited time</option>
                                                <option value="LIMITED">Limited time</option>
                                            </select>
                                        </label>
                                    </div>
                                    <div className="flex flex-row justify-center items-center gap-4 m-3">
                                        <button className="bg-gray-600 text-white rounded p-2 w-20 hover:scale-95" onClick={() => {
                                            document.getElementById("search-doctorName").value = ""
                                            document.getElementById("search-patientUsername").value = ""
                                            document.getElementById("search-hospitalName").value = ""
                                            document.getElementById("search-type").value = "ALL"
                                            setSelectedReport(null)
                                            setDateRange({
                                                from: null,
                                                to: null,
                                            })
                                            setSelectedKeywords([])
                                            setKeyWordsOption([])
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
                    <div className="flex flex-row gap-5 w-full justify-start items-center flex-wrap bg-blue-100 rounded-md border-gray-700 min-h-48 p-4">
                        {loading ?
                            <div className="flex flex-col justify-center items-center w-full h-full">
                                <Loader2 className=" size-44 p-8 text-purple-600 animate-spin" />
                            </div>
                            :
                            <>
                                {(data?.content?.length === 0) &&
                                    <h2 className="text-lg w-full text-center">
                                        No Documents Found
                                    </h2>
                                }
                                {data?.content?.map((doc, index) => (
                                    <div key={index} className="flex flex-col gap-2 w-64 p-2 bg-white rounded-md border border-gray-700 items-center cursor-pointer" onClick={() => {
                                        setSelectedReport(doc)
                                    }}>
                                        <div className="w-full h-40 rounded-l-md overflow-hidden flex justify-center relative">
                                            <Image
                                                src={doc.fileLink}
                                                fill={true}
                                                className="w-full h-full object-contain object-center rounded-l-md"
                                                alt="Blog Image"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-between w-full p-3">
                                            <span className="text-lg text-gray-800 flex justify-center gap-1 items-center text-center w-full">
                                                {doc.fullName}
                                            </span>
                                            <span className="text-base text-gray-800 flex gap-1 items-center">
                                                <FaUserDoctor size={16} />
                                                {doc.doctorName}
                                            </span>
                                            <span className="text-base text-gray-800 flex gap-1 items-center">
                                                <HospitalIcon size={16} />
                                                {doc.hospitalName}
                                            </span>
                                        </div>
                                        <div className="flex flex-row justify-between gap-5 items-center">
                                            <span className="text-sm text-black flex gap-1 items-center">
                                                <CalendarIcon size={16} />
                                                {format(doc.date, "LLL dd, y")}
                                            </span>
                                            <span className="text-sm text-gray-800 flex gap-1 items-center">
                                                <Clock size={16} />
                                                {doc.expirationTime ? `${doc.expirationTime} hrs` : <Infinity size={16} />}
                                            </span>
                                        </div>
                                    </div>
                                ))
                                }
                            </>
                        }
                    </div>
                    {(data?.content?.length > 0) &&
                        <div className="flex flex-col w-full items-center mb-5">
                            <Pagination
                                count={data?.page?.totalPages}
                                page={currentPage}
                                onChange={(event, page) => setCurrentPage(page)}
                                variant="outlined"
                                color="secondary"
                                shape="rounded"
                                boundaryCount={2} />
                        </div>
                    }
                </div>
            </div>
            {(data?.content?.length > 0) &&
                <div className="flex flex-col gap-2 w-full bg-purple-100 rounded-md">
                    <div className="flex flex-row gap-2 w-full justify-between px-5 py-2">
                        <h2 className="text-2xl text-black">Selected Report</h2>
                        {selectedReport &&
                            <button className="bg-red-500 text-white rounded p-2 w-44 hover:scale-95" onClick={() => {
                                setSelectedReport(null)
                            }}>
                                Remove Selected
                            </button>
                        }
                    </div>
                    <div className={cn("flex flex-col gap-7 w-full rounded-md p-2 overflow-hidden transition-[max-height] ease-in-out duration-500", selectedReport ? "max-h-full" : "max-h-12")}>
                        {selectedReport ?
                            <>
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-xl font-semibold">Details</h2>
                                    <Separator className="w-1/3 h-[1.5px] bg-gray-400" />
                                    <div className="flex flex-col gap-2">
                                        <span className="text-lg flex gap-1 items-center font-semibold">Shared By: {selectedReport.fullName}</span>
                                        <span className="text-lg flex gap-1 items-center">Doctor Name: {selectedReport.doctorName}</span>
                                        <span className="text-lg flex gap-1 items-center">Hospital Name: {selectedReport.hospitalName}</span>
                                        <span className="text-lg flex gap-1 items-center"> <CalendarIcon size={24} /> {selectedReport.date}</span>
                                        <span className="text-lg flex gap-1 items-center"> <Clock size={24} /> {selectedReport.expirationTime ? `${selectedReport.expirationTime} hrs` : <Infinity size={24} />}</span>
                                        <span className="text-xl font-semibold mt-2" >Summary</span>
                                        <Separator className="w-1/3 h-[1.5px] bg-gray-400" />
                                        <span className="text-lg flex-col gap-1 items-center">{selectedReport.summary}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-center">
                                    <h3 className="text-2xl font-semibold">Prescription/Report Image</h3>
                                    {imageDimension ?
                                        <Image src={selectedReport.fileLink} alt="Prescription" width={imageDimension.width} height={imageDimension.height} className=" border-4 border-purple-200" />
                                        :
                                        <LoaderCircle size={44} className="text-purple-500 animate-spin" />
                                    }
                                </div>
                            </>
                            : <h2 className="text-lg text-center">No Report Selected</h2>
                        }
                    </div>
                </div>
            }
        </div>
    )
}

export default function SharedReportsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <SharedReportsComponent />
        </Suspense>
    )
}