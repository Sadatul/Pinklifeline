'use client'
import { useEffect, useState } from "react"
import { getConsultationLocations, getProfilePicUrl, locationOnline, pagePaths, updateConsultationLocationUrl, updateProfilePictureUrl } from "@/utils/constants"
import { cn } from "@/lib/utils"
import { Banknote, Binary, Delete, ExternalLink, HardDriveUploadIcon, MapPinIcon, Pencil, Recycle, RecycleIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useSessionContext } from "@/app/context/sessionContext"
import Loading from "./loading"
import axiosInstance from "@/utils/axiosInstance"
import { toast } from "sonner"
import { Button } from "@mui/material"
import Link from "next/link"
import Image from "next/image"
import { FileUploader } from "react-drag-drop-files"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import firebase_app from "@/utils/firebaseConfig"


export function UpdateProfilePic({ className }) {
    const [profilePic, setProfilePic] = useState(undefined)
    const [loading, setLoading] = useState(true)
    const [imageFile, setImageFile] = useState(null)
    const storage = getStorage(firebase_app)
    const sessionContext = useSessionContext()

    useEffect(() => {
        axiosInstance.get(getProfilePicUrl).then(res => {
            setProfilePic(res.data?.profilePicture)
        }).catch(err => {
            console.log(err)
        }).finally(() => {
            setLoading(false)
        })
    }, [])

    if (loading) {
        return <Loading />
    }
    if (profilePic === undefined) {
        return <p className="m-auto text-2xl font-bold">Profile picture not found</p>
    }

    const handleFileChange = (file) => {
        setImageFile(file)
        setProfilePic(URL.createObjectURL(file))
    }

    return (
        <div className={cn("flex flex-col items-center w-full bg-gray-100 p-5 flex-1", className)}>
            <div className="w-10/12 flex flex-col rounded bg-white p-4 gap-2">
                <h1 className="text-2xl font-bold">Profile Picture</h1>
                <Separator />
                <FileUploader
                    allowedFileTypes={["image/*"]}
                    maxFileSize={1000000}
                    onUploadSuccess={(file) => {
                        setProfilePic(URL.createObjectURL(file))
                        toast.success("Profile picture updated successfully")
                    }}
                    onUploadError={(error) => {
                        toast.error("Error updating profile picture")
                    }}
                    handleChange={handleFileChange}

                />
                {profilePic && <Image src={profilePic} alt="profile picture" width={400} height={400} />}
                <div className="flex flex-row gap-5 justify-end items-center">
                    <button className="bg-blue-500 text-white p-2 rounded" onClick={() => {
                        window.location.href = pagePaths.dashboardPages.userdetailsPage
                    }}>Cancel</button>
                    <button className="bg-green-500 text-white p-2 rounded" onClick={() => {
                        if (!imageFile) return;
                        toast.loading("Uploading image")
                        const filePath = `profileImages/${new Date().toString()}/${imageFile.name}`;
                        const storageRef = ref(storage, filePath);
                        const uploadTask = uploadBytesResumable(storageRef, imageFile);
                        uploadTask.on(
                            'state_changed',
                            (snapshot) => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            },
                            (error) => {
                                toast.error("Error uploading image", {
                                    description: "Please try again later",
                                });
                            },
                            async () => {
                                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                axiosInstance.put(updateProfilePictureUrl(sessionContext?.sessionData?.userId), {
                                    profilePicture: downloadURL
                                }).then((res) => {
                                    toast.dismiss()
                                    toast.success("Image uploaded successfully")
                                    sessionStorage.setItem("profilePicLink", downloadURL)
                                    window.location.href = pagePaths.dashboardPages.userdetailsPage
                                }).catch((error) => {
                                    toast.error("Error uploading image", {
                                        description: "Please try again later",
                                    });
                                    console.log(error)
                                })
                            }
                        );
                    }}>Save</button>
                </div>
            </div>
        </div>
    )

}