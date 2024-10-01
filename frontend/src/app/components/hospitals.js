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
import { ArrowLeft, ChevronDown, ChevronRight, ChevronUp, ExternalLink, Loader2, MoveLeft, Pencil, Plus, Star, StarHalf, Trash2 } from "lucide-react"
import { Pagination } from "@mui/material"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import ScrollableContainer from "./StyledScrollbar"
import { useSessionContext } from "../context/sessionContext"

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
            })
        }
    }, [filter, loading])

    if (!isMounted) {
        return null
    }

    return (
        <ScrollableContainer className={cn("flex flex-col w-full items-center p-4 flex-1 gap-3 overflow-x-hidden", radicalGradient, "from-zinc-200 to-slate-100")} >
            <div className="w-11/12 bg-white rounded p-3 flex flex-col gap-5 relative">
                <div className="flex flex-col items-center gap-2 w-full">
                    <div className="flex flex-row items-center gap-2">
                        <div className="flex flex-row gap-3 items-center">
                            <button className="w-fit bg-transparent" onClick={() => {
                                console.log('back')
                                if (isAdmin) {
                                    window.location.href = pagePaths.unverifiedDoctorsPageForAdmin
                                }
                                else if (sessionContext?.sessionData?.userId) {
                                    window.location.href = pagePaths.dashboardPages.userdetailsPage
                                }
                                else {
                                    window.location.href = pagePaths.baseUrl
                                }
                            }}>
                                <MoveLeft size={24} />
                            </button>
                            <h1 className="text-2xl font-bold">Hospitals</h1>
                        </div>
                        <TooltipProvider delayDuration={500}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="flex items-center gap-2 w-fit absolute right-5" onClick={() => setShowFilters(prev => !prev)}>
                                        {showFilters ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Click to toggle filters of hospitals</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Separator className="w-1/4 h-[1.5px] bg-gray-400" />
                </div>
                {showFilters &&
                    <div className="flex flex-col w-full gap-6 transition-all ease-linear duration-500">
                        <div className="flex flex-row gap-8 flex-wrap w-full">
                            <label className="flex flex-row gap-2 items-center">
                                <span>Name:</span>
                                <input autoComplete="off" id="name" type="text" className="border px-2 py-1 border-gray-400 w-52 shadow-inner rounded" />
                            </label>
                            <label className="flex flex-row gap-2 items-center">
                                <span>Location:</span>
                                <input autoComplete="off" id="location" type="text" className="border px-2 py-1 border-gray-400 w-52 shadow-inner rounded" />
                            </label>
                            <label className="flex flex-row gap-2 items-center">
                                <span>Tests</span>
                                <AsyncSelect
                                    cacheOptions
                                    isMulti
                                    components={animatedComponents}
                                    closeMenuOnSelect={false}
                                    value={selectedTests}
                                    onChange={(selected) => setSelectedTests(selected)}
                                    loadOptions={getTestOptions}
                                    className="min-w-80"
                                />
                            </label>
                        </div>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded w-fit" onClick={() => {
                            setFilter({
                                ...filter,
                                name: document.getElementById('name').value.trim() === '' ? null : document.getElementById('name').value?.trim(),
                                location: document.getElementById('location').value.trim() === '' ? null : document.getElementById('location').value?.trim(),
                                testIds: selectedTests.length > 0 ? selectedTests.map((test) => test.value).join(',') : null,
                                pageNo: 0
                            })
                            setLoading(true)
                        }}>
                            Search
                        </button>
                    </div>
                }
            </div>
            <div className="flex flex-col w-11/12 p-3 gap-2">
                <div className="flex flex-row justify-end items-center w-full gap-6">
                    <select disabled={loading} id="sortDirection" defaultValue={filter.sortDirection} className="border px-2 py-1 border-gray-400 w-36 shadow-inner rounded" onChange={(e) => {
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
                            <Link href={pagePaths.compareHospitalsPage} className="text-gray-700 font-semibold bg-white border border-gray-600 rounded px-2 py-1 hover:underline flex items-center gap-1">Compare Hospitals <ExternalLink size={16} /> </Link>
                            {/* <Link href={pagePaths.compareTestsUserPage} className="text-gray-700 font-semibold bg-white border border-gray-600 rounded px-2 py-1 hover:underline flex items-center gap-1">Compare Tests <ExternalLink size={16} /> </Link> */}
                        </div>
                    }
                </div>
                <div className="flex flex-col gap-3 w-full bg-white p-5 rounded">
                    {loading && <div className="flex flex-row justify-center items-center w-full"><Loader2 size={44} className="animate-spin" /></div>}
                    {!loading && hospitals.length === 0 && <div className="flex flex-row justify-center items-center w-full h-32">No hospitals found</div>}
                    {!loading && hospitals.length > 0 && hospitals.map((hospital, index) => (
                        <HospitalCard key={index} hospital={hospital} isAdmin={isAdmin} setFetchLoading={setLoading} fetching={loading} />
                    ))}
                    <div className="flex flex-row justify-center items-center w-full">
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
                            variant="outlined"
                            color="secondary"
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
        <div className="flex flex-col gap-4 p-3 bg-gray-100 rounded relative">
            {(sessionContext?.sessionData?.userId) && !isAdmin &&
                <span className="absolute top-2 right-2 bg-transparent px-2 py-1 rounded-md flex flex-row items-center gap-2">{ratingIcon} {round(reviewInfo?.averageRating)}</span>
            }
            {isAdmin &&
                <div className="flex flex-row gap-5  items-center right-2 top-2 absolute">
                    <Link href={pagePaths.addTestHospitalpage(hospital.id)} className="border bg-zinc-800 text-white px-2 py-1 rounded-md">
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
