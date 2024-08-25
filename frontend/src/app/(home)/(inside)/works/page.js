'use client'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { generateFormattedDate, radicalGradient, worksUrl } from "@/utils/constants"
import { set } from "lodash"
import { CalendarIcon } from "lucide-react"
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
    const [works, setWorks] = useState([])
    const [pageInfo, setPageInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({
        startDate: '',
        endDate: '',
        tags: '',
        userId: '',
        status: '',
        providerId: '',
        address: '',
        sortDirection: "ASC",
        pageNo: 0
    })
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
    })
    const tagsOptions = [{ label: "Doctor", value: "DOCTOR" }, { label: "Nursing", value: "NURSING" }]
    const [selectedTags, setSelectedTags] = useState([])

    useEffect(() => {
        axiosInstance.get(worksUrl, { params: filter }).then(res => {
            setWorks(res.data?.content)
            setPageInfo(res.data?.page)
        }).catch(err => {
            console.error(err)
        }).finally(() => {
            setLoading(false)
        })
    }, [filter])

    return (
        <div className={cn(radicalGradient, "from-slate-200 to-slate-100 p-4 flex flex-col items-center w-full flex-1 gap-6")}>
            <div className="w-full bg-white p-4 rounded flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-center">Works</h1>
                <div className="flex flex-col gap-4">
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
                                className="w-60"
                                onChange={(selected) => setSelectedTags(selected)}
                                components={animatedComponents}
                                closeMenuOnSelect={false}
                                hideSelectedOptions
                                value={selectedTags}
                            />
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <span>
                                User Id
                            </span>
                            <input
                                type="number"
                                id="user-id"
                                className="w-24 p-2 border border-gray-500 shadow-inner rounded-md number-input"
                            />
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <span>
                                Provider Id
                            </span>
                            <input
                                type="number"
                                id="provider-id"
                                className="w-24 p-2 border border-gray-500 shadow-inner rounded-md number-input"
                            />
                        </div>
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
                    </div>
                    <div className="flex flex-row gap-5 flex-wrap">
                        <button className="p-2 bg-blue-500 text-white rounded-md hover:scale-95" onClick={() => {
                            setFilter({
                                ...filter,
                                startDate: generateFormattedDate(dateRange.from),
                                endDate: generateFormattedDate(dateRange.to),
                                tags: selectedTags.map(tag => tag.value).join(","),
                                userId: document.getElementById("user-id").value,
                                providerId: document.getElementById("provider-id").value,
                                address: document.getElementById("address").value,
                            })
                        }}>Filter</button>
                        <button className="p-2 bg-red-500 text-white rounded-md hover:scale-95" onClick={() => {
                            setFilter({
                                startDate: '',
                                endDate: '',
                                tags: '',
                                userId: '',
                                status: '',
                                providerId: '',
                                address: '',
                                sortDirection: "ASC",
                                pageNo: 0
                            })
                            setDateRange({
                                from: null,
                                to: null,
                            })
                            setSelectedTags([])
                            document.getElementById("user-id").value = ''
                            document.getElementById("provider-id").value = ''
                            document.getElementById("address").value = ''
                        }}>Clear</button>
                    </div>
                </div>
            </div>
        </div>
    )
}