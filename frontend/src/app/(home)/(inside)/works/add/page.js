'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"
import AddWork from "@/app/components/worksComponents"
import { cn } from "@/lib/utils"
import axiosInstance from "@/utils/axiosInstance"
import { pagePaths, radicalGradient, worksUrl } from "@/utils/constants"
import Link from "next/link"
import { useState } from "react"
import ReactSelect from "react-select"
import makeAnimated from "react-select/animated"

const animatedComponents = makeAnimated()

export default function AddWorkPage() {
    const [work, setWork] = useState({
        title: '',
        description: '',
        address: '',
        tags: [],
    })
    const tagsOptions = [{ label: "Doctor", value: "DOCTOR" }, { label: "Nursing", value: "NURSING" }]
    const [selectedTags, setSelectedTags] = useState([])

    return (
        <AddWork />
    )
}