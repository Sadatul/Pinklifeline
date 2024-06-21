'use client'

import { useState } from "react"

export default function SignInOut() {
    const [isSignedIn, setIsSignedIn] = useState(false)
    return (
        <div className="flex flex-row h-full items-center justify-between">
            {isSignedIn ? (
                <button type="button" className="text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 z-10">Sign Out</button>
            ) : (
                <>
                    <button type="button" className="transition-all duration-500 transform hover:bg-white hover:shadow-md hover:scale-110 hover:border-double hover:border-4 border-2 border-blue-950 w-24 h-10 rounded-l-md bg-cyan-500 mr-2 hover:text-black text-white">Sign Up</button>
                    <div className="flex flex-col w-5">
                    <div className="w-2 h-2 mr-10 my-1 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 mr-10 my-1 bg-gray-800 rounded-full"></div>
                    </div>
                    <button type="button" className="hover:border-double hover:border-4 border-2 border-blue-950 w-24 h-10 rounded-r-md bg-purple-500 mr-7 text-white transition-all duration-500 transform hover:bg-white hover:shadow-md hover:scale-110 hover:text-black">Sign In</button>
                </>
            )}
        </div>
    )
}