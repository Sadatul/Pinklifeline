'use client'

import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { getHospitalsAnonymousUrl, getMedicalTestAnonymousUrl, hospitalByIdUrl, hospitalReviewSummaryUrl, hospitalReviewsUrl, medicalTestHospitalAnonymousUrl, pagePaths, radicalGradient, roles, round } from "@/utils/constants"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { useCallback, useEffect, useState } from "react"
import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';
import { debounce, set } from "lodash"
import Loading from "./loading"
import { ArrowLeft, ChevronDown, ChevronRight, ChevronUp, ExternalLink, Filter, Loader2, MoveLeft, Pencil, Plus, Star, StarHalf, Trash2 } from "lucide-react"
import { Pagination } from "@mui/material"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import ScrollableContainer from "./StyledScrollbar"
import { useSessionContext } from "../context/sessionContext"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"

const animatedComponents = makeAnimated();

export function HospitalsComponent({ isAdmin }) {
    const sessionContext = useSessionContext()
    const [isMounted, setIsMounted] = useState(false)
    const [showFilters, setShowFilters] = useState(isAdmin)
    const [hospitals, setHospitals] = useState([])
    const [loading, setLoading] = useState(true)
    const [pageInfo, setPageInfo] = useState(null)
    const [filter, setFilter] = useState({
        name: null,
        location: null,
        id: null,
        testIds: null,
        sortDirection: 'DESC',
        pageNo: 0

    })
    const [selectedTests, setSelectedTests] = useState([])
    const [sheetOpen, setSheetOpen] = useState(false)
    const router = useRouter()

    const getTestOptions = (inputValue) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                axiosInstance.get(getMedicalTestAnonymousUrl, { params: { name: inputValue.trim() } }).then((response) => {
                    const options = response.data?.map((test) => ({ value: test.id, label: test.name }));
                    resolve(options);
                }).catch((error) => {
                    console.log(error);
                    resolve([]);
                });
            }, 500);
        })
    }

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (loading) {
            console.log(filter)
            axiosInstance.get(getHospitalsAnonymousUrl, { params: filter }).then((response) => {
                console.log(response)
                setHospitals(response.data?.content)
                setPageInfo(response.data?.page)
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setLoading(false)
                setSheetOpen(false)
            })
        }
    }, [filter, loading])

    if (!isMounted) {
        return null
    }

    return (
        <ScrollableContainer className={cn("flex flex-col w-full h-full items-center p-4 flex-1 gap-1 overflow-x-hidden bg-gray-100")} >
            <div className="rounded flex flex-col w-full items-start px-9">
                <div className="flex flex-row items-center gap-2">
                    <button className="w-fit bg-white border border-gray-400 shadow-inner p-2 hover:scale-95 transition-all rounded-full" onClick={() => {
                        console.log('back')
                        if (isAdmin) {
                            window.location.href = pagePaths.unverifiedDoctorsPageForAdmin
                        }
                        else if (sessionContext?.sessionData?.userId) {
                            router.push(pagePaths.dashboardPages.userdetailsPage)
                        }
                        else {
                            window.location.href = pagePaths.baseUrl
                        }
                    }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">Hospitals</h1>
                </div>
            </div>
            <div className="flex flex-col w-full gap-2 px-10 py-2 flex-1">
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-row justify-end items-center w-full gap-3">
                        <select disabled={loading} id="sortDirection" defaultValue={filter.sortDirection} className="border px-3 py-1 border-gray-300 w-36 shadow-inner rounded-xl" onChange={(e) => {
                            setFilter({ ...filter, sortDirection: e.target.value, pageNo: 0 })
                            setLoading(true)
                        }}>
                            <option value="ASC">Ascending</option>
                            <option value="DESC">Descending</option>
                        </select>
                        {isAdmin &&
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href={pagePaths.addHospitalPage}>
                                            <Plus size={28} className="text-gray-800 cursor-pointer" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to add a new hospital</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        }
                        {!isAdmin &&
                            <div className="flex flex-row gap-2 items-center">
                                <Link href={pagePaths.compareHospitalsPage} prefetch={true} className="text-gray-900 font-semibold rounded px-2 py-1 hover:underline flex items-center gap-1">Compare Hospitals <ExternalLink size={16} /> </Link>
                                {/* <Link href={pagePaths.compareTestsUserPage} className="text-gray-700 font-semibold bg-white border border-gray-600 rounded px-2 py-1 hover:underline flex items-center gap-1">Compare Tests <ExternalLink size={16} /> </Link> */}
                            </div>
                        }
                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <button className="bg-pink-700 border-gray-200 px-5 hover:scale-95 py-1 rounded-2xl text-white" onClick={() => {
                                    setSheetOpen(true)
                                }}>
                                    <Filter size={20} className="text-white" />
                                </button>
                            </SheetTrigger>
                            <SheetContent className="flex flex-col justify-between h-full">
                                <SheetHeader>
                                    <SheetTitle>Filter</SheetTitle>
                                    <SheetDescription>
                                        Add other filters to your search
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="flex flex-col gap-6 p-5 text-lg flex-1">
                                    <input autoComplete="off" id="name" type="text" placeholder="Name" defaultValue={filter.name} className="border px-4 focus:outline-gray-500 py-1 border-gray-300 w-full text-base shadow-inner rounded-2xl" />
                                    <input autoComplete="off" id="location" type="text" placeholder="Location" defaultValue={filter.location} className="border px-4 focus:outline-gray-500 py-1 border-gray-300 w-full text-base shadow-inner rounded-2xl" />
                                    <AsyncSelect
                                        cacheOptions
                                        isMulti
                                        components={animatedComponents}
                                        closeMenuOnSelect={false}
                                        value={selectedTests}
                                        onChange={(selected) => setSelectedTests(selected)}
                                        loadOptions={getTestOptions}
                                        className="w-full text-base rounded-xl"
                                        placeholder="Tests"
                                    />
                                </div>
                                <SheetFooter>
                                    <div className="flex flex-row justify-between items-center w-full">
                                        <Button className="bg-red-500 text-white rounded-2xl hover:text-red-500 hover:scale-95 hover:border hover:border-red-500" size="lg" variant={"outline"} onClick={() => {
                                            setSelectedTests([])
                                            document.getElementById('name').value = ''
                                            document.getElementById('location').value = ''

                                        }}>
                                            Reset
                                        </Button>
                                        <Button size="lg" className="hover:scale-95 hover:border hover:bg-white shadow-inner hover:text-black rounded-2xl" onClick={() => {
                                            setFilter({
                                                ...filter,
                                                name: document.getElementById('name').value.trim() === '' ? null : document.getElementById('name').value?.trim(),
                                                location: document.getElementById('location').value.trim() === '' ? null : document.getElementById('location').value?.trim(),
                                                testIds: selectedTests.length > 0 ? selectedTests.map((test) => test.value).join(',') : null,
                                                pageNo: 0
                                            })
                                            setLoading(true)
                                        }} >
                                            Apply
                                        </Button>
                                    </div>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                    <Separator className="bg-pink-400 h-[1.3px]" />
                </div>
                <div className="flex flex-col gap-3 w-full px-3 py-2 rounded drop-shadow-md flex-1 justify-between drop-shadow-none">
                    <div className="flex flex-col w-full gap-3">
                        {loading && <div className="flex flex-row justify-center items-center w-full"><Loader2 size={44} className="animate-spin" /></div>}
                        {!loading && hospitals.length === 0 && <div className="flex flex-row justify-center items-center w-full h-32 text-xl font-semibold">No hospitals found</div>}
                        {!loading && hospitals.length > 0 && hospitals.map((hospital, index) => (
                            <HospitalCard key={index} hospital={hospital} isAdmin={isAdmin} setFetchLoading={setLoading} fetching={loading} />
                        ))}
                    </div>
                    <div className="flex flex-row justify-center items-center w-full p-2">
                        <Pagination
                            count={pageInfo?.totalPages}
                            page={filter.pageNo + 1}
                            showLastButton
                            showFirstButton
                            onChange={(e, page) => {
                                setFilter({ ...filter, pageNo: page - 1 });
                                setLoading(true)
                            }}
                            className="m-auto"
                            color="secondary"
                            size="large"
                        />
                    </div>
                </div>
            </div>
        </ScrollableContainer>
    )
}

