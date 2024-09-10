'use client'

import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Infinity } from "lucide-react"
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
import { addReportUrl, cleanString, generateFormattedDate, getImageDimensions, pagePaths, shareReportUrl } from "@/utils/constants"
import axiosInstance from "@/utils/axiosInstance"
import { FaUserDoctor } from "react-icons/fa6"
import { HospitalIcon, Key, Loader2, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { set } from "lodash"
import { Separator } from "@radix-ui/react-dropdown-menu"
import Loading from "@/app/components/loading"
import { useSearchParams } from "next/navigation"

function SharedReportsComponent() {
    const animatedComponents = makeAnimated();
    const searchParams = useSearchParams()
    const [data, setData] = useState(null)
    const [imageDimension, setImageDimension] = useState(null)
    const [selectedReport, setSelectedReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const selectedKeywords = useRef([])
    const [currentPage, setCurrentPage] = useState(1)
    const [isMounted, setIsMounted] = useState(false)
    const keyWordsOption = [
        { value: 'kidney', label: 'Kidney' },
        { value: 'acl', label: 'ACL' },
        { value: 'knee', label: 'Knee' },
        { value: 'pain', label: 'Pain' },
    ]
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
    })


    useEffect(() => {
        const handleFilter = () => {
            const doctorName = cleanString(document.getElementById("search-doctorName")?.value)
            const hospitalName = cleanString(document.getElementById("search-hospitalName")?.value)
            const type = document.getElementById("search-type")?.value
            const startDate = generateFormattedDate(dateRange.from)
            const endDate = generateFormattedDate(dateRange.to)
            axiosInstance.get(shareReportUrl, {
                params: {
                    doctorName: doctorName,
                    hospitalName: hospitalName,
                    keywords: selectedKeywords.current.map((keyword) => keyword.value),
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
    }, [currentPage, loading])

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
                <div className="flex flex-col w-full gap-2 bg-blue-50 p-3 rounded-md">
                    <h2 className="text-lg">
                        Filter
                    </h2>
                    <div className="flex flex-row gap-2 flex-wrap w-full justify-start">
                        <label className="flex flex-col justify-evenly">
                            Doctor Name
                            <input autoComplete="off" id="search-doctorName" type="text" className="border shadow-inner border-purple-500 text-gray-800 rounded" />
                        </label>
                        <label className="flex flex-col justify-evenly">
                            Doctor Username
                            <input autoComplete="off" id="search-doctorUsername" type="text" className="border shadow-inner border-purple-500 text-gray-800 rounded" />
                        </label>
                        <label className="flex flex-col justify-evenly">
                            Hospital Name
                            <input autoComplete="off" id="search-hospitalName" type="text" className="border shadow-inner border-purple-500 text-gray-800 rounded" />
                        </label>
                        {isMounted ?
                            <label className="flex flex-col gap-1">
                                Select Keywords
                                <ReactSelect className="w-64 border-purple-500 border rounded"
                                    id="search-keywords"
                                    options={keyWordsOption}
                                    isMulti={true}
                                    closeMenuOnSelect={false}
                                    components={animatedComponents}
                                    onChange={(newValue, actionMeta) => {
                                        console.log(newValue, actionMeta)
                                        selectedKeywords.current = newValue
                                    }}
                                />
                            </label>
                            : <></>
                        }
                        <label className="flex flex-col gap-1">
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
                        </label>
                        <label className="flex flex-col justify-evenly">
                            Type
                            <select defaultValue={"ALL"} id="search-type" className="border shadow-inner border-purple-500 text-gray-800 rounded p-2">
                                <option value="ALL">ALL Reports</option>
                                <option value="UNLIMITED">Unlimited time</option>
                                <option value="LIMITED">Limited time</option>
                            </select>
                        </label>
                    </div>
                    <button className="bg-purple-500 text-white rounded p-2 w-20 hover:scale-95" onClick={() => { setLoading(true) }}>
                        Search
                    </button>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">
                        Documents
                    </h2>
                    <div className="flex flex-row gap-5 w-full justify-start items-center flex-wrap bg-blue-100 rounded-md border-gray-700 min-h-48 p-4">
                        {loading ?
                            <div className="flex flex-col justify-center items-center w-full h-full">
                                <Loader2 className=" size-44 p-8 text-purple-600 animate-spin" />
                            </div>
                            :
                            <>
                                {data?.empty === true &&
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
                </div>
            </div>
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
                                    <span className="text-lg flex gap-1 items-center"> <Calendar size={24} /> {selectedReport.date}</span>
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