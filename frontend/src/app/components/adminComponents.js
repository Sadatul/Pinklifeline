
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/utils/axiosInstance";
import { hospitalByIdUrl, hospitalsAdminUrl, pagePaths } from "@/utils/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react"
import { toast } from "sonner";

export function HospitalsInputComponent({ isNew = false, hospital = null }) {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-5 rounded-md w-full">
            <label className="flex flex-row gap-2 w-fit">
                <span className="w-44">Hospital Name</span>
                <input type="text" id="name" defaultValue={hospital?.name} className="w-80 border border-gray-500 shadow-inner rounded px-2 py-1" />
            </label>
            <label className="flex flex-row gap-2 w-fit">
                <span className="w-44">Location</span>
                <input type="text" id="location" defaultValue={hospital?.location} className="w-80 border border-gray-500 shadow-inner rounded px-2 py-1" />
            </label>
            <label className="flex flex-row gap-2 w-fit">
                <span className="w-44">Contact Number</span>
                <input type="number" id="contactNumber" defaultValue={hospital?.contactNumber} className="w-80 border border-gray-500 shadow-inner rounded px-2 py-1 number-input" />
            </label>
            <label className="flex flex-row gap-2 w-fit">
                <span className="w-44">Email</span>
                <input type="text" id="email" defaultValue={hospital?.email} className="w-80 border border-gray-500 shadow-inner rounded px-2 py-1" />
            </label>
            <label className="flex flex-row gap-2 w-fit">
                <span className="w-44">Description</span>
                <textarea type="text" id="description" defaultValue={hospital?.description} className="w-80 border border-gray-500 shadow-inner rounded px-2 py-1 " onChange={(e) => {
                    document.getElementById("description").style.height = "auto";
                    document.getElementById("description").style.height = (e.target.scrollHeight) + 2 + "px";
                }} />
            </label>
            <span id="error-msg" className="text-red-500 text-sm hidden">*All fields are required</span>
            <div className="flex flex-col gap-2 w-full">
                <Separator className="w-full h-[1.5px] bg-gray-500" />
                <div className="flex flex-row px-10 w-full justify-end gap-10">
                    <Link href={pagePaths.hospitalsPage} className="border text-center p-2 border-gray-500 rounded w-20 shadow-inner bg-gray-100 text-black hover:scale-95 transform transition" >
                        Cancel
                    </Link>
                    <button className="border border-gray-500 rounded w-20 shadow-inner p-2 bg-gray-700 text-gray-100 hover:scale-95 transform transition" onClick={() => {
                        const data = {
                            name: document.getElementById("name").value,
                            location: document.getElementById("location").value,
                            contactNumber: document.getElementById("contactNumber").value,
                            email: document.getElementById("email").value,
                            description: document.getElementById("description").value
                        }
                        let isValid = true;
                        for (const key in data) {
                            if (data[key] === "") {
                                isValid = false;
                                break;
                            }
                        }
                        if (!isValid) {
                            document.getElementById("error-msg").classList.remove("hidden");
                            return;
                        }
                        document.getElementById("error-msg").classList.add("hidden");
                        if (isNew) {
                            axiosInstance.post(hospitalsAdminUrl, data).then((res) => {
                                console.log(res.data);
                                toast.success("Hospital added successfully");
                                window.location.href = pagePaths.hospitalsPage;
                            }).catch((err) => {
                                console.log(err);
                            })
                        }
                        else {
                            axiosInstance.put(hospitalByIdUrl(hospital.id), data).then((res) => {
                                console.log(res.data);
                                window.location.href = pagePaths.hospitalsPage;
                            }).catch((err) => {
                                console.log(err);
                            })
                        }
                    }} >
                        {isNew ? "Add" : "Update"}
                    </button>
                </div>
            </div>
        </div>
    )
}
