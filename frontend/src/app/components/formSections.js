'use client'

import { useForm } from "react-hook-form"
import styled from 'styled-components';
import { Separator } from "@/components/ui/separator"
import { FileUploader } from "react-drag-drop-files"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { useGeolocated } from "react-geolocated"
import MapView from "@/app/components/map"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import AddIcon from '@mui/icons-material/Add';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import RemoveIcon from '@mui/icons-material/Remove';
import { red } from "@mui/material/colors"
import ScrollableContainer from '@/app/components/StyledScrollbar';
import { motion, AnimatePresence } from "framer-motion"
import firebase_app from "@/utils/firebaseConfig";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


export function UserInfoSection({ userData, setUserData, currentSection, setCurrentSection }) {
    const storage = getStorage(firebase_app);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm()
    const onSubmit = (data) => {
        console.log(data)
        setUserData({ ...userData, ...data })
    }
    const getCurrentYear = () => new Date().getFullYear();
    const generateOptions = (start, end) => {
        const options = [];
        for (let i = start; i <= end; i++) {
            options.push(
                <option key={i} value={i}>
                    {i}
                </option>
            );
        }
        return options;
    };
    const fileTypes = ["JPEG", "PNG"];
    const [imageFile, setImageFile] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0);
    const handleFileChange = (file) => {
        console.log("File changed")
        console.log(file)
        setImageFile(file)
        setUserData({ ...userData, profilePicturePreview: URL.createObjectURL(file) })
    }
    const handleUpload = async () => {
        if (!imageFile) return;
        const filePath = `profileImages/${new Date().getTime()}/${imageFile.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress("progress", progress);
            },
            (error) => {
                // Handle upload errors
                console.error(error);
                toast.error("Error uploading image", {
                    description: "Please try again later",
                });
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('Image uploaded successfully!', downloadURL);
                // Use the downloadURL to display the image or store it for later retrieval
                setUserData({ ...userData, profilePictureURL: downloadURL });
            }
        );
    }

    return (
        <>
            <AnimatePresence>
                <motion.div className="flex flex-col items-center justify-evenly"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-2xl font-bold m-2 text-pink-500">User Details</h1>
                    <div className="flex flex-row justify-evenly items-center w-11/12">
                        <label className="text-md font-semibold m-2">First Name
                            <div className="w-full flex flex-col">
                                <input type="text" placeholder="First Name" className="border-2 border-blue-500 rounded-md p-2" {...register("first_name", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.first_name && <span className="text-red-500">{errors.first_name?.message}</span>}
                            </div>
                        </label>
                        <label className="text-md font-semibold m-2">Last Name(optional)
                            <div className="w-full flex flex-col">
                                <input type="text" placeholder="Last Name" className="border-2 border-blue-500 rounded-md p-2" {...register("last_name", { maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.last_name && <span className="text-red-500">{errors.last_name?.message}</span>}
                            </div>
                        </label>
                    </div>
                    <div className="flex flex-row justify-evenly items-center w-11/12 m-2">
                        <label className="text-md font-semibold m-2 text-center">
                            Date of Birth
                            <div className="flex gap-4 mt-2">
                                <div>
                                    <select defaultValue={"day"} {...register("day", { required: 'Day is required' })} className="p-2 border rounded-lg w-24 bg-white border-blue-500">
                                        <option value="day" disabled >
                                            Day
                                        </option>
                                        {generateOptions(1, 31)}
                                    </select>
                                    {errors.day && <p className="text-red-500 text-sm">{errors.day?.message}</p>}
                                </div>
                                <div>
                                    <select defaultValue={"month"} {...register("month", { required: 'Month is required' })} className="p-2 w-24 border rounded-lg bg-white border-blue-500">
                                        <option value="month" disabled  >
                                            Month
                                        </option>
                                        {generateOptions(1, 12)}
                                    </select>
                                    {errors.month && <p className="text-red-500 text-sm">{errors.month?.message}</p>}
                                </div>
                                <div>
                                    <select defaultValue={"year"} {...register("year", { required: 'Year is required' })} className="p-2 w-24 border rounded-lg bg-white border-blue-500">
                                        <option value="year" disabled >
                                            Year
                                        </option>
                                        {generateOptions(1900, getCurrentYear())}
                                    </select>
                                    {errors.year && <p className="text-red-500 text-sm">{errors.year?.message}</p>}
                                </div>
                            </div>
                        </label>
                        <div className="flex">
                            <label className="text-md font-semibold m-2 ">Weight(kg)
                                <div className="w-full  flex flex-col">
                                    <input type="number" placeholder="Weight" className="border-2 w-24 rounded-md p-1 mt-2 border-blue-500" {...register("weight", { required: "Weigh is required", max: { value: 1000, message: "Maximum weight 1000kg" }, min: { value: 10, message: "Minimum weight 10" } })} />
                                    {errors.weight && <span className="text-red-500  text-sm">{errors.weight?.message}</span>}
                                </div>
                            </label>
                        </div>
                        <div className="flex">
                            <label className="text-md font-semibold m-2 text-center">
                                Height
                                <div className="flex gap-4 mt-2">
                                    <div>
                                        <select defaultValue={"feet"} {...register("height_feet", { required: 'Day is required' })} className="p-2 border rounded-lg w-20 bg-white border-blue-500">
                                            <option value="feet" disabled >
                                                Feet
                                            </option>
                                            {generateOptions(1, 10)}
                                        </select>
                                        {errors.height_feet && <p className="text-red-500 text-sm">{errors.height_feet?.message}</p>}
                                    </div>
                                    <div>
                                        <select defaultValue={"inch"} {...register("height_inch", { required: 'Month is required' })} className="p-2 w-20 border rounded-lg bg-white border-blue-500">
                                            <option value="inch" disabled  >
                                                Inch
                                            </option>
                                            {generateOptions(1, 11)}
                                        </select>
                                        {errors.height_inch && <p className="text-red-500 text-sm">{errors.height_inch?.message}</p>}
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-evenly w-11/12">
                        <FileUploader handleChange={handleFileChange}
                            multiple={false}
                            types={fileTypes}
                            name="file"
                            onTypeError={() => {
                                toast.error("Invalid file type", {
                                    description: "Only jpg or png files are allowed",
                                })
                            }}
                        />
                        {userData?.profilePicturePreview && (
                            <div className="flex flex-row items-center">
                                <div className="flex flex-col items-center m-4 p-6 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 max-w-96">
                                    <Image width={300} objectFit='scale-down' height={300} src={userData?.profilePicturePreview} alt="Preview" className="w-full h-full rounded-lg" />
                                </div>
                                <button onClick={handleUpload} className="border-2 bg-purple-600 text-white border-black rounded-md px-2 h-8 text-center mt-2">Upload</button>
                            </div>
                        )}
                        {/* <FileUploader handleChange={handleFileChange} name="file" types={fileTypes} /> */}
                    </div>
                </motion.div>
            </AnimatePresence>
            <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
            <div className="flex flex-row justify-between items-center w-full m-2">
                <button type='button' disabled={!(currentSection > 0)} onClick={() => { setCurrentSection(a => ((a - 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Previous</button>
                <button type='button' onClick={handleSubmit(onSubmit)} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Test</button>
                <button onClick={console.log(userData)} type="button">Check</button>
                <button type='button' disabled={!(currentSection < 5)} onClick={() => { setCurrentSection(a => ((a + 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Next</button>
            </div>
        </>
    )
}

export function ImageUploadSection({ userData, setUserData, currentSection, setCurrentSection }) {
    const fileTypes = ["JPEG", "PNG"];
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const handleFileChange = (file) => {
        console.log("File changed")
        console.log(file)
        setImageFile(file)
        setUserData({ ...userData, profilePicture: file, profilePicturePreview: URL.createObjectURL(file) })
        setImagePreview(URL.createObjectURL(file));
    }
    return (
        <>
            <AnimatePresence>
                <motion.div className="flex flex-col items-center justify-evenly"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-2xl font-bold m-4 text-pink-500">Upload Profile Picture</h1>
                    <div className="flex flex-col items-center justify-evenly w-11/12">
                        <FileUploader handleChange={handleFileChange}
                            multiple={false}
                            types={fileTypes}
                            name="file"
                            label={"Upload your profile picture. Only jpg or png files are allowed."}
                            onTypeError={() => {
                                toast.error("Invalid file type", {
                                    description: "Only jpg or png files are allowed",
                                })
                            }}
                        />
                        <div className="flex flex-col items-center m-4 p-6 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 w-80 h-72">
                            {!imagePreview && (
                                <div className=" h-full flex flex-col justify-center items-center">
                                    <p className="text-2xl text-gray-500 text-center">
                                        Upload Image for Preview
                                    </p>
                                </div>
                            )}
                            {imagePreview && (
                                <Image width={300} height={300} src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                            )}
                            {/* <FileUploader handleChange={handleFileChange} name="file" types={fileTypes} /> */}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="w-full flex flex-col justify-center items-center">
                <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
                <div className="flex flex-row justify-between items-center w-full m-2">
                    <button type='button' disabled={!(currentSection > 0)} onClick={() => { setCurrentSection(a => ((a - 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Previous</button>
                    <button type='button' disabled={!(currentSection < 5)} onClick={() => { setCurrentSection(a => ((a + 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Save and Next</button>
                </div>
            </div>
        </>
    )
}

export function DoctorInfoSection({ userData, setUserData, currentSection, setCurrentSection }) {
    const { register, handleSubmit, formState: { errors }, setValue, trigger } = useForm()
    const fileTypes = ["JPEG", "PNG"];
    const handleFileChange = (file) => {
        console.log("File changed")
        console.log(file)
        setValue("doctorDocs", file)
        trigger("doctorDocs")
    }
    useEffect(() => {
        register("doctorDocs", { required: "Document is required" });
    }, [register]);

    const onSubmit = (data) => {
        console.log(data)
        setUserData({ ...userData, ...data })
    }
    return (
        <>
            <AnimatePresence>
                <motion.div className="flex flex-col items-center justify-evenly"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-2xl font-bold m-2 text-pink-500">Doctor info</h1>
                    <div className="flex flex-row justify-evenly items-center w-11/12">
                        <label className="text-md font-semibold mx-2">First Name
                            <div className="w-full flex flex-col">
                                <input type="text" placeholder="First Name" className="border-2 border-blue-500 rounded-md px-2" {...register("first_name", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.first_name && <span className="text-red-500">{errors.first_name?.message}</span>}
                            </div>
                        </label>
                        <label className="text-md font-semibold mx-2">Last Name(optional)
                            <div className="w-full flex flex-col">
                                <input type="text" placeholder="Last Name" className="border-2 border-blue-500 rounded-md p-2" {...register("last_name", { maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.last_name && <span className="text-red-500">{errors.last_name?.message}</span>}
                            </div>
                        </label>
                    </div>
                    <div className="flex flex-row justify-evenly items-center w-11/12">
                        <p className="text-md font-semibold mx-2 p-2">Current Hospital</p>
                        <div className="w-full flex flex-col">
                            <input type="text" placeholder="Currently Appointed Hospital" className="border-2 border-blue-500 rounded-md p-2" {...register("current_hospital", { maxLength: { value: 32, message: "Max length 32" } })} />
                            {errors.current_hospital && <span className="text-red-500">{errors.current_hospital?.message}</span>}
                        </div>
                    </div>
                    <div className="flex flex-row justify-evenly items-center w-11/12">
                        <p className="text-md font-semibold m-2 p-2">Specialization</p>
                        <div className="w-full flex flex-col">
                            <input type="text" placeholder="Add Your Specialization Fields" className="border-2 border-blue-500 rounded-md p-2" {...register("specialization", { maxLength: { value: 32, message: "Max length 32" } })} />
                            {errors.specialization && <span className="text-red-500">{errors.specialization?.message}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col justify-evenly items-center w-11/12">
                        <p className="text-md font-semibold m-2 p-2">Degree and Other description(optional)</p>
                        <div className="w-full flex flex-col">
                            <textarea {...register("description", { maxLength: { value: 200, message: "Max length 200" } })} className="w-3/4 m-auto min-h-24 p-2 rounded-xl border-2 border-gray-100" placeholder="Add any description"></textarea>
                            {errors.description && <span className="text-red-500">{errors.description?.message}</span>}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
            <div className="flex flex-row justify-evenly items-center w-11/12">
                <p className="text-md font-semibold m-2 p-2">Upload Documents(multiple if needed) as image for verification</p>
                <div className="w-full flex flex-col">
                    <FileUploader multiple={true} handleChange={handleFileChange} name="doctorDocs" types={fileTypes} required={true} />
                    {errors.doctorDocs && <span className="text-red-500">{errors.doctorDocs?.message}</span>}
                </div>
            </div>
            <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
            <div className="flex flex-row justify-between items-center w-full m-2">
                <button type='button' disabled={!(currentSection > 0)} onClick={() => { setCurrentSection(a => ((a - 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Previous</button>
                <button type='button' onClick={handleSubmit(onSubmit)} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Test</button>
                <button type='button' disabled={!(currentSection < 5)} onClick={() => { setCurrentSection(a => ((a + 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Next</button>
            </div>
        </>
    )
}

export function NurseInfoSection({ userData, setUserData, currentSection, setCurrentSection }) {
    const { register, handleSubmit, formState: { errors }, setValue, trigger } = useForm()
    const fileTypes = ["JPEG", "PNG"];
    const handleFileChange = (file) => {
        console.log("File changed")
        console.log(file)
        setValue("nurseDocs", file)
        trigger("nurseDocs")
    }
    useEffect(() => {
        register("nurseDocs", { required: "Document is required" });
    }, [register]);

    const onSubmit = (data) => {
        console.log(data)
        setUserData({ ...userData, ...data })
    }
    return (
        <>
            <AnimatePresence>
                <motion.div className="flex flex-col items-center justify-evenly"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-2xl font-bold m-2 text-pink-500">Nurse info</h1>
                    <div className="flex flex-row justify-evenly items-center w-11/12">
                        <label className="text-md font-semibold mx-2">First Name
                            <div className="w-full flex flex-col">
                                <input type="text" placeholder="First Name" className="border-2 border-blue-500 rounded-md px-2" {...register("first_name", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.first_name && <span className="text-red-500">{errors.first_name?.message}</span>}
                            </div>
                        </label>
                        <label className="text-md font-semibold m-2">Last Name(optional)
                            <div className="w-full flex flex-col">
                                <input type="text" placeholder="Last Name" className="border-2 border-blue-500 rounded-md px-2" {...register("last_name", { maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.last_name && <span className="text-red-500">{errors.last_name?.message}</span>}
                            </div>
                        </label>
                    </div>
                    <div className="flex flex-row justify-evenly items-center w-11/12">
                        <p className="text-md font-semibold mx-2 p-2">Current Hospital</p>
                        <div className="w-full flex flex-col">
                            <input type="text" placeholder="Currently Appointed Hospital" className="border-2 border-blue-500 rounded-md p-2" {...register("current_hospital", { maxLength: { value: 32, message: "Max length 32" } })} />
                            {errors.current_hospital && <span className="text-red-500">{errors.current_hospital?.message}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col justify-evenly items-center w-11/12">
                        <p className="text-md font-semibold m-2 p-2">Experience and Other description(optional but recommended)</p>
                        <div className="w-full flex flex-col">
                            <textarea {...register("description", { maxLength: { value: 200, message: "Max length 200" } })} className="w-3/4 m-auto min-h-24 p-2 rounded-xl border-2 border-gray-100" placeholder="Add any description"></textarea>
                            {errors.description && <span className="text-red-500">{errors.description?.message}</span>}
                        </div>
                    </div>
                    <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
                    <div className="flex flex-row justify-evenly items-center w-11/12">
                        <p className="text-md font-semibold m-2 p-2">Upload Documents(multiple if needed) as image for verification</p>
                        <div className="w-full flex flex-col">
                            <FileUploader multiple={true} handleChange={handleFileChange} name="nurseDocs" types={fileTypes} required={true} />
                            {errors.nurseDocs && <span className="text-red-500">{errors.nurseDocs?.message}</span>}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
            <div className="flex flex-row justify-between items-center w-full m-2">
                <button type='button' disabled={!(currentSection > 0)} onClick={() => { setCurrentSection(a => ((a - 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Previous</button>
                <button type='button' onClick={handleSubmit(onSubmit)} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Test</button>
                <button type='button' disabled={!(currentSection < 5)} onClick={() => { setCurrentSection(a => ((a + 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Next</button>
            </div>
        </>
    )
}

export function MedicalInfoSection({ userData, setUserData, currentSection, setCurrentSection }) {
    const [date, setDate] = useState(new Date());
    const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm();
    const onSubmit = data => console.log(data);
    const cancerHistory = watch('cancerHistory');
    const [cancerRelatives, setCancerRelatives] = useState([]);
    const [periodIrregularities, setPeriodIrregularities] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [organsWithChronicCondition, setOrgansWithChronicCondition] = useState([]);
    const [medications, setMedications] = useState([]);
    useEffect(() => {
        register("lastPeriodDate", { required: "Last Period Date is required" });
    }, [register]);

    return (
        <>
            <AnimatePresence>
                <motion.div className="flex flex-col items-center justify-evenly"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-2xl font-bold m-2 text-pink-500">Medical Information Form</h1>
                    <div className="flex justify-between w-full px-5">
                        <div>
                            <label className="text-md font-semibold m-2 text-center">Cancer History:
                                <select defaultValue={"N"} id="cancerHistory" {...register('cancerHistory', { required: "This field is required" })} className="px-2 border rounded-lg w-20 bg-white border-blue-500 ml-3">
                                    <option value="N">No</option>
                                    <option value="Y">Yes</option>
                                </select>
                            </label>
                            {errors.cancerHistory && <span>{errors.cancerHistory?.message}</span>}
                        </div>

                        {cancerHistory === 'Y' && (
                            <div className="flex items-center">
                                <label className="text-md font-semibold m-2 text-center">Cancer Relatives:
                                    <input className="border border-blue-500 rounded-md px-2" id="cancerRelatives" />
                                </label>
                                <TooltipProvider delayDuration={400}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>

                                            <Button
                                                onClick={() => {
                                                    setCancerRelatives([...cancerRelatives, document.getElementById('cancerRelatives').value])
                                                    document.getElementById('cancerRelatives').value = ''
                                                    toast.message("Relative added", {
                                                        description: "See added relatives to see all the relatives added so far"
                                                    })
                                                }}
                                                variant={"outline"}
                                                className={cn(
                                                    " h-7 mx-4 justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            ><AddIcon fontSize="medium" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add to relative list</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[160px] ml-3 justify-start text-left font-normal",
                                            )}
                                        >Added Relatives</Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <ScrollArea className="rounded-md border h-52 min-w-64">
                                            {cancerRelatives.map((relative, index) => (
                                                <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                                    <span>{relative}</span>
                                                    <TooltipProvider delayDuration={400}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    onClick={() => {
                                                                        setCancerRelatives(cancerRelatives.filter((_, i) => i !== index))
                                                                        toast.message("Relative removed")
                                                                    }}
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        " h-7 mx-4 justify-start text-left font-normal",
                                                                    )}
                                                                ><RemoveIcon sx={{ color: red[500] }} /></Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Remove relative</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            ))}
                                        </ScrollArea >
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div >

                    <div className="flex justify-between w-full items-center px-5">
                        <div>
                            <label className="text-md font-semibold m-2 text-center" >Last Period Date:
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[160px] ml-3 justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(selectedDate) => {
                                                setDate(selectedDate)
                                                setValue("lastPeriodDate", selectedDate)
                                                trigger("lastPeriodDate")
                                            }}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </label>
                            {errors.lastPeriodDate && <span>{errors.lastPeriodDate?.message}</span>}
                        </div>

                        <div className=" w-1/3">
                            <label className="text-md font-semibold m-2 text-center">Average Cycle Length (days):
                                <input className="border border-blue-500 rounded-md px-2" type="number" id="avgCycleLength" {...register('avgCycleLength', { required: "This field is required" })} />
                            </label>
                            {errors.avgCycleLength && <span>{errors.avgCycleLength?.message}</span>}
                        </div>
                    </div>

                    <div className="w-full px-5">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                <label className="text-md font-semibold m-2 text-center">Period Irregularities:
                                    <input className="border border-blue-500 rounded-md px-2 m-2" id="periodIrregularities" placeholder="Irregularity" />
                                </label>
                                <TooltipProvider delayDuration={400}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={() => {
                                                    if (!document.getElementById('periodIrregularities').value) return toast.error("Irregularity field is empty")
                                                    setPeriodIrregularities([...periodIrregularities, document.getElementById('periodIrregularities').value])
                                                    document.getElementById('periodIrregularities').value = ''
                                                    toast.message("Irregularity added", {
                                                        description: "See added irregularities to see all the relatives added so far"
                                                    })
                                                }}
                                                variant={"outline"}
                                                className={cn(
                                                    " h-7 mx-4 justify-start text-left font-normal",
                                                )}
                                            ><AddIcon fontSize="medium" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add to irregularities list</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[160px] ml-3 justify-start text-left font-normal",
                                        )}
                                    >Added Irregularities</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <ScrollArea className="rounded-md border h-52 min-w-64">
                                        {periodIrregularities.map((irregularity, index) => (
                                            <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                                <span>{irregularity}</span>
                                                <TooltipProvider delayDuration={400}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setPeriodIrregularities(periodIrregularities.filter((_, i) => i !== index))
                                                                    toast.message("Irregularity removed")
                                                                }}
                                                                variant={"outline"}
                                                                className={cn(
                                                                    " h-7 mx-4 justify-start text-left font-normal",
                                                                )}
                                                            ><RemoveIcon sx={{ color: red[500] }} /></Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Remove irregularity</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        ))}
                                    </ScrollArea >
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="w-full px-5">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                <label className="text-md font-semibold m-2 text-center">Allergies
                                    <input placeholder="Allergy" className="border border-blue-500 rounded-md px-2 m-2" id="allergies" />
                                </label>
                                <TooltipProvider delayDuration={400}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={() => {
                                                    if (!document.getElementById('allergies').value) return toast.error("Allergy field is empty")
                                                    setAllergies([...allergies, document.getElementById('allergies').value])
                                                    document.getElementById('allergies').value = ''
                                                    toast.message("Allergy added", {
                                                        description: "See added allergies to see all the allergies added so far"
                                                    })
                                                }}
                                                variant={"outline"}
                                                className={cn(
                                                    " h-7 mx-4 justify-start text-left font-normal",
                                                )}
                                            ><AddIcon fontSize="medium" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add to allergy list</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[160px] ml-3 justify-start text-left font-normal",
                                        )}
                                    >Added Allergies</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <ScrollArea className="rounded-md border h-52 min-w-64">
                                        {allergies.map((allergy, index) => (
                                            <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                                <span>{allergy}</span>
                                                <TooltipProvider delayDuration={400}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setAllergies(allergies.filter((_, i) => i !== index))
                                                                    toast.message("Allergy removed")
                                                                }}
                                                                variant={"outline"}
                                                                className={cn(
                                                                    " h-7 mx-4 justify-start text-left font-normal",
                                                                )}
                                                            ><RemoveIcon sx={{ color: red[500] }} /></Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Remove allergy</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        ))}
                                    </ScrollArea >
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="w-full px-5">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                <label className="text-md font-semibold text-center">Organs WithChronic Condition
                                    <input placeholder="Organ" className="border border-blue-500 rounded-md px-2 m-2" id="organsWithChronicCondition" />
                                </label>
                                <TooltipProvider delayDuration={400}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={() => {
                                                    if (!document.getElementById('organsWithChronicCondition').value) return toast.error("Organ field is empty")
                                                    setOrgansWithChronicCondition([...organsWithChronicCondition, document.getElementById('organsWithChronicCondition').value])
                                                    document.getElementById('organsWithChronicCondition').value = ''
                                                    toast.message("Organ added", {
                                                        description: "See added Organs to see all the Organs added so far"
                                                    })
                                                }}
                                                variant={"outline"}
                                                className={cn(
                                                    " h-7 mx-4 justify-start text-left font-normal",
                                                )}
                                            ><AddIcon fontSize="medium" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add to organ list</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[160px] ml-3 justify-start text-left font-normal",
                                        )}
                                    >Added Organs</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <ScrollArea className="rounded-md border h-52 min-w-64">
                                        {organsWithChronicCondition.map((organ, index) => (
                                            <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                                                <span>{organ}</span>
                                                <TooltipProvider delayDuration={400}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setOrgansWithChronicCondition(organsWithChronicCondition.filter((_, i) => i !== index))
                                                                    toast.message("Organ removed")
                                                                }}
                                                                variant={"outline"}
                                                                className={cn(
                                                                    " h-7 mx-4 justify-start text-left font-normal",
                                                                )}
                                                            ><RemoveIcon sx={{ color: red[500] }} /></Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Remove organ</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        ))}
                                    </ScrollArea >
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="w-full px-5">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                <label className="text-md font-semibold m-1 text-center" >Medicine Name
                                    <input className="border border-blue-500 rounded-md px-2" id="medicineName" />
                                </label>
                                <label className="text-md font-semibold m-1 text-center" >Dose description
                                    <input className="border border-blue-500 rounded-md px-2" id="doseDescription" />
                                </label>
                                <TooltipProvider delayDuration={400}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={() => {
                                                    if (!document.getElementById('medicineName').value || !document.getElementById('doseDescription').value) return toast.error("Both Medication fields are required")
                                                    setMedications([...medications,
                                                    {
                                                        name: document.getElementById('medicineName').value,
                                                        dose: document.getElementById('doseDescription').value
                                                    }
                                                    ])
                                                    document.getElementById('medicineName').value = ''
                                                    document.getElementById('doseDescription').value = ''
                                                    toast.message("Medicine added", {
                                                        description: "See added Medicines to see all the Medicines added so far"
                                                    })
                                                }}
                                                variant={"outline"}
                                                className={cn(
                                                    " h-7 mx-4 justify-start text-left font-normal",
                                                )}
                                            ><AddIcon fontSize="medium" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add to Medications list</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[160px] justify-start text-left font-normal",
                                        )}
                                    >Added Medications</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <ScrollArea className="rounded-md border h-52 min-w-96">
                                        {medications.map((medication, index) => (
                                            <div key={index} className="flex justify-between flex-wrap p-1 border-b border-gray-300 w-full">
                                                <span>{medication.name}</span>
                                                <Separator className="bg-pink-500  w-[2px] h-5 " orientation="vertical" />
                                                <ScrollableContainer style={{ display: 'flex', flexWrap: 'wrap', width: '10rem' }}>{medication.dose}
                                                </ScrollableContainer>
                                                <TooltipProvider delayDuration={400}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setMedications(medications.filter((_, i) => i !== index))
                                                                    toast.message("Medication removed")
                                                                }}
                                                                variant={"outline"}
                                                                className={cn(
                                                                    " h-7 mx-4 justify-start text-left font-normal",
                                                                )}
                                                            ><RemoveIcon sx={{ color: red[500] }} /></Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Remove Medication</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        ))}
                                    </ScrollArea >
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
            <div className="flex flex-row justify-between items-center w-full m-2">
                <button type='button' disabled={!(currentSection > 0)} onClick={() => { setCurrentSection(a => ((a - 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Previous</button>
                <button type='button' onClick={handleSubmit(onSubmit)} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Test</button>
                <button type='button' disabled={!(currentSection < 5)} onClick={() => { setCurrentSection(a => ((a + 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Next</button>
            </div>
        </>
    );
}

export function LocationSection({ userData, setUserData, currentSection, setCurrentSection }) {
    const { register, handleSubmit, formState: { errors }, setValue, trigger } = useForm()
    const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
            watchLocationPermissionChange: true,
        });

    const onSubmit = (data) => {
        if (coords) {
            console.log(coords)
            setUserData({ ...userData, coords: { lat: coords.latitude, long: coords } })
        } else {
            console.log(data)
            setUserData({ ...userData, ...data })
        }
    }

    return !coords ? (
        <>
            <AnimatePresence>
                <motion.div className="flex flex-col items-center justify-evenly"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-2xl font-bold m-2 text-pink-500">Address</h1>
                    <div className="flex flex-row justify-evenly items-center w-11/12">
                        <label className="text-md font-semibold m-2">Street Address
                            <div className="w-full flex flex-col">
                                <input type="text" placeholder="Street Address" className="border-2 border-blue-500 rounded-md p-2" {...register("street_address", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.street_address && <span className="text-red-500">{errors.street_address?.message}</span>}
                            </div>
                        </label>
                        <label className="text-md font-semibold m-2">City
                            <div className="w-full flex flex-col">
                                <input type="text" placeholder="City" className="border-2 border-blue-500 rounded-md p-2" {...register("city", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.city && <span className="text-red-500">{errors.city?.message}</span>}
                            </div>
                        </label>
                    </div>
                    <div className="flex flex-row justify-evenly items-center w-11/12">
                        <label className="text-md font-semibold m-2">State
                            <div className="w-full flex flex-col">
                                <input type="text" placeholder="State" className="border-2 border-blue-500 rounded-md p-2" {...register("state", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.state && <span className="text-red-500">{errors.state?.message}</span>}
                            </div>
                        </label>
                        <label className="text-md font-semibold m-2">Country
                            <div className="w-full flex flex-col">
                                <input type="text" placeholder="Country" className="border-2 border-blue-500 rounded-md p-2" {...register("country", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.country && <span className="text-red-500">{errors.country?.message}</span>}
                            </div>
                        </label>
                    </div>
                    <h1 className="text-red-800 text-md font-bold">**Location not available from your browser please provide Address**</h1>
                </motion.div>
            </AnimatePresence>
            <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
            <div className="flex flex-row justify-between items-center w-full m-2">
                <button type='button' disabled={!(currentSection > 0)} onClick={() => { setCurrentSection(a => ((a - 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Previous</button>
                <button type='button' onClick={handleSubmit(onSubmit)} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Test</button>
                <button type='button' disabled={!(currentSection < 5)} onClick={() => { setCurrentSection(a => ((a + 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Save and Next</button>
            </div>
        </>
    ) : (
        <>
            <AnimatePresence>
                <motion.div className="flex flex-col items-center justify-center w-full"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-2xl font-bold m-2 text-pink-500">Location</h1>
                    <MapView initialPosition={[coords.latitude, coords.longitude]} />
                    <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
                </motion.div>
            </AnimatePresence>
            <div className="flex flex-row justify-between items-center w-full m-2">
                <button type='button' disabled={!(currentSection > 0)} onClick={() => { setCurrentSection(a => ((a - 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Previous</button>
                <button type='button' onClick={onSubmit} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Test</button>
                <button type='button' disabled={!(currentSection < 5)} onClick={() => { setCurrentSection(a => ((a + 1) % 6)) }} className="text-lg font-bold text-center mx-16 border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Save and Next</button>
            </div>
        </>
    )

}