"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "../utils/firebaseConfig"

const AuthContext = createContext({
  user: null as User | null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={useMemo(() => ({ user, loading }), [user, loading])}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)