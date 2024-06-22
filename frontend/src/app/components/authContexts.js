'use client'
import { createContext, useState } from "react"

const AuthContext = createContext()
const AuthContextDispatch = createContext()

function AuthContextProvider({ children }) {
    const [auth, setAuth] = useState({ isAuth: false, token: "" })
    return (
        <AuthContext.Provider value={auth}>
            <AuthContextDispatch.Provider value={setAuth}>
                {children}
            </AuthContextDispatch.Provider>
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthContextDispatch, AuthContextProvider }