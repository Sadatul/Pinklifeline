'use client'

import ScrollableContainer from "@/app/components/StyledScrollbar"

export default function Layout({ children }) {
    return (
        <div className="flex flex-1 overflow-hidden text-black">
            {/* Sidebar */}
            <div className="w-64 h-full bg-gray-300 items-center flex flex-col p-4 mr-[2px] rounded-r-lg">
                <h1 className="text-gray-950 text-2xl font-bold">Dashboard</h1>
                <div className="flex flex-col gap-6 flex-1 justify-center mb-10">
                    <button className="text-gray-800 hover:bg-opacity-75 hover:text-gray-100 hover:bg-gray-500 px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Home</button>
                    <button className="text-gray-800 hover:bg-opacity-75 hover:text-gray-100 hover:bg-gray-500 px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Profile</button>
                    <button className="text-gray-800 hover:bg-opacity-75 hover:text-gray-100 hover:bg-gray-500 px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Reports</button>
                    <button className="text-gray-800 hover:bg-opacity-75 hover:text-gray-100 hover:bg-gray-500 px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Appointments</button>
                    <button className="text-gray-800 hover:bg-opacity-75 hover:text-gray-100 hover:bg-gray-500 px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Settings</button>
                    <button className="text-gray-800 hover:bg-opacity-75 hover:text-gray-100 hover:bg-gray-500 px-10 py-1 text-xl rounded-md mb-2 text-left flex flex-row">Logout</button>
                </div>
            </div>
            <ScrollableContainer className="flex flex-col flex-grow overflow-y-auto ml-[2px] rounded-l-lg">
                {children}
            </ScrollableContainer>
        </div>
    )
}
