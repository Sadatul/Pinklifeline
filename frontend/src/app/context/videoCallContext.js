// 'use client'
// import { createContext, useRef, useContext, useState } from "react"

// const videoCallContext = createContext()

// export function VideoCallContextProvider({ children }) {
//     const [user, setUser] = useState(null)
//     const [client, setClient] = useState(null)

//     return (
//         <videoCallContext.Provider value={{
//             client,
//             setClient,
//             user,
//             setUser
//         }}>
//             {children}
//         </videoCallContext.Provider>
//     )
// }

// export function useVideoCallContext() {
//     return useContext(videoCallContext)
// }