function HospitalCard({ hospital, isAdmin, setFetchLoading, fetching }) {
    const [reviewInfo, setReviewInfo] = useState(null)
    const [ratingIcon, setRatingIcon] = useState(null)
    const sessionContext = useSessionContext()

    useEffect(() => {
        if (sessionContext?.sessionData?.userId && (sessionContext?.sessionData?.role !== roles.admin)) {
            axiosInstance.get(hospitalReviewSummaryUrl(hospital.id)).then((res) => {
                console.log("Hospital review info ", res.data)
                setReviewInfo(res.data)
            }).catch((error) => {
                console.log(error)
            })
        }
    }, [sessionContext?.sessionData])

    useEffect(() => {
        if (reviewInfo) {
            setRatingIcon(reviewInfo.averageRating <= 2.5 ? <Star strokeWidth={1.5} size={24} className={cn(" text-transparent text-[#FFD700]")} /> : reviewInfo.averageRating < 4 ? <StarHalf size={24} fill="#FFD700" className={cn("text-transparent")} /> : <Star size={24} fill="#FFD700" className={cn("text-transparent")} />)
        }
    }, [reviewInfo])

    return (
        <div className="flex flex-col gap-4 p-5 bg-white rounded-xl relative">
            {(sessionContext?.sessionData?.userId) && !isAdmin &&
                <span className="absolute top-2 right-2 bg-transparent px-2 py-1 rounded-md flex flex-row items-center gap-2">{ratingIcon} {round(reviewInfo?.averageRating)}</span>
            }
            {isAdmin &&
                <div className="flex flex-row gap-5  items-center right-2 top-2 absolute">
                    <Link prefetch href={pagePaths.addTestHospitalpage(hospital.id)} className="border bg-zinc-800 text-white px-2 py-1 rounded-md w-fit">
                        See Details
                    </Link>
                    <button className="" disabled={fetching} onClick={() => {
                        window.open(pagePaths.updateHospitalsPage(hospital.id), '_blank')
                    }}>
                        <Pencil scale={16} className="text-blue-500" />
                    </button>
                    <button className="" disabled={fetching} onClick={() => {
                        // delete hospital
                        axiosInstance.delete(hospitalByIdUrl(hospital.id)).then((response) => {
                            console.log(response.data)
                            setFetchLoading(true)
                        }).catch((error) => {
                            console.log(error)
                        })
                    }}>
                        <Trash2 scale={16} className="text-red-500" />
                    </button>
                </div>
            }
            <div className="flex flex-row flex-wrap">
                <div className="flex flex-col gap-2 w-1/2">
                    <Link href={pagePaths.hospitalByIdPage(hospital.id)} className="flex flex-row gap-2 hover:underline">
                        <span className="font-bold w-24">Name:</span>
                        <span>{hospital.name}</span>
                    </Link>
                    <div className="flex flex-row gap-2">
                        <span className="font-bold w-24">Email:</span>
                        <span>{hospital.email}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                    <div className="flex flex-row gap-2">
                        <span className="font-bold w-20">Location:</span>
                        <span>{hospital.location}</span>
                    </div>
                    <div className="flex flex-row gap-2">
                        <span className="font-bold w-20">Contact:</span>
                        <span>{hospital.contactNumber}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
