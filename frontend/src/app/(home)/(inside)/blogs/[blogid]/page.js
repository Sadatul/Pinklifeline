'use client'

import Avatar from "@/app/components/avatar"
import Loading from "@/app/components/loading"
import ScrollableContainer from "@/app/components/StyledScrollbar"
import { Separator } from "@/components/ui/separator"
import axiosInstance from "@/utils/axiosInstance"
import { avatarAang, blogByIdUrl, blogVoteUrl, pagePaths, ReportTypes } from "@/utils/constants"
import { format } from "date-fns"
import { CalendarClock, CalendarDays, Clock, ThumbsUpIcon, LinkIcon, Check, Ellipsis } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSessionContext } from "@/app/context/sessionContext"
import { toast } from "sonner"


export default function BlogPage() {
    const params = useParams()
    const editor = useRef(null);
    const sessionContext = useSessionContext()
    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [blogContent, setBlogContent] = useState(``)
    const [coverText, setCoverText] = useState(null)
    const [coverImage, setCoverImage] = useState(null)
    const [disableVote, setDisableVote] = useState(false)

    useEffect(() => {
        axiosInstance.get(blogByIdUrl(params.blogid)).then((res) => {
            console.log(res.data)
            setBlog(res.data)
            const cover = res.data.content.match(/<covertext>(.*?)<\/covertext>/s);
            const image = res.data.content.match(/<coverimage>(.*?)<\/coverimage>/s);
            const content = res.data.content.match(/<content>(.*?)<\/content>/s);
            setCoverText(cover ? cover[1] : null)
            setCoverImage(image ? image[1] : null)
            setBlogContent(content ? content[1] : null)
        }).catch((err) => {
            console.log(err)
            if (err?.response?.status === 404) {
                setBlog(404)
            }
        }).finally(() => {
            setLoading(false)
        })
    }, [params.blogid])

    if (loading || !blog) return <Loading chose="hand" />
    if (blog === 404) return <h1 className="text-4xl text-center font-bold text-gray-800 m-auto">Blog Not Found</h1>

    return (
        <ScrollableContainer className="flex flex-col w-full h-full overflow-x-hidden items-center">
            <div className="flex flex-col gap-7 p-5 w-9/12">
                <div className="flex flex-col w-full gap-4">
                    <div className="flex flex-col gap-1 w-full">
                        <h1 className="text-3xl font-bold">{blog.title}</h1>
                        {(coverText && coverText !== "") && <p className="text-xl text-gray-600 font-semibold">{coverText}</p>}
                    </div>
                    <div className="flex items-center text-base gap-3">
                        <Avatar avatarImgScr={blog.authorProfilePicture} size={64} />
                        < div className="flex flex-col gap-0">
                            <Link href={pagePaths.doctorProfile(blog.authorId)} target='_blank' className="flex items-center hover:underline font-semibold">
                                <span className="text-lg">{blog.authorName}</span>
                            </Link>
                            <span className="text-sm">{blog.authorQualifications.join(", ")}</span>
                            <span className="text-sm">
                                {`${blog.authorDesignation}, ${blog.authorDepartment}, ${blog.authorWorkplace}`}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 mb-5">
                        <span className="text-base gap-5 flex items-center">
                            <span className="flex gap-1 items-center">
                                <CalendarClock size={20} />
                                {format(new Date(blog.createdAt), "'Created at' eeee dd MMMM yyyy',' hh:mm a")}
                            </span>
                        </span>
                        <div className="flex gap-4 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button disabled={disableVote} className="flex gap-1 items-center text-xl font-semibold w-20" onClick={() => {
                                    setDisableVote(true)
                                    axiosInstance.put(blogVoteUrl(blog.id)).then((res) => {
                                        setBlog({
                                            ...blog,
                                            voteId: blog.voteId ? null : true,
                                            upvoteCount: Number(blog.upvoteCount) + Number(res.data?.voteChange)
                                        })

                                    }).catch((err) => {
                                        console.log(err)
                                    }).finally(() => {
                                        setDisableVote(false)
                                    })
                                }} >
                                    {!blog.voteId ? <ThumbsUpIcon size={26} /> : <ThumbsUpIcon fill="rgb(219 39 119)" size={26} className=" bg-pi" />} {blog.upvoteCount}
                                </button>
                                <div className="flex flex-col w-fit relative">
                                    <button id="copy-button" className="rounded-full p-2 text-black bg-pink-300" onClick={() => {
                                        navigator.clipboard.writeText(`${pagePaths.baseUrl}${pagePaths.blogPageById(blog.id)}`)
                                        document.getElementById("copy-button").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`
                                        document.getElementById("copy-button").classList.remove("bg-pink-300")
                                        document.getElementById("copy-button").classList.add("bg-gray-300")
                                        document.getElementById("copy-response-message").classList.remove("hidden")
                                        const timer = setTimeout(() => {
                                            document.getElementById("copy-button").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
                                            document.getElementById("copy-button").classList.remove("bg-gray-300")
                                            document.getElementById("copy-button").classList.add("bg-pink-300")
                                            document.getElementById("copy-response-message").classList.add("hidden")
                                        }, 5000)
                                        return () => clearTimeout(timer)
                                    }}>
                                        <LinkIcon size={20} />
                                    </button>
                                    <span id="copy-response-message" className="p-1 absolute w-28 text-center top-10 -left-10 bg-gray-200 text-gray-500 text-sm rounded-md hidden">Link Copied</span>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="w-fit">
                                        <Ellipsis size={34} className="text-gray-700" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {(sessionContext.sessionData?.userId === blog.authorId) &&
                                        <>
                                            <DropdownMenuItem>
                                                <Link href={pagePaths.updateBlogById(blog.id)} className="flex items-center w-full">
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <button className="flex items-center w-full" onClick={() => {
                                                    toast.loading("Deleting Blog")
                                                    axiosInstance.delete(blogByIdUrl(blog.id)).then((response) => {
                                                        toast.dismiss()
                                                        toast.success("Blog Deleted")
                                                        window.location.href = pagePaths.blogsPage
                                                    }).catch((error) => {
                                                        toast.dismiss()
                                                        toast.error("Error deleting blog")
                                                        console.log("error deleting blog", error)
                                                    })
                                                }}>
                                                    Delete
                                                </button>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    }
                                    <DropdownMenuItem>
                                        <Link href={pagePaths.reportPage(blog.id, ReportTypes.blog)} className="flex items-center w-full">
                                            Report
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    {(coverImage && coverImage !== "") &&
                        <Image
                            src={coverImage}
                            width={0}
                            height={0}
                            sizes="100vw"
                            style={{ width: '100%', height: 'auto' }} // optional
                            alt="Cover Image"
                        />
                    }
                    <Separator className="m-auto w-11/12 h-[1.5px] bg-purple-400" />
                </div>
                {(blogContent && blogContent !== "") &&
                    <div className="flex flex-col flex-1 bg-white" dangerouslySetInnerHTML={{ __html: blogContent }} />
                }
            </div>
        </ScrollableContainer>
    )
}