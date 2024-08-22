'use client'

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import axiosInstance from "@/utils/axiosInstance";
import { getMedicalTestAnonymousUrl, medicalTestAdminUrl, medicalTestByIdAdminUrl, pagePaths, radicalGradient } from "@/utils/constants";
import { Pagination } from "@mui/material";
import axios from "axios";
import { Check, Loader2, Pencil, RefreshCcw, RotateCcw, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function AddMedicalTestsPage() {
    const [testsAdded, setTestsAdded] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        name: null,
        desc: true,
        sortDirection: "ASC",
    });
    

    useEffect(() => {
        if (loading) {
            axiosInstance.get(getMedicalTestAnonymousUrl, {
                params: filter
            }).then((response) => {
                setTestsAdded(response.data)
            }).catch((error) => {
                toast.error("Failed to load tests");
                console.log(error);
            }).finally(() => {
                setLoading(false);
            })
        }
    }, [loading])

    return (
        <div className={cn(radicalGradient, "flex flex-col w-full flex-1 gap-10 items-center p-4 from-slate-200 to-slate-100")}>
            <div className="w-10/12 flex flex-col p-4 gap-4 rounded-md bg-white">
                <h1 className="text-2xl text-black">Add Medical Tests</h1>
                <label className="flex flex-row w-fit gap-2 items-center">
                    <span className="w-32 text-base">
                        Test Name
                    </span>
                    <input autoComplete="off" type="text" id="testName" className="w-80 px-2 py-1 border border-gray-300 rounded-md shadow-inner" />
                </label>
                <label className="flex flex-row w-fit gap-2 items-center">
                    <span className="w-32 text-base">
                        Test Description
                    </span>
                    <textarea autoComplete="off" type="text" id="testDescription" className="w-80 px-2 py-1 border border-gray-300 rounded-md shadow-inner" />
                </label>
                <span id="error-msg" className="text-red-500 text-sm hidden">*All fields are required</span>
                <div className="flex flex-col gap-2 w-full">
                    <Separator className="w-full h-[1.5px] bg-gray-500" />
                    <div className="flex flex-row px-10 w-full justify-end gap-10">
                        <Link href={pagePaths.hospitalsPage} className="border text-center p-2 border-gray-500 rounded w-20 shadow-inner bg-gray-100 text-black hover:scale-95 transform transition" >
                            Cancel
                        </Link>
                        <button className="border border-gray-500 rounded w-20 shadow-inner p-2 bg-gray-700 text-gray-100 hover:scale-95 transform transition" onClick={() => {
                            const name = document.getElementById("testName").value;
                            const description = document.getElementById("testDescription").value;
                            if (name === "" || description === "") {
                                document.getElementById("error-msg").classList.remove("hidden");
                                return;
                            }
                            document.getElementById("error-msg").classList.add("hidden");
                            axiosInstance.post(medicalTestAdminUrl, {
                                name: name,
                                description: description
                            }).then((response) => {
                                toast.success("Test added successfully", {
                                    description: "Rfresh the test list to see the changes",
                                });
                                document.getElementById("testName").value = "";
                                document.getElementById("testDescription").value = "";
                                setLoading(true);
                            }).catch((error) => {
                                toast.error("Failed to add test");
                                console.log(error);
                            })
                        }} >
                            Add
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-10/12 flex flex-col p-5 gap-5 rounded-md bg-white">
                <div className="flex flex-col gap-2 w-full">
                    <div className="text-2xl text-black flex flex-row justify-between w-full pr-10">
                        <span>
                            Tests Added
                        </span>
                        <div className="flex flex-row gap-5">
                            <label className="w-fit flex flex-row gap-2 items-center">
                                <span className="text-base">
                                    Sort By
                                </span>
                                <select defaultValue={filter.sortDirection} className="border border-gray-500 rounded-md px-2 py-1 shadow-inner text-base" onChange={(event) => {
                                    setFilter({
                                        ...filter,
                                        sortDirection: event.target.value
                                    });
                                    setLoading(true);
                                }}>
                                    <option value="ASC">Ascending</option>
                                    <option value="DESC">Descending</option>
                                </select>
                            </label>
                            <button id="reload-button" className="bg-gray-50 p-2 rounded-md" onClick={() => {
                                setLoading(true);
                            }}>
                                <RefreshCcw size={28} className={cn(loading && "animate-spin")} />
                            </button>
                        </div>
                    </div>
                    <Separator className="w-full h-[1.5px] bg-gray-300" />
                </div>
                <div className="flex flex-col gap-5">
                    {loading ?
                        <Loader2 size={44} className="text-gray-500 animate-spin m-auto" />
                        :
                        <>
                            {testsAdded?.map((test, index) => (
                                <MedicalTest key={index} test={test} setLoading={setLoading} />
                            ))}
                        </>
                    }
                </div>
            </div>
        </div >
    )
}

function MedicalTest({ test, setLoading }) {
    const [editabel, setEditable] = useState(false);
    const [mutableTest, setMutableTest] = useState(test);
    const testNameRef = useRef();
    const testDescriptionRef = useRef();
    return (
        <div className="flex flex-col gap-2 relative">
            <div className="flex flex-row justify-between">
                {editabel &&
                    <input ref={testNameRef} type="text" className=" border border-gray-500 shadow-inner rounded px-2 py-1" defaultValue={mutableTest.name} />
                }
                {!editabel && <span className="text-lg">{mutableTest.name}</span>}
                <div className="flex flex-row gap-8">
                    {!editabel &&
                        <button className="text-gray-700 font-semibold hover:scale-95" onClick={() => { setEditable(true) }}>
                            <Pencil size={24} />
                        </button>
                    }
                    {editabel &&
                        <div className="flex flex-row gap-4">
                            <button className="text-red-500 hover:scale-95" onClick={() => { setEditable(false) }}>
                                <X size={24} />
                            </button>
                            <button className="text-green-500 hover:scale-95" onClick={() => {
                                console.log(testNameRef.current?.value, testDescriptionRef.current?.value);
                                if (testNameRef.current === "" || testDescriptionRef.current === "") {
                                    return;
                                }
                                axiosInstance.put(medicalTestByIdAdminUrl(mutableTest.id), {
                                    name: testNameRef.current?.value,
                                    description: testDescriptionRef.current?.value
                                }).then((response) => {
                                    toast.success("Test updated successfully");
                                    setMutableTest({
                                        ...mutableTest,
                                        name: testNameRef.current?.value,
                                        description: testDescriptionRef.current?.value
                                    })
                                    setEditable(false)
                                }).catch((error) => {
                                    toast.error("Failed to update test");
                                    console.log(error);
                                })
                            }}>
                                <Check size={24} />
                            </button>
                        </div>
                    }
                    <button className="text-red-500 hover:scale-95 " onClick={() => {
                        axiosInstance.delete(medicalTestByIdAdminUrl(test.id)).then((response) => {
                            toast.success("Test deleted successfully");
                            setLoading(true);
                        }).catch((error) => {
                            toast.error("Failed to delete test");
                            console.log(error);
                        })
                    }}>
                        <Trash2 size={24} />
                    </button>
                </div>
            </div>
            {!editabel &&
                <span className="text-base">{mutableTest.description}</span>
            }
            {editabel &&
                <textarea type="text" className="border border-gray-500 shadow-inner rounded px-2 py-1" defaultValue={mutableTest.description} ref={testDescriptionRef} />
            }
            <Separator className={cn("w-full h-[1.5px] bg-gray-500")} />
        </div>
    )
}