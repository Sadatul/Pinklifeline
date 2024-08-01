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
import { act, useEffect, useState } from "react"
import Image from "next/image"
import ScrollableContainer from "@/app/components/StyledScrollbar"
import { Pagination } from "@mui/material"

export default function PrescriptionVaultPage() {
    const animatedComponents = makeAnimated();
    const [documents, setDocuments] = useState([])
    const serachke
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
        const docs = []
        for (let i = 0; i < 5; i++) {
            docs.push({
                fileLink: "https://via.placeholder.com/150",
                doctorName: "Dr. John Doe",
                hospitalName: "Hospital Name",
                date: addDays(new Date(), i),
                keywords: ["kidney", "pain"]
            })
        }
        setDocuments(docs)
    }, [])

    useEffect(() => {
        console.log("page changed ", currentPage)
    }, [currentPage])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleFilter = () => {
        console.log(document.getElementById("search-keywords"))
    }

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
                            <input id="search-doctorName" type="text" className="border shadow-inner border-purple-500 text-gray-800 rounded" />
                        </label>
                        <label className="flex flex-col justify-evenly">
                            Hospital Name
                            <input id="search-hospitalName" type="text" className="border shadow-inner border-purple-500 text-gray-800 rounded" />
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
                            <select defaultValue={"ASC"} className="border shadow-inner border-purple-500 text-gray-800 rounded p-2">
                                <option value="ASC">Ascending</option>
                                <option value="DSC">Descending</option>
                            </select>
                        </label>
                    </div>
                    <button className="bg-purple-500 text-white rounded p-2 w-20 hover:scale-95" onClick={handleFilter}>
                        Search
                    </button>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-lg">
                        Documents
                    </h2>
                    <div className="flex flex-row gap-5 w-full justify-start items-center flex-wrap bg-gray-200 rounded-md border-gray-700 min-h-48 p-4">
                        {documents?.length === 0 &&
                            <h2 className="text-lg w-full text-center">
                                No Documents Found
                            </h2>
                        }
                        {documents?.map((doc, index) => (
                            <div key={index} className="flex flex-col gap-2 w-52 p-2 bg-white rounded-md border border-gray-700 items-center">
                                <div className="relative w-full h-40 rounded-l-md overflow-hidden">
                                    <Image
                                        src={doc.fileLink}
                                        fill={true}
                                        className="w-full h-full object-left object-contain rounded-l-md"
                                        alt="Blog Image"
                                    />
                                </div>
                                <div className="flex flex-col justify-between">
                                    <span className="text-base text-gray-800">
                                        {doc.doctorName}
                                    </span>
                                    <span className="text-base text-gray-800">
                                        {doc.hospitalName}
                                    </span>
                                </div>
                                <div className="flex flex-row justify-between">
                                    <span className="text-sm text-gray-800">
                                        {format(doc.date, "LLL dd, y")}
                                    </span>
                                </div>
                                <div className="flex flex-row justify-between">
                                    <span className="text-sm text-gray-800">
                                        {doc.keywords.join(", ")}
                                    </span>
                                </div>
                            </div>
                        ))
                        }
                    </div>
                    <div className="flex flex-col w-full items-center mb-5">
                        <Pagination
                            count={10}
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