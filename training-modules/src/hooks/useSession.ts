import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import db from '../lib/db'
import type { Session, ModuleProgress } from '../lib/db'

export const useSession = (userId: string | undefined) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save every 30 seconds
  useEffect(() => {
    if (currentSession && userId) {
      autoSaveRef.current = setInterval(() => {
        // Update lastActiveAt timestamp
        const updatedSession = {
          ...currentSession,
          lastActiveAt: new Date().toISOString()
        }
        
        // Save to database
        db.read()
        const sessionIndex = db.data.sessions.findIndex(s => s.id === currentSession.id)
        if (sessionIndex >= 0) {
          db.data.sessions[sessionIndex] = updatedSession
          db.write()
          setCurrentSession(updatedSession)
          console.log('📁 Auto-saved session')
        }
      }, 30000) // 30 seconds

      return () => {
        if (autoSaveRef.current) {
          clearInterval(autoSaveRef.current)
        }
      }
    }
  }, [currentSession, userId])

  const startSession = (moduleId: string, moduleName: string) => {
    if (!userId) return null

    const session: Session = {
      id: uuidv4(),
      userId,
      moduleId,
      moduleName,
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(), // Add this field
      actions: []
    }
    
    // Save immediately to database
    db.read()
    db.data.sessions.push(session)
    db.write()
    
    setCurrentSession(session)
    console.log('🚀 Session started and saved:', session.id)
    return session
  }

  const endSession = (isSuccess: boolean, score?: number, maxScore?: number) => {
    if (!currentSession || !userId) return

    const completedSession: Session = {
      ...currentSession,
      completedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isSuccess,
      score,
      maxScore,
      timeSpentSeconds: Math.floor(
        (new Date().getTime() - new Date(currentSession.startedAt).getTime()) / 1000
      )
    }

    // Save session to database
    db.read()
    const sessionIndex = db.data.sessions.findIndex(s => s.id === currentSession.id)
    if (sessionIndex >= 0) {
      db.data.sessions[sessionIndex] = completedSession
    }

    // Update module progress
    const existingProgress = db.data.moduleProgress.find(
      p => p.userId === userId && p.moduleId === currentSession.moduleId
    )

    if (existingProgress) {
      existingProgress.status = isSuccess ? 'completed' : 'in_progress'
      existingProgress.bestScore = Math.max(existingProgress.bestScore, score || 0)
      existingProgress.attempts += 1
      existingProgress.lastAttempt = new Date().toISOString()
    } else {
      db.data.moduleProgress.push({
        userId,
        moduleId: currentSession.moduleId,
        status: isSuccess ? 'completed' : 'in_progress',
        bestScore: score || 0,
        attempts: 1,
        lastAttempt: new Date().toISOString()
      })
    }

    db.write()
    setCurrentSession(null)
    
    // Clear auto-save
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current)
    }
    
    console.log('✅ Session ended and saved')
  }

  const getUserSessions = (): Session[] => {
    if (!userId) return []
    db.read()
    return db.data.sessions.filter(s => s.userId === userId)
  }

  const getUserProgress = (): ModuleProgress[] => {
    if (!userId) return []
    db.read()
    return db.data.moduleProgress.filter(p => p.userId === userId)
  }

  return {
    currentSession,
    startSession,
    endSession,
    getUserSessions,
    getUserProgress
  }
}