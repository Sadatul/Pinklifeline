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
import Image from "next/image";
import ScrollableContainer from "@/app/components/StyledScrollbar";
import { LinkIcon, Trash2 } from "lucide-react";

export function Vault({ side = "right", className = "" }) {
    const [vaultData, setVaultData] = useState([])
    const storage = getStorage(firebase_app)
    return (
        <Sheet >
            <SheetTrigger asChild>
                <button className={cn("bg-gray-600 border-b-gray-900 hover:scale-95 px-3 py-1 text-xl rotate-90 rounded text-white absolute top-1/2 -right-3", className)}>
                    Open Vault
                </button>
            </SheetTrigger>
            <SheetContent side={side}>
                <SheetHeader>
                    <SheetTitle>File Vault</SheetTitle>
                    <SheetDescription>
                        Upload you images and files and refer in you question with link
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col mt-5">
                    <FileUploader handleChange={(file) => {
                        if (!file) return;
                        const type = file.type
                        console.log(type)
                        const filePath = `questionVault/${new Date().toString()}/${file.name}`;
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
                <ScrollableContainer className="overflow-x-auto h-[500px] mt-5 mb-3 overflow-y-auto">
                    {vaultData.map((data, index) => {
                        return (
                            <div key={index} className="flex flex-col w-full gap-3 p-2 bg-gray-100 rounded-lg">
                                <div className="flex flex-row items-center gap-3 p-1 justify-between w-full">
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="text-lg font-semibold flex items-center gap-2 relative w-full">
                                            {data.type}
                                            <div className="flex flex-row flex-1 gap-2 justify-between">
                                                <button id="copy-button" className="rounded-full p-2 text-black bg-pink-300 scale-75" onClick={() => {
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
                                                <button className="hover:scale-90 scale-95 bg-red-500 text-white p-1 rounded-full px-2 w-fit" onClick={() => {
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
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        {/* <span className="text-sm text-gray-500" style={{
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word',
                                        }}>File Url : {data.url}</span> */}
                                    </div>
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
