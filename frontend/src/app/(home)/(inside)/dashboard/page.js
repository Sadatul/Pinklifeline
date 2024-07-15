'use client'

export default function DashboardPage() {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div className="flex-shrink-0 w-64 bg-gray-800 text-white p-4">
                <div className="mb-4">
                    <h1 className="text-xl font-bold">Workspace</h1>
                </div>
                <nav className="space-y-2">
                    <a href="#" className="block p-2 rounded hover:bg-gray-700">Dashboard</a>
                    <a href="#" className="block p-2 rounded hover:bg-gray-700">Products</a>
                    <a href="#" className="block p-2 rounded hover:bg-gray-700">Customers</a>
                    <a href="#" className="block p-2 rounded hover:bg-gray-700">Orders</a>
                    <a href="#" className="block p-2 rounded hover:bg-gray-700">Promotions</a>
                    <a href="#" className="block p-2 rounded hover:bg-gray-700">Sales</a>
                    <a href="#" className="block p-2 rounded hover:bg-gray-700">Files</a>
                    <a href="#" className="block p-2 rounded hover:bg-gray-700">Communications</a>
                    <a href="#" className="block p-2 rounded hover:bg-gray-700">Affiliates</a>
                    <a href="#" className="block p-2 rounded hover:bg-gray-700">Marketing</a>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-grow overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold">Hi there, James</h1>
                            <p className="text-gray-600">Monday, 23 November</p>
                        </div>
                        <div>
                            {/* User profile */}
                            <img
                                src="https://via.placeholder.com/40"
                                alt="Profile"
                                className="rounded-full"
                            />
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-grow overflow-auto p-4 bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    )
}