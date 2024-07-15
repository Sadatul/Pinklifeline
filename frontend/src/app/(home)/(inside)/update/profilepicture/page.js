"use client"

import { Progress } from "@/components/ui/progress";
import { updateProfilePictureUrl } from "@/utils/constants";
import firebase_app from "@/utils/firebaseConfig";
import axios from "axios";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { toast } from "sonner";


export default function UpdateProfilePicturePage() {
    const storage = getStorage(firebase_app)
    const fileTypes = ["JPEG", "PNG", "JPG"];
    const [imageFile, setImageFile] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const router = useRouter();

    const saveProfilePicture = (pictureLink) => {
        const userId = localStorage.getItem('userId')
        const token = localStorage.getItem('token')
        if (!userId || !token) {
            toast.error("User not found", {
                description: "Please login again",
            });
            router.push("/login");
        }
        const headers = { 'Authorization': `Bearer ${token}` }
        axios.put(updateProfilePictureUrl(userId), { profilePicture: pictureLink }, {
            headers: headers
        }).then((response) => {
            toast.success("Profile picture updated successfully")
            router.push("/profile/" + userId)
        }).catch((error) => {
            toast.error("An error occured", {
                description: error.response.data?.message
            })
        })
    }

    const handleFileChange = (file) => {
        if (!file) return;
        setImageFile(file)
        setProfilePicturePreview(URL.createObjectURL(file))
    }
    const handleUpload = async () => {
        if (!imageFile) return;
        const filePath = `profileImages/${localStorage.getItem('userId') || new Date().toString()}/${imageFile.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                toast.error("Error uploading image", {
                    description: "Please try again later",
                });
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                saveProfilePicture(downloadURL);
            }
        );
    }
    return (
        <div className="flex flex-col items-center justify-evenly w-11/12 flex-grow">
            <div className="h-96 w-96 border rounded-lg border-purple-500">
                {profilePicturePreview && (
                    <div className="flex flex-col justify-center items-center">
                        <div className="flex flex-col items-center m-4 p-6 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 max-w-96">
                            <Image width={200} objectFit='scale-down' height={200} src={profilePicturePreview} alt="Preview" className="rounded-lg" />
                            {uploadProgress && <Progress variant='secondary' value={uploadProgress} className="w-[80%] mt-3" />}
                        </div>
                        <button onClick={handleUpload} className="border-2 bg-purple-600 text-white border-black rounded-md px-2 h-8 text-center mt-2">Upload</button>
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
    )
}