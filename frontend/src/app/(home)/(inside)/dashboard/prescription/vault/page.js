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
import { addReportUrl, cleanString, generateFormattedDate, pagePaths } from "@/utils/constants"
import axiosInstance from "@/utils/axiosInstance"
import { FaUserDoctor } from "react-icons/fa6"
import { HospitalIcon, Key, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PrescriptionVaultPage() {
    const animatedComponents = makeAnimated();
    const [data, setData] = useState(null)
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
        console.log("fetching documents")
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
    }, [])

    useEffect(() => {
        const handleFilter = () => {
            const doctorName = cleanString(document.getElementById("search-doctorName")?.value)
            const hospitalName = cleanString(document.getElementById("search-hospitalName")?.value)
            const sort = document.getElementById("search-sort")?.value
            const startDate = generateFormattedDate(dateRange.from)
            const endDate = generateFormattedDate(dateRange.to)
            axiosInstance.get(addReportUrl, {
                params: {
                    doctorName: doctorName,
                    hospitalName: hospitalName,
                    keywords: selectedKeywords.current.map((keyword) => keyword.value),
                    startDate: startDate,
                    endDate: endDate,
                    sort: sort,
                    page: currentPage - 1
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
    }, [currentPage, loading])



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
                    <div className="flex flex-row gap-2 flex-wrap w-full justify-evenly">
                        <label className="flex flex-col justify-evenly">
                            Doctor Name
                            <input autoComplete="off" id="search-doctorName" type="text" className="border shadow-inner border-purple-500 text-gray-800 rounded" />
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
                            Sort
                            <select defaultValue={"ASC"} id="search-sort" className="border shadow-inner border-purple-500 text-gray-800 rounded p-2">
                                <option value="ASC">Ascending</option>
                                <option value="DSC">Descending</option>
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
                                    <Link prefetch={true} href={pagePaths.dashboardPages.prescriptionVaultPageById(doc.id)} key={index} className="flex flex-col gap-2 w-64 p-2 bg-white rounded-md border border-gray-700 items-center">
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
                                            <span className="text-sm text-gray-800 flex gap-1 items-center">
                                                <Key size={20} />
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
                            count={data?.totalPages}
                            page={currentPage}
                            onChange={(event, page) => setCurrentPage(page)}
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