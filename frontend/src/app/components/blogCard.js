'use client'
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function BlogCard({ title, imageUrl, description, blogUrl, className }) {
    return (
        <div className={cn("max-w-lg mx-auto p-5", className)}>
            <div className="bg-pink-200 shadow-2xl border border-gray-200 rounded-lg max-w-sm mb-5">
                <Link href={blogUrl} prefetch={true}>
                    <Image width={400} height={400} className="rounded-t-lg" src={imageUrl} alt="" />
                </Link>
                <div className="p-5">
                    <Link href={blogUrl} prefetch={true}>
                        <h5 className="text-gray-900 font-bold text-2xl tracking-tight mb-2">{title}</h5>
                    </Link>
                    <p className="font-normal text-gray-700 mb-3">{description}</p>
                    <div className="flex flex-col items-end w-full">
                        <Link className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center mr-10" href={blogUrl} prefetch={true}>
                            Read more
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}