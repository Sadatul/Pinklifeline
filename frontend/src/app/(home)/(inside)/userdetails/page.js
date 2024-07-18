'use client'

import { useState, useEffect, useRef } from "react"
import formBgImage from '../../../../../public/userdetails/form-bg.jpg'
import { Separator } from "@/components/ui/separator"
import { UserInfoSection, ImageUploadSection, DoctorInfoSection, NurseInfoSection, MedicalInfoSection, LocationSection, DoctorChamberLocationSection } from '@/app/components/formSections'
import { latLngToCell } from 'h3-js'
import React from 'react';
import axios from "axios"
import { locationResolution, pagePaths, roles, sessionDataItem, userInfoRegUrlReq } from "@/utils/constants"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSessionContext } from "@/app/context/sessionContext"
import Loading from "@/app/components/loading"


export default function UserDetailsPage() {
    const router = useRouter()
    const sessionDataRef = useRef({})
    const userDataRef = useRef({})
    const [sections, setSections] = useState([{}])
    const [currentSection, setCurrentSection] = useState(0) // 0 for user details, 1 for image upload, 2 for medical history, 3 for doctor details, 4 for nurse details, 5 for location details
    const sessionContext = useSessionContext()

    useEffect(() => {
        const sessionData = JSON.parse(localStorage.getItem(sessionDataItem))
        if (!sessionData) {
            toast.error("Session data not found", {
                description: "You need to login to continue",
            })
            router.push(pagePaths.login)
            return
        }
        sessionDataRef.current = sessionData
        const getSections = (user_role) => {
            const temp_sections = [
                {
                    section_name: "User info",
                    section_components: UserInfoSection
                },
                {
                    section_name: "Medical Info",
                    section_components: MedicalInfoSection
                },
                {
                    section_name: "Doctor info",
                    section_components: DoctorInfoSection
                },
                {
                    section_name: "Nurse info",
                    section_components: NurseInfoSection
                },
                {
                    section_name: "Location",
                    section_components: LocationSection
                }
            ]
            if (user_role === "ROLE_ALL") {      // this one for current testing phase will be removed after development
                return temp_sections
            }
            else if (user_role === roles.doctor) {
                return [temp_sections[2]]
            }
            else if (user_role === roles.nurse) {
                return [temp_sections[4], temp_sections[1]]
            }
            else if (user_role === roles.basicUser) {
                return [temp_sections[0], temp_sections[1]]
            }
            else if (user_role === roles.patient) {
                return [temp_sections[0], temp_sections[1], temp_sections[4]]
            }
            else if (user_role === "ROLE_TEST") {
                return [temp_sections[4]]
            }
            console.log("Invalid role")
            return temp_sections
        }
        setSections(getSections(sessionDataRef.current.role))

    }, [])

    const saveForm = () => {
        console.log("user data ref from parent", userDataRef.current)
        const headers = {
            'Authorization': `Bearer ${sessionContext.sessionData.token}`
        }
        const userData = userDataRef.current
        let form_data;
        if (sessionContext.sessionData.role === roles.doctor) {
            form_data = {
                fullName: userData?.fullName,
                qualifications: userData?.qualifications.split(",").map((qualification) => qualification.trim()),
                workplace: userData?.workplace,
                department: userData?.department,
                designation: userData?.designation,
                contactNumber: userData?.contactNumber,
                registrationNumber: userData?.registrationNumber,
                profilePicture: userData?.profilePictureUrl

            }
        }
        else if (sessionContext.sessionData.role === roles.basicUser || sessionContext.sessionData.role === roles.patient) {
            const tempPeriodDate = new Date(userData?.lastPeriodDate)
            form_data = {
                fullName: userData?.fullName,
                weight: userData?.weight,
                height: (Number(userData?.heightFeet) * 12 + Number(userData?.heightInch)) * 2.54 || "undefined",
                dob: `${userData?.dobYear}-${(userData?.dobMonth) < 10 ? `0${userData?.dobMonth}` : `${userData?.dobMonth}`}-${(userData?.dobDay) < 10 ? `0${userData?.dobDay}` : `${userData?.dobDay}`}`,
                cancerHistory: userData?.cancerHistory,
                cancerRelatives: userData?.cancerRelatives,
                profilePicture: userData?.profilePictureUrl,
                lastPeriodDate: `${tempPeriodDate.getFullYear()}-${(tempPeriodDate.getMonth() + 1) < 10 ? `0${tempPeriodDate.getMonth() + 1}` : `${tempPeriodDate.getMonth() + 1}`}-${(tempPeriodDate.getDate()) < 10 ? `0${tempPeriodDate.getDate()}` : `${tempPeriodDate.getDate()}`}`,
                avgCycleLength: userData?.avgCycleLength,
                periodIrregularities: userData?.periodIrregularities,
                allergies: userData?.allergies,
                organsWithChronicCondition: userData?.organsWithChronicCondition,
                medications: userData?.medications
            }
            if (sessionContext.sessionData.role === roles.patient) {
                const tempDiagnosisDate = new Date(userData?.diagnosisDate)
                form_data = {
                    ...form_data,
                    diagnosisDate: `${tempDiagnosisDate.getFullYear()}-${(tempDiagnosisDate.getMonth() + 1) < 10 ? `0${tempDiagnosisDate.getMonth() + 1}` : `${tempDiagnosisDate.getMonth() + 1}`}-${(tempDiagnosisDate.getDate()) < 10 ? `0${tempDiagnosisDate.getDate()}` : `${tempDiagnosisDate.getDate()}`}`,
                    cancerStage: userData?.cancerStage,
                    location: latLngToCell(Number(userData?.location.lat), Number(userData?.location.lng), locationResolution)
                }
            }
        }
        console.log("form data", form_data)
        axios.post(userInfoRegUrlReq(sessionContext.sessionData.userId, sessionContext.sessionData.role), form_data, {
            headers: headers
        }).then((response) => {
            console.log(response)
            toast.success("Information saved successfully")
            router.push(pagePaths.dashboard)
        }
        ).catch((error) => {
            console.log(error)
            toast.error("An error occured", {
                description: error.response.data?.message
            })
        })
    }
    if (!sessionContext.sessionData) {
        return <Loading />
    }

    return (
        <div className=" w-full bg-cover bg-center flex flex-col justify-center items-center bg-opacity-100 overflow-auto flex-grow" style={{ backgroundImage: `url(${formBgImage.src})` }}>
            <div className="w-full flex-grow justify-center items-center flex flex-col" style={{ background: "rgba(0, 0, 0, 0.6)" }}>
                <div className="flex flex-row justify-evenly items-center w-5/6" >
                    {sections?.map((section, index) => (
                        <React.Fragment key={index}>
                            <h3 id={`section-${index}`} className={`text-2xl font-bold text-center ${index === currentSection ? "text-pink-500" : "text-white"}`}>
                                {section?.section_name}
                            </h3>
                            {index !== sections.length - 1 && (
                                <Separator
                                    id={`separator-${index}`}
                                    className="w-[2px] h-8 bg-purple-400 ml-2"
                                    orientation="vertical"
                                />
                            )}
                        </React.Fragment>
                    ))}

                </div>
                <Separator className="bg-purple-400 m-2 max-w-[1200px] shrink " />
                <div className="bg-gray-100 w-[800px] min-h-[500px] rounded-2xl m-3 flex flex-col items-center justify-evenly py-5">
                    {sections[currentSection] && sections[currentSection].section_components &&
                        React.createElement(sections[currentSection].section_components, {
                            userDataRef: userDataRef,
                            setCurrentSection: setCurrentSection,
                            currentSection: currentSection,
                            totalSections: sections.length,
                            role: sessionContext.sessionData.role,
                            saveForm: saveForm
                        })
                    }
                </div>
            </div>
        </div>
    )

}

