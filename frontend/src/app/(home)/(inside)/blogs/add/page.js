'use client'

import { useMemo, useRef, useState } from "react";
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
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { FileUploader } from "react-drag-drop-files";
import { Button } from "@/components/ui/button";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import firebase_app from "@/utils/firebaseConfig";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { set } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { blogsUrl, pagePaths } from "@/utils/constants";
import axiosInstance from "@/utils/axiosInstance";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import { LinkIcon, Trash2 } from "lucide-react";

import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function AddBlogPage() {
    const config = useMemo(() => ({
        readonly: false,
        height: "480px",
        placeholder: "Type your blog content here...",
        spellcheck: true,
        useNativeTooltip: true,
    }), []);
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState(null);
    const [coverImagePreviewUrl, setCoverImagePreviewUrl] = useState(null);
    const storage = getStorage(firebase_app)
    const [imageUploaded, setImageUploaded] = useState(false)
    const [coverImageUrl, setCoverImageUrl] = useState(null)
    const fileTypes = ["JPEG", "PNG", "JPG"];

    const handleFileChange = (file) => {
        if (!file) return;
        setCoverImage(file)
        setCoverImagePreviewUrl(URL.createObjectURL(file))
    }

    const handleUpload = async () => {
        if (!coverImage) return;
        const uploadingToast = toast.loading("Uploading image", {
            duration: Infinity
        })
        const filePath = `coverImage/${new Date().toString()}/${coverImage.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, coverImage);
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
                setCoverImageUrl(downloadURL)
                toast.dismiss()
                toast.success("Image uploaded successfully")
            }
        );
    }

    const handleDelete = async (imageUrl) => {
        try {
            // Create a reference to the file to delete
            const storage = getStorage(); // Initialize Firebase storage instance
            const fileRef = ref(storage, imageUrl);

            // Delete the file
            await deleteObject(fileRef);

            // Show success message
            setCoverImageUrl(null);
            setCoverImage(null);
            setCoverImagePreviewUrl(null);
            setImageUploaded(false);
            toast.success("Image deleted successfully");
        } catch (error) {
            // Handle any errors
            toast.error("Error deleting image", {
                description: "Please try again later",
            });
        }
    }

    return (
        <div className="flex flex-col w-full h-full items-center gap-3 p-3 overflow-x-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]  from-gray-200 via-gray-200 to-gray-300 relative">
            <div className="absolute top-3 right-6 w-fit h-fit flex items-center gap-3">
                <Link href={pagePaths.blogsPage} target='_self' className="p-2 hover:scale-95 bg-gray-200 rounded-lg border border-black shadow-inner" >
                    Cancel
                </Link>
                <Button className="hover:scale-95" onClick={() => {
                    console.log("Post")
                    console.log(content)
                    const title = document.getElementById("blog-title").value
                    const coverText = document.getElementById("blog-cover-text").value
                    const coverImageLink = coverImageUrl
                    const blogContent = `${coverImageLink}@@@${coverText}@@@${content}`
                    axiosInstance.post(blogsUrl, {
                        title: title,
                        content: blogContent,
                    }).then((res) => {
                        toast.success("Blog posted successfully")
                        window.open(pagePaths.blogsPage, "_self")
                    }).catch((err) => {
                        console.log(err)
                    })
                }}>
                    Post
                </Button>

            </div>
            <h1 className="text-2xl font-bold">Add Blog</h1>
            <div className="flex flex-row w-full gap-8 text-lg py-3 px-2 rounded bg-purple-100 items-center">
                <div className="flex flex-row items-center gap-3">
                    Blog Title
                    <input id="blog-title" type="text" className="border text-base border-gray-500 px-2 py-1 rounded shadow-inner w-72" />
                </div>
                <div className="flex flex-row items-center gap-3">
                    Add cover text
                    <div className="flex flex-col gap-1 translate-y-3">
                        <textarea maxLength={200} id="blog-cover-text" className="border w-80 text-sm border-gray-500 p-2 shadow-inner rounded"
                            onChange={(e) => {
                                if (e.target.value.length === 0) {
                                    document.getElementById("cover-text-characters").innerText = `Max 200 characters`
                                    return
                                }
                                document.getElementById("cover-text-characters").innerText = `Max 200 characters(${e.target.value.length}/200)`
                            }}
                        />
                        <span id="cover-text-characters" className="text-sm text-gray-500">Max 200 characters</span>
                    </div>
                </div>
                <AlertDialog >
                    <AlertDialogTrigger asChild>
                        <Button className="px-2 py-0">{imageUploaded ? "Uploaded" : "Upload"} Cover Picture</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{imageUploaded ? "Uploaded" : "Upload"} Cover Picture</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="flex flex-col items-center justify-evenly flex-1">
                                    <div className={cn("w-96 border rounded-lg border-purple-500", imageUploaded ? "h-80" : "h-96")}>
                                        {coverImagePreviewUrl && (
                                            <div className="flex flex-col justify-center items-center">
                                                <div className="flex flex-col items-center m-4 p-6 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 w-full">
                                                    <Image width={250} objectFit='scale-down' height={250} src={coverImagePreviewUrl || ""} alt="Preview" className="rounded-lg" />
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
                            <AlertDialogAction disabled={(imageUploaded && !coverImageUrl)} onClick={() => {
                                if (coverImageUrl) {
                                    handleDelete(coverImageUrl)
                                }
                                else {
                                    handleUpload()
                                }
                            }}>
                                {coverImageUrl ? "Delete" : "Upload"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Vault />
            </div>
            <JoditEditor
                config={config}
                onBlur={(newContent) => setContent(newContent)}
                tabIndex={-1}
                value={content}
                className="w-full"
            />

        </div>
    )
}

function Vault() {
    const [vaultData, setVaultData] = useState([])
    const storage = getStorage(firebase_app)
    return (
        <Sheet >
            <SheetTrigger asChild>
                <button className="bg-gray-600 border-b-gray-900 hover:scale-95 px-3 py-1 text-xl rotate-90 rounded text-white absolute top-1/2 -right-3">
                    Open Vault
                </button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>File Vault</SheetTitle>
                    <SheetDescription>
                        Upload you images and files and use them in your blog with link
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col mt-5">
                    <FileUploader handleChange={(file) => {
                        if (!file) return;
                        const type = file.type
                        console.log(type)
                        const filePath = `blogVault/${new Date().toString()}/${file.name}`;
                        const storageRef = ref(storage, filePath);
                        const uploadTask = uploadBytesResumable(storageRef, file);
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
                                setVaultData([...vaultData, { type: type, url: downloadURL }])
                                toast.success("Image uploaded successfully")
                            }
                        );
                    }}
                        multiple={false}
                        types={['JPEG', 'PNG', 'JPG', 'PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX']}
                        name="file"
                        onTypeError={() => {
                            toast.error("Invalid file type", {
                                description: "Only jpg or png files are allowed",
                            })
                        }}
                    />
                </div>
                <ScrollableContainer className="overflow-x-hidden h-[500px] mt-5 mb-3 overflow-y-auto">
                    {vaultData.map((data, index) => {
                        return (
                            <div key={index} className="flex flex-col w-full gap-3 p-2 bg-gray-100 rounded-lg">
                                <div className="flex flex-row items-center gap-3 p-1 justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-lg font-semibold flex items-center gap-6 relative">
                                            {data.type}
                                            <button id="copy-button" className="rounded-full p-2 text-black bg-pink-300" onClick={() => {
                                                navigator.clipboard.writeText(data.url)
                                                if (!document.getElementById("copy-button")) return
                                                document.getElementById("copy-button").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`
                                                document.getElementById("copy-button").classList.remove("bg-pink-300")
                                                document.getElementById("copy-button").classList.add("bg-gray-300")
                                                if (!document.getElementById("copy-response-message")) return
                                                document.getElementById("copy-response-message").classList.remove("hidden")
                                                const timer = setTimeout(() => {
                                                    if (!document.getElementById("copy-button")) return
                                                    document.getElementById("copy-button").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
                                                    document.getElementById("copy-button").classList.remove("bg-gray-300")
                                                    document.getElementById("copy-button").classList.add("bg-pink-300")
                                                    if (!document.getElementById("copy-response-message")) return
                                                    document.getElementById("copy-response-message").classList.add("hidden")
                                                }, 5000)
                                                return () => clearTimeout(timer)
                                            }}>
                                                <LinkIcon size={20} />
                                            </button>
                                            <span id="copy-response-message" className="p-1 absolute w-28 text-center left-40 bg-green-200 text-gray-500 text-sm rounded-md hidden">Link Copied</span>
                                        </div>
                                        <span className="text-sm text-gray-500" style={{
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word',
                                        }}>File Url : {data.url}</span>
                                    </div>
                                    <button className="hover:scale-95 bg-red-500 text-white p-1 rounded-lg" onClick={() => {
                                        // Create a reference to the file to delete
                                        const fileRef = ref(storage, data.url);
                                        // Delete the file
                                        deleteObject(fileRef).then((res) => {
                                            const newData = vaultData.filter((_, i) => i !== index)
                                            setVaultData(newData)
                                        }).catch((err) => {
                                            console.log(err)
                                        })
                                    }}>
                                        <Trash2 size={28} />
                                    </button>
                                </div>
                                {data.type.includes("image") && <Image sizes="100vw" width={0} height={0} style={{ width: '100%', height: 'auto' }} src={data.url} alt="Vault Image" />}
                            </div>
                        )
                    })}
                </ScrollableContainer>
            </SheetContent>
        </Sheet>
    )
}
