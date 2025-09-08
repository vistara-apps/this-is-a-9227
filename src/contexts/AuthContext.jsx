import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase.js'
import { userService } from '../services/api.js'
import { AuthError, asyncHandler } from '../utils/errors.js'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const userData = await userService.getUserById(session.user.id)
          setUser(userData)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const userData = await userService.getUserById(session.user.id)
            setUser(userData)
            setIsAuthenticated(true)
          } catch (error) {
            console.error('Auth state change error:', error)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = asyncHandler(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS')
      }
      throw new AuthError(error.message)
    }

    const userData = await userService.getUserById(data.user.id)
    setUser(userData)
    setIsAuthenticated(true)
    
    toast.success('Welcome back!')
    return userData
  })

  const signup = asyncHandler(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      if (error.message.includes('User already registered')) {
        throw new AuthError('An account with this email already exists', 'USER_EXISTS')
      }
      throw new AuthError(error.message)
    }

    // Create user record in our database
    const userData = await userService.createUser(email)
    setUser(userData)
    setIsAuthenticated(true)
    
    toast.success('Account created successfully!')
    return userData
  })

  const logout = asyncHandler(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new AuthError(error.message)
    }

    setUser(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
  })

  const updateProfile = asyncHandler(async (updates) => {
    if (!user) throw new AuthError('No user logged in')

    const updatedUser = await userService.updateUser(user.userId, updates)
    setUser(updatedUser)
    
    toast.success('Profile updated successfully')
    return updatedUser
  })

  const resetPassword = asyncHandler(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      throw new AuthError(error.message)
    }

    toast.success('Password reset email sent!')
  })

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      signup,
      updateProfile,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}
