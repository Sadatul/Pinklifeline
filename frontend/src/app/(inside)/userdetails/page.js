'use client'
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import formBgImage from '../../../../public/userdetails/form-bg.jpg'
import { Separator } from "@/components/ui/separator"
import { UserInfoSection, ImageUploadSection, DoctorInfoSection, NurseInfoSection, MedicalInfoSection, LocationSection } from '@/app/components/formSections'
import Map from "@/app/components/map"



// this form is centered in the page and will have  fields name, age, gender selection from two options, weight scale, height, present location and a submit button


export default function UserDetailsPage() {
    const role = "ROLE_USER"
    const [userData, setUserData] = useState({})
    const [sections, setSections] = useState([{}])
    const [currentSection, setCurrentSection] = useState(0) // 0 for user details, 1 for image upload, 2 for medical history, 3 for doctor details, 4 for nurse details, 5 for location details

    useEffect(() => {
        const getSections = (user_role) => {
            const temp_sections = [
                {
                    section_name: "User info",
                    section_components: <UserInfoSection userData={userData} setUserData={setUserData} currentSection={currentSection} setCurrentSection={setCurrentSection} />
                },
                {
                    section_name: "Medical Info",
                    section_components: <MedicalInfoSection userData={userData} setUserData={setUserData} currentSection={currentSection} setCurrentSection={setCurrentSection} />
                },
                {
                    section_name: "Doctor info",
                    section_components: <DoctorInfoSection userData={userData} setUserData={setUserData} currentSection={currentSection} setCurrentSection={setCurrentSection} />
                },
                {
                    section_name: "Nurse info",
                    section_components: <NurseInfoSection userData={userData} setUserData={setUserData} currentSection={currentSection} setCurrentSection={setCurrentSection} />
                },
                {
                    section_name: "Location",
                    section_components: <LocationSection userData={userData} setUserData={setUserData} currentSection={currentSection} setCurrentSection={setCurrentSection} />
                }
            ]
            if (user_role === "ROLE_ALL") {      // this one for current testing phase will be removed after development
                return temp_sections
            }
            else if (user_role === "ROLE_DOCTOR") {
                return [temp_sections[3], temp_sections[1]]
            }
            else if (user_role === "ROLE_NURSE") {
                return [temp_sections[4], temp_sections[1]]
            }
            else if (user_role === "ROLE_USER") {
                return [temp_sections[0], temp_sections[1], temp_sections[4]]
            }
            console.log("Invalid role")
            return temp_sections
        }
        setSections(getSections(role))
        console.log(currentSection)
        // for (let i = 0; i < 6; i++) {
        //     document.getElementById(`section-${i}`)?.classList.remove("text-pink-600")
        //     document.getElementById(`section-${i}`)?.classList.add("text-white")
        // }
        // document.getElementById(`section-${currentSection}`)?.classList.remove("text-white")
        // document.getElementById(`section-${currentSection}`)?.classList.add("text-pink-600")

    }, [currentSection, userData])

    return (
        <div className=" w-full bg-cover bg-center flex flex-col justify-center items-center bg-opacity-100 overflow-auto" style={{ backgroundImage: `url(${formBgImage.src})`, minHeight: '649px' }}>
            <div className="w-full h-full justify-center items-center flex flex-col" style={{ background: "rgba(0, 0, 0, 0.6)", minHeight: '649px' }}>
                <div className="flex flex-row justify-evenly items-center w-5/6" >
                    {sections?.map((section, index) => (
                        <div key={index} className="flex items-center">
                            <h3 id={`section-${index}`} className={`text-2xl font-bold text-center ${index === currentSection ? "text-pink-500" : "text-white"}`}>{section?.section_name}</h3>
                            <Separator id={`section-${index}`} hidden={index == (sections.length - 1)} className=" w-[2px] h-8 bg-purple-400 ml-2" orientation="vertical" />
                        </div >

                    ))
                    }
                    {/* <h3 id="section-0" className="text-2xl font-bold text-center text-white ">User Details</h3>
                    <Separator className=" w-[3px] bg-purple-400" orientation="vertical" />
                    <h3 id="section-1" className="text-2xl font-bold text-center text-white p-[1px]">Image upload</h3>
                    <Separator className=" w-[3px] bg-purple-400" orientation="vertical" />
                    <h3 id="section-2" className="text-2xl font-bold text-center text-white p-[1px]">Medical History</h3>
                    <Separator className=" w-[3px] bg-purple-400" orientation="vertical" />
                    <h3 id="section-3" className="text-2xl font-bold text-center text-white p-[1px]">Doctor details</h3>
                    <Separator className=" w-[3px] bg-purple-400" orientation="vertical" />
                    <h3 id="section-4" className="text-2xl font-bold text-center text-white p-[1px]">Nurse details</h3>
                    <Separator className=" w-[3px] bg-purple-400" orientation="vertical" />
                    <h3 id="section-5" className="text-2xl font-bold text-center text-white p-[1px]">Location details</h3> */}
                </div>
                <Separator className="bg-purple-400 m-2 max-w-[1200px] shrink " />
                <div className="bg-gray-100 w-[800px] min-h-[500px] rounded-2xl m-3 flex flex-col items-center justify-evenly">
                    {sections[currentSection]?.section_components}
                    
                </div>
            </div>
        </div>
    )

}

