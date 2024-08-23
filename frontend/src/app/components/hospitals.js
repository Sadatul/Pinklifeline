'use client'

import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { getHospitalsAnonymousUrl, getMedicalTestAnonymousUrl, hospitalByIdUrl, medicalTestHospitalAnonymousUrl, pagePaths, radicalGradient } from "@/utils/constants"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { useCallback, useEffect, useState } from "react"
import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';
import { debounce, set } from "lodash"
import Loading from "./loading"
import { ChevronDown, ChevronRight, ChevronUp, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react"
import { Pagination } from "@mui/material"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

const animatedComponents = makeAnimated();

export function HospitalsComponent({ isAdmin }) {
    const [isMounted, setIsMounted] = useState(false)
    const [hospitals, setHospitals] = useState([
        {
            "name": "City Medical College, Khulna",
            "contactNumber": "01738223344",
            "description": "A hospital with all kinds of facilities",
            "location": "Moylapota, Khulna",
            "id": 5,
            "email": "infos@gazimedicalcollege.com"
        },
    ])
    const [loading, setLoading] = useState(true)
    const [pageInfo, setPageInfo] = useState(null)
    const [filter, setFilter] = useState({
        name: null,
        location: null,
        id: null,
        testIds: null,
        sortDirection: 'ASC',
        pageNo: 0

    })
    const [selectedTests, setSelectedTests] = useState([])

    const getTestOptions = useCallback(
        debounce(async (searchText, callback) => {
            try {
                const response = await axiosInstance.get(getMedicalTestAnonymousUrl, { params: { name: searchText } });
                const options = response.data?.map((test) => ({ value: test.id, label: test.name }));
                callback(options);
            } catch (error) {
                console.log(error);
                callback([]);
            }
        }, 500), []);

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
        <div className={cn("flex flex-col w-full items-center p-4 flex-1 gap-3", radicalGradient, "from-zinc-200 to-slate-100")} >
            <div className="w-11/12 bg-white rounded p-3 flex flex-col gap-5">
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-2xl font-bold">Hospitals</h1>
                    <Separator className="w-1/4 h-[1.5px] bg-gray-400" />
                </div>
                <div className="flex flex-col w-full gap-6">
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
                                loadOptions={(inputValue, callback) => {
                                    getTestOptions(inputValue, callback);
                                }}
                                className="min-w-80"
                            />
                        </label>
                    </div>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded w-fit" onClick={() => {
                        setFilter({
                            ...filter,
                            name: document.getElementById('name').value === '' ? null : document.getElementById('name').value,
                            location: document.getElementById('location').value === '' ? null : document.getElementById('location').value,
                            testIds: selectedTests.length > 0 ? selectedTests.map((test) => test.value).join(',') : null,
                            pageNo: 0
                        })
                        setLoading(true)
                    }}>
                        Search
                    </button>
                </div>
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
                                        <ExternalLink size={28} className="text-gray-800 cursor-pointer" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>Click to add a new hospital</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
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
        </div>
    )
}

function HospitalCard({ hospital, isAdmin, setFetchLoading, fetching }) {
    const [tests, setTests] = useState([])
    const [loading, setLoading] = useState(true)
    const [showTests, setShowTests] = useState(false)
    const [pageInfo, setPageInfo] = useState(null)
    const [filter, setFilter] = useState({
        hospitalId: hospital.id,
        pageNo: 0
    })
    const getTests = useCallback(debounce(() => {
        axiosInstance.get(medicalTestHospitalAnonymousUrl, { params: { hospitalId: hospital.id } }).then((response) => {
            setTests(response.data?.content)
            setPageInfo(response.data?.page)
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            setLoading(false)
        })
    }, 500), [hospital.id])

    useEffect(() => {
        if (showTests) {
            setLoading(true)
            getTests()
        }
    }, [filter, showTests])

    return (
        <div className="flex flex-col gap-4 p-3 bg-gray-100 rounded relative">
            {isAdmin &&
                <div className="flex flex-row gap-5  items-center right-2 top-2 absolute">
                    <Link href={pagePaths.addTestHospitalpage(hospital.id)} className="border bg-zinc-800 text-white px-2 py-1 rounded-md">
                        Add Test
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
                    <div className="flex flex-row gap-2">
                        <span className="font-bold w-24">Name:</span>
                        <span>{hospital.name}</span>
                    </div>
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
            <div className="flex flex-row gap-2">
                <span className="font-bold w-24">Description:</span>
                <span>{hospital.description}</span>
            </div>
            <div>
                <button
                    className="text-gray-700 rounded flex items-center text-base"
                    onClick={() => {
                        setShowTests((prev) => !prev);
                    }}
                >
                    Get Tests
                    {!showTests ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                </button>
                <div
                    className={cn(
                        "flex flex-col gap-2 w-full items-center transition-transform duration-700 ease-in-out overflow-hidden",
                        showTests ? "transform scale-y-100" : "transform scale-y-0",
                        !loading && "bg-white"
                    )}
                    style={{ transformOrigin: 'top' }}
                >
                    {showTests && (
                        <>
                            {loading && (
                                <div className="flex flex-row justify-center items-center w-72">
                                    <Loading chose="dots" />
                                </div>
                            )}
                            {!loading && tests.length === 0 && (
                                <div className="flex flex-row justify-center items-center w-full">
                                    No tests found
                                </div>
                            )}
                            {!loading && tests.length > 0 && tests.map((test, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-2 p-2 border-b border-gray-700 w-11/12">
                                    <TooltipProvider delayDuration={300}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="font-bold w-fit">{test.name}</span>
                                            </TooltipTrigger>
                                            <TooltipContent side='right'>{test.description}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <span>{test.fee} Taka</span>
                                </div>
                            ))}
                            <div
                                className={cn(
                                    "flex flex-row justify-center items-center w-full pb-3",
                                    loading && "hidden"
                                )}
                            >
                                <Pagination
                                    count={pageInfo?.totalPages}
                                    page={filter.pageNo + 1}
                                    showLastButton
                                    showFirstButton
                                    onChange={(e, page) => {
                                        setFilter({ ...filter, pageNo: page - 1 });
                                    }}
                                    className="m-auto"
                                    variant="outlined"
                                    color="primary"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// Query params: name=adil
// Query params: location=sdfasdfsdfsdf
// Query params: id=1
// Query params: testIds=2,3
// Query params: sortDirection=ASC
// Query params: pageNo=0
