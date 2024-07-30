'use client'

import { useForm } from "react-hook-form"
import { Separator } from "@/components/ui/separator"
import { FileUploader } from "react-drag-drop-files"
import { useState, useEffect, useRef, use } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { useGeolocated } from "react-geolocated"
import MapView from "@/app/components/map"
import { format, set } from "date-fns"
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
import { Progress } from "@/components/ui/progress"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useStompContext } from "../context/stompContext"
import { useRouter } from "next/navigation"
import { addConsultationLocationUrl, locationOnline, pagePaths, roles } from "@/utils/constants"
import axiosInstance from "@/utils/axiosInstance"
import { Checkbox } from "@/components/ui/checkbox"
import { useSessionContext } from "@/app/context/sessionContext"


export function UserInfoSection({ userDataRef, currentSection, setCurrentSection, totalSections, role, saveForm }) {
    const storage = getStorage(firebase_app)
    const fileTypes = ["JPEG", "PNG", "JPG"];
    const [imageFile, setImageFile] = useState(null)
    const [imageUploaded, setImageUploaded] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(null);
    const stompContext = useStompContext();
    const { register, handleSubmit, formState: { errors }, setValue, trigger, getValues } = useForm()
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const onSubmit = (data) => {
        userDataRef.current = { ...userDataRef.current, ...data }
        if (currentSection < totalSections - 1) {
            setCurrentSection(a => ((a + 1) % totalSections))
        }
        else {
            setConfirmDialogOpen(true)
        }
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
    const handleFileChange = (file) => {
        if (!file) return;
        setImageFile(file)
        userDataRef.current = { ...userDataRef.current, profilePicturePreview: URL.createObjectURL(file) }
    }
    const handleUpload = async () => {
        if (!imageFile) return;
        const uploadingToast = toast.loading("Uploading image", {
            duration: Infinity
        })
        const filePath = `profileImages/${localStorage.getItem('userId') || new Date().toString()}/${imageFile.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        setImageUploaded(true)
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            },
            (error) => {
                toast.error("Error uploading image", {
                    description: "Please try again later",
                });
                setImageUploaded(false)
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                userDataRef.current = { ...userDataRef.current, profilePictureUrl: downloadURL }
                toast.dismiss(uploadingToast)
                toast.success("Image uploaded successfully")
            }
        );
    }


    const validateForm = async () => {
        const result = await trigger();
        if (result) {
            if (currentSection < totalSections - 1) {
                setCurrentSection(a => ((a + 1) % totalSections))
            }
            else {
                setConfirmDialogOpen(true)
            }
        };
    }


    return (
        <>
            <AnimatePresence>
                <motion.div className="flex flex-col items-center justify-evenly h-full w-9/12"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-2xl font-bold m-2 text-pink-500">User Details</h1>
                    <div className="flex flex-row justify-between items-center w-full">
                        <label className="text-md font-semibold m-2">Full Name
                            <div className="w-full flex flex-col">
                                <input defaultValue={userDataRef.current?.fullName} type="text" className="border-2 rounded-md p-1 mt-2 border-blue-500" {...register("fullName", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.fullName && <span className="text-red-500">{errors.fullName?.message}</span>}
                            </div>
                        </label>
                        <label className="text-md font-semibold m-2 ">Weight(kg)
                            <div className="w-full flex flex-col">
                                <input defaultValue={userDataRef.current?.weight} type="number" className="number-input border-2 rounded-md p-1 mt-2 border-blue-500" min={10} {...register("weight", { required: "Weigh is required", max: { value: 1000, message: "Maximum weight 1000kg" }, min: { value: 10, message: "Minimum weight 10" } })} />
                                {errors.weight && <span className="text-red-500  text-sm">{errors.weight?.message}</span>}
                            </div>
                        </label>
                    </div>
                    <div className="flex flex-row justify-between items-center w-full m-2">
                        <label className="text-md font-semibold m-2 text-center">
                            Date of Birth
                            <div className="flex gap-4 mt-2">
                                <div>
                                    <select defaultValue={userDataRef.current?.dobDay || "day"} {...register("dobDay", { required: 'Day is required', validate: value => value != "day" || 'Please select a day' })} className="p-2 border rounded-lg w-24 bg-white border-blue-500">
                                        <option value="day" disabled >
                                            Day
                                        </option>
                                        {generateOptions(1, 31)}
                                    </select>
                                    {errors.dobDay && <p className="text-red-500 text-sm">{errors.dobDay?.message}</p>}
                                </div>
                                <div>
                                    <select defaultValue={userDataRef.current?.dobMonth || "month"} {...register("dobMonth", { required: 'Month is required', validate: value => value != "month" || 'Please select a month' })} className="p-2 w-24 border rounded-lg bg-white border-blue-500">
                                        <option value="month" disabled  >
                                            Month
                                        </option>
                                        {generateOptions(1, 12)}
                                    </select>
                                    {errors.dobMonth && <p className="text-red-500 text-sm">{errors.dobMonth?.message}</p>}
                                </div>
                                <div>
                                    <select defaultValue={userDataRef.current?.dobYear || "year"} {...register("dobYear", { required: 'Year is required', validate: value => value != "year" || 'Please select a year' })} className="p-2 w-24 border rounded-lg bg-white border-blue-500">
                                        <option value="year" disabled >
                                            Year
                                        </option>
                                        {generateOptions(1950, getCurrentYear())}
                                    </select>
                                    {errors.dobYear && <p className="text-red-500 text-sm">{errors.dobYear?.message}</p>}
                                </div>
                            </div>
                        </label>
                        <div className="flex">
                            <label className="text-md font-semibold m-2 text-center">
                                Height
                                <div className="flex gap-4 mt-2">
                                    <div>
                                        <select defaultValue={userDataRef.current?.heightFeet || "feet"} {...register("heightFeet", { required: 'Day is required', validate: value => value != "feet" || 'Please select a feet' })} className="p-2 border rounded-lg w-20 bg-white border-blue-500">
                                            <option value="feet" disabled >
                                                Feet
                                            </option>
                                            {generateOptions(1, 10)}
                                        </select>
                                        {errors.heightFeet && <p className="text-red-500 text-sm">{errors.heightFeet?.message}</p>}
                                    </div>
                                    <div>
                                        <select defaultValue={userDataRef.current?.heightInch || "inch"} {...register("heightInch", { required: 'Month is required', validate: value => value != "inch" || 'Please select a inch' })} className="p-2 w-20 border rounded-lg bg-white border-blue-500">
                                            <option value="inch" disabled  >
                                                Inch
                                            </option>
                                            {generateOptions(1, 11)}
                                        </select>
                                        {errors.heightInch && <p className="text-red-500 text-sm">{errors.heightInch?.message}</p>}
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <AlertDialog >
                        <AlertDialogTrigger asChild>
                            <Button className="px-2 py-1">{imageUploaded ? "Uploaded" : "Upload"} Profile Picture</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{imageUploaded ? "Uploaded" : "Upload"} Profile Picture</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div className="flex flex-col items-center justify-evenly flex-1">
                                        <div className={cn("w-96 border rounded-lg border-purple-500", imageUploaded ? "h-80" : "h-96")}>
                                            {userDataRef.current.profilePicturePreview && (
                                                <div className="flex flex-col justify-center items-center">
                                                    <div className="flex flex-col items-center m-4 p-6 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 w-full">
                                                        <Image width={250} objectFit='scale-down' height={250} src={userDataRef.current.profilePicturePreview} alt="Preview" className="rounded-lg" />
                                                    </div>
                                                </div>
                                            )}
                                            {!imageUploaded &&
                                                <FileUploader handleChange={handleFileChange}
                                                    multiple={false}
                                                    types={fileTypes}
                                                    name="file"
                                                    onTypeError={() => {
                                                        toast.error("Invalid file type", {
                                                            description: "Only jpg or png files are allowed",
                                                        })
                                                    }}
                                                />}
                                            <input hidden id="file"></input>
                                        </div>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="m-2">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleUpload} disabled={imageUploaded}>
                                    Upload
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </motion.div>
            </AnimatePresence>
            <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
            <div className="flex flex-row justify-between items-center w-full m-2 px-8">
                <button type='button' disabled={!(currentSection > 0)}
                    onClick={() => {
                        userDataRef.current = { ...userDataRef.current, ...getValues() }
                        setCurrentSection(a => ((a - 1) % totalSections))
                    }}
                    className="text-lg font-bold text-center border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out"
                >
                    Previous
                </button>
                <button type='button' onClick={handleSubmit(onSubmit)}
                    className="text-lg px-5 font-bold text-center  border hover:shadow-md bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl hover:scale-105 transition ease-out" >
                    {currentSection === totalSections - 1 ? "Save" : "Next"}
                </button>
                {currentSection === (totalSections - 1) && (
                    <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen} >
                        <AlertDialogTrigger asChild>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You can&apos;t change your full name and date of birth once you save the form.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={saveForm}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </>
    )
}

// location, start, end, workdays, fees
export function DoctorChamberLocationSection({ }) {
    const sessionContext = useSessionContext()
    const { register, handleSubmit, formState: { errors }, setValue, trigger, getValues } = useForm()
    const userDataRef = useRef({})
    const [isOnline, setIsOnline] = useState(false)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const router = useRouter()
    const workdays = useRef([
        { day: "sat", on: false },
        { day: "sun", on: false },
        { day: "mon", on: false },
        { day: "tue", on: false },
        { day: "wed", on: false },
        { day: "thu", on: false },
        { day: "fri", on: false }])

    const daySequence = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"]

    const workdaysToBinaryString = (workdays) => {
        let binaryString = ""
        for (let i = 0; i < daySequence.length; i++) {
            if (workdays[i].day === daySequence[i]) {
                binaryString += (workdays[i].on ? "1" : "0")
            }
            else {
                binaryString += workdays.find((day) => day.day === daySequence[i])
            }
        }
        return binaryString
    };

    const onSubmit = (data) => {
        userDataRef.current = { ...userDataRef.current, ...data }
        userDataRef.current = { ...userDataRef.current, workdaysString: workdaysToBinaryString(userDataRef.current.workdays) }
        console.log("user data: ", userDataRef.current)
        setConfirmDialogOpen(true)
    }

    const saveLocation = () => {
        console.log("saving location")
        const savingLocationToast = toast.loading("Saving location")
        const loacationForm = {
            location: isOnline ? locationOnline : userDataRef.current.location,
            start: userDataRef.current.startTime + ":00",
            end: userDataRef.current.endTime + ":00",
            workdays: userDataRef.current.workdaysString,
            fees: userDataRef.current.fees
        }
        axiosInstance.post(addConsultationLocationUrl(sessionContext.sessionData.userId), loacationForm, { headers: sessionContext.sessionData.headers }).then((response) => {
            console.log(response.data)
            toast.dismiss()
            toast.success("Location added successfully")
            setConfirmDialogOpen(false)
        }).catch((error) => {
            toast.dismiss()
            console.log(error)
            toast.error("Error adding location", {
                description: error.response?.data?.message
            })
        })
    }

    useEffect(() => {
        register("workdays", { validate: value => value?.some(day => day.on) || "Please select at least one workday" })
    }, [register])

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <>
            <AnimatePresence>
                <motion.div className="flex flex-col items-center h-full w-full"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-2xl font-bold m-2 text-pink-500 mb-4">Add Consultation Location and Time</h1>
                    <div className="flex flex-col w-full items-center my-2">
                        <h1 className="text-center text-2xl font-semibold">Location and Fees</h1>
                        <div className="flex flex-row justify-evenly items-center w-11/12">
                            <label className="text-md font-semibold mx-2">Location
                                <div className="w-full flex flex-col mt-2 relative">
                                    <input disabled={isOnline} defaultValue={userDataRef.current?.location} type="text" className={cn("border-2 rounded-md px-2", isOnline ? "border-gray-500 bg-gray-200" : "border-blue-500")} {...register("location", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                    {errors.location && <span className="text-red-500 mt-7 absolute">{errors.location?.message}</span>}
                                </div>
                            </label>
                            <label className="text-md font-semibold mt-8 relative">isOnline
                                <Checkbox checked={isOnline} onCheckedChange={() => setIsOnline(!isOnline)} className="border-2 ml-2 absolute top-1" />
                            </label>
                            <label className="text-md font-semibold mx-2">Fees
                                <div className="w-full flex flex-col mt-2 relative">
                                    <input defaultValue={userDataRef.current?.fees} type="number" min={0} className={cn("number-input border-2 border-blue-500 rounded-md px-2 w-32")} {...register("fees", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                    {errors.fees && <span className="text-red-500 mt-7 absolute">{errors.fees?.message}</span>}
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col w-full items-center mt-10">
                        <h1 className="text-center text-2xl font-semibold">Time</h1>
                        <div className="flex flex-row w-10/12 justify-evenly">
                            <div className="flex flex-col">
                                <label htmlFor="starttime" className="block text-sm font-medium text-gray-900 dark:text-white">Start time:</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input type="time" id="starttime" className="bg-gray-50 border-2 leading-none border-purple-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="00:00" max="23:59" defaultValue={"00:00"} {...register("startTime", { required: "This field is required" })} />
                                </div>
                                {errors.startTime && <span className="text-red-500">{errors.startTime?.message}</span>}
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="time" className="block text-sm font-medium text-gray-900 dark:text-white">End time:</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input type="time" id="time" className="bg-gray-50 border-2 leading-none border-purple-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="00:00" max="23:59" defaultValue={"00:00"} {...register("endTime", { required: "This field is required" })} />
                                </div>
                                {errors.endTime && <span className="text-red-500">{errors.endTime?.message}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-3 items-center">

                        <div className="text-md font-semibold mx-2 text-center">Work days
                            <div className="flex flex-row space-x-2 mt-2">
                                {workdays.current.map((day, index) => (
                                    <label key={index} className="cursor-pointer select-none">
                                        <input value={day.on} type="checkbox" className="hidden peer" />
                                        <div onClick={() => {
                                            workdays.current[index].on = !workdays.current[index].on
                                            setValue("workdays", workdays.current)
                                            trigger("workdays")
                                        }} className="peer-checked:bg-green-600 bg-red-600 text-white font-semibold peer-checked:text-white px-2 rounded-md transition-colors border border-gray-400 shadow-inner capitalize">
                                            {day.day}
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.workdays && <span className="text-red-500">{errors.workdays?.message}</span>}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
            <div className="flex flex-row items-center w-full m-2 px-8 justify-evenly">
                <Button variant="outline" className={"border-2 border-gray-600"}
                    onClick={() => {
                        router.push(pagePaths.dashboard)
                    }} >
                    Skip
                </Button>
                <Button className=" hover:bg-gray-200 border-2 border-gray-700 hover:text-gray-800 bg-gray-700 text-gray-200" onClick={() => {
                    handleSubmit(onSubmit)()
                }}>
                    Add Location
                </Button>
                <AlertDialog open={confirmDialogOpen}  >
                    <AlertDialogTrigger asChild>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Check your location information</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="flex flex-col items-center justify-evenly flex-1">
                                    <div className="flex flex-row w-full justify-between items-center">
                                        <p className="text-lg text-black ">Location: {isOnline ? locationOnline : userDataRef.current.location}</p>
                                        <p className="text-lg text-black">Fees: {userDataRef.current.fees}</p>
                                    </div>
                                    <div className="flex flex-row w-full justify-between items-center">
                                        <p className="text-lg text-black">Start Time: {userDataRef.current.startTime}</p>
                                        <p className="text-lg text-black">End Time: {userDataRef.current.endTime}</p>
                                    </div>
                                    <p className="text-lg text-black">Workdays: {userDataRef.current.workdays?.map((day, index) => capitalizeFirstLetter(day.on ? day.day + " " : ""))}</p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => { setConfirmDialogOpen(false) }}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={saveLocation}>
                                Add
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    )
}

export function DoctorInfoSection({ userDataRef, currentSection, setCurrentSection, totalSections, role, saveForm }) {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, trigger, getValues } = useForm()
    const storage = getStorage(firebase_app)
    const fileTypes = ["JPEG", "PNG", "JPG"];
    const [imageFile, setImageFile] = useState(null)
    const [disableButtons, setDisableButtons] = useState(false)

    const onSubmit = (data) => {
        userDataRef.current = { ...userDataRef.current, ...data }
        console.log("user data: ", userDataRef.current)
        if (currentSection < (totalSections - 1)) {
            setCurrentSection(a => ((a + 1) % totalSections))
        }
        else {
            setConfirmDialogOpen(true)
        }
    }
    const handleFileChange = (file) => {
        if (!file) return;
        setImageFile(file)
        userDataRef.current = { ...userDataRef.current, profilePicturePreview: URL.createObjectURL(file) }
    }
    const handleUpload = async () => {
        if (!imageFile) return;
        const uploadingToast = toast.loading("Uploading image", {
            duration: Infinity
        })
        const filePath = `profileImages/${localStorage.getItem('userId') || new Date().toString()}/${imageFile.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        setDisableButtons(true)
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("progress :", progress)
            },
            (error) => {
                toast.error("Error uploading image", {
                    description: "Please try again later",
                });
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                userDataRef.current = { ...userDataRef.current, profilePictureUrl: downloadURL }
                setDisableButtons(false)
                toast.dismiss(uploadingToast)
                toast.success("Image uploaded successfully")
            }
        );
    }

    return (
        <>
            <AnimatePresence>
                <motion.div className="flex flex-col items-center justify-evenly w-full h-full space-y-5"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-2xl font-bold m-2 text-pink-500">Doctor info</h1>
                    <div className="flex flex-row justify-evenly items-center w-11/12 relative">
                        <label className="text-md font-semibold mx-2">Full Name
                            <div className="w-full flex flex-col">
                                <input defaultValue={userDataRef.current?.fullName} type="text" className="border-2 border-blue-500 rounded-md px-2" {...register("fullName", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.fullName && <span className="text-red-500">{errors.fullName?.message}</span>}
                            </div>
                        </label>
                        <AlertDialog >
                            <AlertDialogTrigger asChild>
                                <button disabled={disableButtons} className="px-2 border bg-gray-700 text-white rounded-lg h-8 mt-5">Add Profile Picture</button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Upload Profile Picture</AlertDialogTitle>
                                    <AlertDialogDescription asChild>
                                        <div className="flex flex-col items-center justify-evenly flex-1">
                                            <div className="min-h-96 w-96 border rounded-lg border-purple-500">
                                                {userDataRef.current.profilePicturePreview && (
                                                    <div className="flex flex-col justify-center items-center">
                                                        <div className="flex flex-col items-center m-4 p-6 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 w-full">
                                                            <Image width={250} objectFit='scale-down' height={250} src={userDataRef.current.profilePicturePreview} alt="Preview" className="rounded-lg" />
                                                        </div>
                                                    </div>
                                                )}
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
                                                <input hidden id="file"></input>
                                            </div>
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="m-2">
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleUpload}>
                                        Upload
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <label className="text-md font-semibold mx-2">Registration Number
                            <div className="w-full flex flex-col">
                                <input type="text" defaultValue={userDataRef.current?.registrationNumber} className="border-2 border-blue-500 rounded-md px-2" {...register("registrationNumber", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.registrationNumber && <span className="text-red-500">{errors.registrationNumber?.message}</span>}
                            </div>
                        </label>
                    </div>
                    <div className="flex flex-row justify-evenly items-strech w-11/12">
                        <label className="text-md font-semibold mx-2 w-7/12">Qualifications
                            <div className="w-full flex flex-col">
                                <input type="text" defaultValue={userDataRef.current?.qualifications} className="border-2 border-blue-500 rounded-md px-2" {...register("qualifications", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.qualifications && <span className="text-red-500">{errors.qualifications?.message}</span>}
                                <span className="text-sm text-gray-500">Add your qualifications separated by commas. Eg: MBBS, MD, DM</span>
                            </div>
                        </label>
                        <label className="text-md font-semibold mx-2 w-5/12">Work Place
                            <div className="w-full flex flex-col">
                                <input type="text" defaultValue={userDataRef.current?.workplace} className="border-2 border-blue-500 rounded-md px-2" {...register("workplace", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.workplace && <span className="text-red-500">{errors.workplace?.message}</span>}
                            </div>
                        </label>
                    </div>
                    <div className="flex flex-row justify-evenly items-strech w-11/12">
                        <label className="text-md font-semibold mx-2 w-7/12">Department
                            <div className="w-full flex flex-col">
                                <input type="text" defaultValue={userDataRef.current?.department} className="border-2 border-blue-500 rounded-md px-2" {...register("department", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.department && <span className="text-red-500">{errors.department?.message}</span>}
                            </div>
                        </label>
                        <label className="text-md font-semibold mx-2 w-5/12">Designation
                            <div className="w-full flex flex-col">
                                <input type="text" defaultValue={userDataRef.current?.designation} className="border-2 border-blue-500 rounded-md px-2" {...register("designation", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.designation && <span className="text-red-500">{errors.designation?.message}</span>}
                            </div>
                        </label>
                        <label className="text-md font-semibold mx-2 w-5/12">Contact Number
                            <div className="w-full flex flex-col">
                                <input type="tel" defaultValue={userDataRef.current?.contactNumber} className="border-2 border-blue-500 rounded-md px-2" {...register("contactNumber", {
                                    required: "This field is required", maxLength: { value: 32, message: "Max length 32" },
                                    validate: (value) => {
                                        return (value.length === 11 && /^\d+$/.test(value) && String(value).startsWith("01")) || "Invalid contact number"
                                    }
                                })} />
                                {errors.contactNumber && <span className="text-red-500">{errors.contactNumber?.message}</span>}
                                <span className="text-sm text-gray-500">Contact number for patients</span>
                            </div>
                        </label>
                    </div>
                </motion.div>
            </AnimatePresence>
            <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
            <div className="flex flex-row justify-between items-center w-full m-2 px-8">
                <button type='button' disabled={!(currentSection > 0) || disableButtons}
                    onClick={() => {
                        userDataRef.current = { ...userDataRef.current, ...getValues() }
                        setCurrentSection(a => ((a - 1) % totalSections))
                    }}
                    className="text-lg font-bold text-center border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out"
                >
                    Previous
                </button>
                <button disabled={disableButtons} type='button' onClick={() => {
                    console.log("Hello")
                    console.log(errors)
                    handleSubmit(onSubmit)()
                }}
                    className="text-lg px-5 font-bold text-center  border hover:shadow-md bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl hover:scale-105 transition ease-out" >
                    {currentSection === totalSections - 1 ? "Save" : "Next"}
                </button>
                {currentSection === (totalSections - 1) && (
                    <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen} >
                        <AlertDialogTrigger asChild>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You can&apos;t change your full name and date of birth once you save the form.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={saveForm}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </>
    )
}

export function NurseInfoSection({ userDataRef, currentSection, setCurrentSection, totalSections, role, saveForm }) {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, trigger } = useForm()
    const fileTypes = ["JPEG", "PNG"];
    const handleFileChange = (file) => {
        setValue("nurseDocs", file)
        trigger("nurseDocs")
    }
    useEffect(() => {
        register("nurseDocs", { required: "Document is required" });
    }, [register]);

    const onSubmit = (data) => {
        userDataRef.current = { ...userDataRef.current, ...data }
        if (currentSection < totalSections - 1) {
            setCurrentSection(a => ((a + 1) % totalSections))
        }
        else {
            setConfirmDialogOpen(true)
        }
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
                        <label className="text-md font-semibold mx-2">Full Name
                            <div className="w-full flex flex-col">
                                <input type="text" className="border-2 border-blue-500 rounded-md px-2" {...register("fullName", { required: "This field is required", maxLength: { value: 32, message: "Max length 32" } })} />
                                {errors.fullName && <span className="text-red-500">{errors.fullName?.message}</span>}
                            </div>
                        </label>
                    </div>
                    <div className="flex flex-row justify-evenly items-center w-11/12">
                        <p className="text-md font-semibold mx-2 p-2">Current Hospital</p>
                        <div className="w-full flex flex-col">
                            <input type="text" className="border-2 border-blue-500 rounded-md p-2" {...register("currentHospital", { maxLength: { value: 32, message: "Max length 32" } })} />
                            {errors.currentHospital && <span className="text-red-500">{errors.currentHospital?.message}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col justify-evenly items-center w-11/12">
                        <p className="text-md font-semibold m-2 p-2">Experience and Other description(optional but recommended)</p>
                        <div className="w-full flex flex-col">
                            <textarea {...register("description", { maxLength: { value: 200, message: "Max length 200" } })} className="w-3/4 m-auto min-h-24 p-2 rounded-xl border-2 border-gray-100"></textarea>
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
            <div className="flex flex-row justify-between items-center w-full m-2 px-8">
                <button type='button' disabled={!(currentSection > 0)} onClick={() => { setCurrentSection(a => ((a - 1) % totalSections)) }} className="text-lg font-bold text-center border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Previous</button>
                <button type='button' onClick={handleSubmit(onSubmit)}
                    className="text-lg px-5 font-bold text-center  border hover:shadow-md bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl hover:scale-105 transition ease-out" >
                    {currentSection === totalSections - 1 ? "Save" : "Next"}
                </button>
                {currentSection === (totalSections - 1) && (
                    <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen} >
                        <AlertDialogTrigger asChild>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You can&apos;t change your full name and date of birth once you save the form.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={saveForm}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </>
    )
}

export function MedicalInfoSection({ userDataRef, currentSection, setCurrentSection, totalSections, role, saveForm }) {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [date, setDate] = useState(userDataRef.current?.lastPeriodDate ? new Date(userDataRef.current?.lastPeriodDate) : null);
    const [diagnosisDate, setDiagnosisDate] = useState(userDataRef.current?.diagnosisDate ? new Date(userDataRef.current?.diagnosisDate) : null);
    const { register, handleSubmit, watch, formState: { errors }, setValue, trigger, getValues } = useForm();
    const cancerHistory = watch('cancerHistory');
    const [cancerRelatives, setCancerRelatives] = useState(userDataRef.current?.cancerRelatives || []);
    const [periodIrregularities, setPeriodIrregularities] = useState(userDataRef.current?.periodIrregularities || []);
    const [allergies, setAllergies] = useState(userDataRef.current?.allergies || []);
    const [organsWithChronicCondition, setOrgansWithChronicCondition] = useState(userDataRef.current?.organsWithChronicCondition || []);
    const [medications, setMedications] = useState(userDataRef.current?.medications || []);
    const isInitialised = useRef(false);
    if (!isInitialised.current) {
        register("lastPeriodDate", { required: "Last Period Date is required" });
        if (role === "ROLE_PATIENT") register("diagnosisDate", { required: "Diagnosis Date is required" });
        if (userDataRef.current?.lastPeriodDate) {
            setValue("lastPeriodDate", userDataRef.current?.lastPeriodDate)
            trigger("lastPeriodDate")
        }
        if (userDataRef.current?.diagnosisDate) {
            setValue("diagnosisDate", userDataRef.current?.diagnosisDate)
            trigger("diagnosisDate")
        }
        isInitialised.current = true;
    }

    const onSubmit = (data) => {
        userDataRef.current = { ...userDataRef.current, ...data, cancerRelatives: (cancerHistory == "Y" ? cancerRelatives : []), periodIrregularities: periodIrregularities, allergies: allergies, organsWithChronicCondition: organsWithChronicCondition, medications: medications }
        console.log("user data ref in medical info", userDataRef.current)
        if (currentSection < totalSections - 1) {
            setCurrentSection(a => ((a + 1) % totalSections))
        }
        else {
            setConfirmDialogOpen(true)
        }
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
                    <h1 className="text-2xl font-bold m-2 text-pink-500">Medical Information Form</h1>
                    <div className="flex justify-between w-full px-5">
                        <div>
                            <label className="text-md font-semibold m-2 text-center">Cancer History:
                                <select defaultValue={userDataRef.current?.cancerHistory || "N"} id="cancerHistory" {...register('cancerHistory', { required: "This field is required" })} className="px-2 border rounded-lg w-20 bg-white border-blue-500 ml-3">
                                    <option value="N">No</option>
                                    <option value="Y">Yes</option>
                                </select>
                            </label>
                            {errors.cancerHistory && <span className="text-red-500 text-sm">{errors.cancerHistory?.message}</span>}
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
                        <div className="flex flex-col">
                            <label className="text-md m-2 font-semibold text-center" >Last Period Date:
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
                                                date > new Date() || date < new Date("1950-01-01")
                                            }
                                            initialFocus
                                            defaultValue={userDataRef.current?.lastPeriodDate}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </label>
                            {errors.lastPeriodDate && <span className="text-red-500 text-sm">{errors.lastPeriodDate?.message}</span>}
                        </div>

                        <div className=" w-1/3">
                            <label className="text-md font-semibold m-2 text-center">Average Cycle Length (days):
                                <input defaultValue={userDataRef.current?.avgCycleLength} className=" number-input border border-blue-500 rounded-md px-2" type="number" id="avgCycleLength" min={0} {...register('avgCycleLength', { required: "This field is required", min: { value: 0, message: "Avg Cycle can not be negative" } })} />
                            </label>
                            {errors.avgCycleLength && <span className="text-red-500 text-sm">{errors.avgCycleLength?.message}</span>}
                        </div>
                    </div>
                    {role === "ROLE_PATIENT" &&
                        <div className="flex justify-between w-full items-center px-5">
                            <div className="flex flex-col">
                                <label className="text-md m-2 font-semibold text-center" >Diagnose Date:
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[160px] ml-3 justify-start text-left font-normal",
                                                    !diagnosisDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {diagnosisDate ? format(diagnosisDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={diagnosisDate}
                                                onSelect={(selectedDate) => {
                                                    setDiagnosisDate(selectedDate)
                                                    setValue("diagnosisDate", selectedDate)
                                                    trigger("diagnosisDate")
                                                }}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1950-01-01")
                                                }
                                                initialFocus
                                                defaultValue={userDataRef.current?.diagnosisDate}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </label>
                                {errors.diagnosisDate && <span className="text-red-500 text-sm">{errors.diagnosisDate?.message}</span>}
                            </div>

                            <div className=" w-1/3">
                                <label className="text-md font-semibold m-2 text-center">Current Stage:
                                    <select defaultValue={userDataRef.current?.cancerStage || "cancerStage"} {...register("cancerStage", { required: 'Cancter stage is required', validate: value => value != "cancerStage" || 'Please select a stage' })} className="p-2 w-28 ml-1 border rounded-lg bg-white border-blue-500 text-sm">
                                        <option value="cancerStage" disabled  >
                                            Current Cancer Stage
                                        </option>
                                        <option value="STAGE_0">Stage 0</option>
                                        <option value="STAGE_1">Stage 1</option>
                                        <option value="STAGE_2">Stage 2</option>
                                        <option value="STAGE_3">Stage 3</option>
                                        <option value="STAGE_4">Stage 4</option>
                                        <option value="SURVIVOR">Survivor</option>
                                    </select>
                                </label>
                                {errors.avgCycleLength && <span className="text-red-500 text-sm">{errors.cancerStage?.message}</span>}
                            </div>
                        </div>
                    }

                    <div className="w-full px-5">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                                <label className="text-md font-semibold m-2 text-center">Period Irregularities:
                                    <input className="border border-blue-500 rounded-md px-2 m-2" id="periodIrregularities" />
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
                                    <input className="border border-blue-500 rounded-md px-2 m-2" id="allergies" />
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
                                    <input className="border border-blue-500 rounded-md px-2 m-2" id="organsWithChronicCondition" />
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
                                                        doseDescription: document.getElementById('doseDescription').value
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
                                                <ScrollableContainer style={{ display: 'flex', flexWrap: 'wrap', width: '10rem' }}>{medication.doseDescription}
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
            <div className="flex flex-row justify-between items-center w-full m-2 px-8">
                <button type='button' disabled={!(currentSection > 0)}
                    onClick={() => {
                        userDataRef.current = { ...userDataRef.current, ...getValues() }
                        setCurrentSection(a => ((a - 1) % totalSections))
                    }}
                    className="text-lg font-bold text-center border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out"
                >
                    Previous
                </button>
                <button type='button' onClick={handleSubmit(onSubmit)}
                    className="text-lg px-5 font-bold text-center  border hover:shadow-md bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl hover:scale-105 transition ease-out" >
                    {currentSection === totalSections - 1 ? "Save" : "Next"}
                </button>
                {currentSection === (totalSections - 1) && (
                    <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen} >
                        <AlertDialogTrigger asChild>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You can&apos;t change your full name and date of birth once you save the form.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={saveForm}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </>
    );
}

export function LocationSection({ userDataRef, currentSection, setCurrentSection, totalSections, saveForm }) {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [position, setPosition] = useState(null)
    const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
            watchLocationPermissionChange: true,
        });

    const onSubmit = () => {
        if (!position) return toast.error("Location is required")

        userDataRef.current = { ...userDataRef.current, location: position }
        if (currentSection < totalSections - 1) {
            setCurrentSection(a => ((a + 1) % totalSections))
        }
        else {
            setConfirmDialogOpen(true)
        }
    }

    return !coords ? (
        <>
            <div className="flex flex-col items-center justify-center w-full text-red-500 text-2xl font-bold">
                **You need to enable location services to continue**
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
                    <MapView position={position} setPosition={setPosition} />
                </motion.div>
            </AnimatePresence>
            <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
            <div className="flex flex-row justify-between items-center w-full m-2 px-8">
                <button type='button' disabled={!(currentSection > 0)}
                    onClick={() => {
                        userDataRef.current = { ...userDataRef.current, location: position }
                        setCurrentSection(a => ((a - 1) % totalSections))
                    }}
                    className="text-lg font-bold text-center border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out"
                >
                    Previous
                </button>
                <button type='button' onClick={onSubmit}
                    className="text-lg px-5 font-bold text-center  border hover:shadow-md bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl hover:scale-105 transition ease-out" >
                    {currentSection === totalSections - 1 ? "Save" : "Next"}
                </button>
                {currentSection === (totalSections - 1) && (
                    <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen} >
                        <AlertDialogTrigger asChild>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You can&apos;t change your full name and date of birth once you save the form.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={saveForm}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </>
    )

}


// export function ImageUploadSection({ userData, setUserData, currentSection, setCurrentSection, totalSections }) {
//     const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
//     const fileTypes = ["JPEG", "PNG"];
//     const [imageFile, setImageFile] = useState(null)
//     const [imagePreview, setImagePreview] = useState(null)
//     const handleFileChange = (file) => {
//         console.log("File changed")
//         console.log(file)
//         setImageFile(file)
//         setUserData({ ...userData, profilePicture: file, profilePicturePreview: URL.createObjectURL(file) })
//         setImagePreview(URL.createObjectURL(file));
//     }
//     return (
//         <>
//             <AnimatePresence>
//                 <motion.div className="flex flex-col items-center justify-evenly"
//                     initial={{ opacity: 0, x: '100%' }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: '-100%' }}
//                     transition={{ duration: 0.3 }}
//                 >
//                     <h1 className="text-2xl font-bold m-4 text-pink-500">Upload Profile Picture</h1>
//                     <div className="flex flex-col items-center justify-evenly w-11/12">
//                         <FileUploader handleChange={handleFileChange}
//                             multiple={false}
//                             types={fileTypes}
//                             name="file"
//                             label={"Upload your profile picture. Only jpg or png files are allowed."}
//                             onTypeError={() => {
//                                 toast.error("Invalid file type", {
//                                     description: "Only jpg or png files are allowed",
//                                 })
//                             }}
//                         />
//                         <div className="flex flex-col items-center m-4 p-6 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 w-80 h-72">
//                             {!imagePreview && (
//                                 <div className=" h-full flex flex-col justify-center items-center">
//                                     <p className="text-2xl text-gray-500 text-center">
//                                         Upload Image for Preview
//                                     </p>
//                                 </div>
//                             )}
//                             {imagePreview && (
//                                 <Image width={300} height={300} src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
//                             )}
//                             {/* <FileUploader handleChange={handleFileChange} name="file" types={fileTypes} /> */}
//                         </div>
//                     </div>
//                 </motion.div>
//             </AnimatePresence>
//             <Separator className="bg-pink-500 m-2 w-11/12 h-[2px]" />
//             <div className="flex flex-row justify-between items-center w-full m-2 px-8">
//                 <button type='button' disabled={!(currentSection > 0)} onClick={() => { setCurrentSection(a => ((a - 1) % totalSections)) }} className="text-lg font-bold text-center border bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl px-5 hover:scale-105 transition ease-out">Previous</button>
//                 <button type='button' onClick={handleSubmit(onSubmit)}
//                     className="text-lg px-5 font-bold text-center  border hover:shadow-md bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl hover:scale-105 transition ease-out" >
//                     {currentSection === totalSections - 1 ? "Save" : "Next"}
//                 </button>
//                 <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen} >
//                     <AlertDialogTrigger asChild>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent>
//                         <AlertDialogHeader>
//                             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//                             <AlertDialogDescription>
//                                 You can't change your full name and date of birth once you save the form.
//                             </AlertDialogDescription>
//                         </AlertDialogHeader>
//                         <AlertDialogFooter>
//                             <AlertDialogCancel>Cancel</AlertDialogCancel>
//                             <AlertDialogAction onClick={saveForm}>
//                                 Continue
//                             </AlertDialogAction>
//                         </AlertDialogFooter>
//                     </AlertDialogContent>
//                 </AlertDialog>
//             </div>
//         </>
//     )
// }