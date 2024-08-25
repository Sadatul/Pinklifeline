'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { pagePaths, radicalGradient, worksByIdUrl, worksUrl } from "@/utils/constants"
import Link from "next/link"
import { useState } from "react"
import ReactSelect from "react-select"
import makeAnimated from "react-select/animated"

const animatedComponents = makeAnimated()

export default function AddWork({ workInfo = null, isUpdate = false }) {
    const tagsOptions = [{ label: "Doctor", value: "DOCTOR" }, { label: "Nursing", value: "NURSING" }]
    const [selectedTags, setSelectedTags] = useState(workInfo ? workInfo?.tags.map(tag => ({ label: tag, value: tag })) : [])

    return (
        <div className={cn("flex flex-col w-full h-full p-4 items-center", radicalGradient, "from-zinc-200 to-zinc-100")}>
            <div className="flex flex-col w-10/12 h-full p-4 bg-white gap-8">
                <h1 className="text-2xl font-semibold">Add Work</h1>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-base font-semibold w-32">
                            Title
                        </span>
                        <input autoComplete="off" defaultValue={workInfo?.title} type="text" id="work-title" className="w-1/2 p-2 border border-gray-500 shadow-inner rounded-md" />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-base font-semibold w-32">
                            Description
                        </span>
                        <textarea defaultValue={workInfo?.description} id="work-description" className="w-1/2 p-2 border border-gray-500 shadow-inner rounded-md" />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-base font-semibold w-32">
                            Address
                        </span>
                        <div className="w-full flex flex-col gap-1">
                            <input autoComplete="off" defaultValue={workInfo?.address} type="text" id="work-address" className="w-1/2 p-2 border border-gray-500 shadow-inner rounded-md" />
                            <span className="text-sm text-gray-700">Please provide only City and Road</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-base font-semibold w-32">
                            Tags
                        </span>
                        <ReactSelect
                            options={tagsOptions}
                            isMulti
                            className="w-1/2"
                            onChange={(selected) => setSelectedTags(selected)}
                            components={animatedComponents}
                            closeMenuOnSelect={false}
                            hideSelectedOptions
                            defaultValue={selectedTags}
                        />
                    </div>
                    <span id="error-message" className="text-red-500"></span>
                </div>
                <div className="flex justify-end gap-3">
                    <Link href={pagePaths.worksPage} className="p-2 bg-red-500 text-white rounded-md hover:scale-95">Cancel</Link>
                    <button className="p-2 bg-blue-500 text-white rounded-md hover:scale-95 w-fit" onClick={() => {
                        const data = {
                            title: document.getElementById("work-title").value,
                            description: document.getElementById("work-description").value,
                            address: document.getElementById("work-address").value,
                            tags: selectedTags.map(tag => tag.value),
                        }
                        if (!data.title || !data.description || !data.address || data.tags.length === 0) {
                            document.getElementById("error-message").innerText = "Please fill all fields"
                            return
                        } else {
                            document.getElementById("error-message").innerText = ""
                            console.log(data)
                        }
                        if (isUpdate) {
                            axiosInstance.put(worksByIdUrl(workInfo.id), data).then(res => {
                                console.log(res.data)
                                window.location.href = pagePaths.worksPage
                            }).catch(err => {
                                console.error(err)
                            })
                        }
                        else {
                            axiosInstance.post(worksUrl, data).then(res => {
                                console.log(res.data)
                                window.location.href = pagePaths.worksPage
                            }).catch(err => {
                                console.error(err)
                            })
                        }
                    }}>
                        {isUpdate ? "Update" : "Add"}
                    </button>
                </div>
            </div>
        </div>
    )
}