import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import db from '../lib/db'
import type { Session, ModuleProgress } from '../lib/db'

export const useSession = (userId: string | undefined) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null)

  const startSession = (moduleId: string, moduleName: string) => {
    if (!userId) return null

    const session: Session = {
      id: uuidv4(),
      userId,
      moduleId,
      moduleName,
      startedAt: new Date().toISOString(),
      actions: []
    }
    
    setCurrentSession(session)
    return session
  }

  const endSession = (isSuccess: boolean, score?: number, maxScore?: number) => {
    if (!currentSession || !userId) return

    const completedSession: Session = {
      ...currentSession,
      completedAt: new Date().toISOString(),
      isSuccess,
      score,
      maxScore,
      timeSpentSeconds: Math.floor(
        (new Date().getTime() - new Date(currentSession.startedAt).getTime()) / 1000
      )
    }

    // Save session to database
    db.read()
    db.data.sessions.push(completedSession)

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