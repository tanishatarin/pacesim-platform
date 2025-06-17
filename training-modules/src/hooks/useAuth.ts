import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import db from '../lib/db'
import type { User } from '../lib/db'

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for saved user
    const savedUserId = localStorage.getItem('currentUserId')
    if (savedUserId) {
      db.read()
      const user = db.data.users.find(u => u.id === savedUserId)
      if (user) {
        setCurrentUser(user)
      } else {
        localStorage.removeItem('currentUserId')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (username: string, password: string): boolean => {
    db.read()
    
    // Find existing user by email/username
    let user = db.data.users.find(u => u.email === username || u.name === username)
    
    if (!user) {
      // Create new user for demo
      user = {
        id: uuidv4(),
        name: username.split('@')[0] || username,
        email: username,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        role: 'Medical Student',
        institution: 'Johns Hopkins Hospital'
      }
      db.data.users.push(user)
    } else {
      // Update last login
      user.lastLogin = new Date().toISOString()
    }
    
    db.write()
    setCurrentUser(user)
    localStorage.setItem('currentUserId', user.id)
    return true
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUserId')
  }

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    logout
  }
}