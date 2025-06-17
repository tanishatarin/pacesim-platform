import { LowSync } from 'lowdb'
import { LocalStorage } from 'lowdb/browser'

export type User = {
  id: string
  name: string
  email: string
  passwordHash: string 
  createdAt: string
  lastLogin: string
  role?: string
  institution?: string
}

export type Session = {
  id: string
  userId: string
  moduleId: string
  moduleName: string
  startedAt: string
  completedAt?: string
  score?: number
  maxScore?: number
  timeSpentSeconds?: number
  isSuccess?: boolean
  actions?: any[]
  lastActiveAt?: string
}

export type ModuleProgress = {
  userId: string
  moduleId: string
  status: 'not_started' | 'in_progress' | 'completed'
  bestScore: number
  attempts: number
  lastAttempt?: string
}

type DBData = {
  users: User[]
  sessions: Session[]
  moduleProgress: ModuleProgress[]
}

const adapter = new LocalStorage<DBData>('pacesim')
const db = new LowSync(adapter, { users: [], sessions: [], moduleProgress: [] })

// Initialize
db.read()
db.data ||= { users: [], sessions: [], moduleProgress: [] }

export default db