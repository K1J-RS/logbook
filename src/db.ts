import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CarryoverItem, ChecklistItem, Draft, LibraryEntry, SessionLog, Template } from './types'

const DB_NAME = 'logbook'
const DB_VERSION = 1
const STORE = 'kv'

export interface PersistedState {
  templates: Template[]
  logs: SessionLog[]
  carryover: CarryoverItem[]
  library: LibraryEntry[]
  warmup: ChecklistItem[]
  rehab: ChecklistItem[]
  draft: Draft | null
  activeTemplateId: string | null
}

interface LogbookDB extends DBSchema {
  kv: {
    key: string
    value: unknown
  }
}

let dbPromise: Promise<IDBPDatabase<LogbookDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<LogbookDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
      },
    })
  }
  return dbPromise
}

export async function kvGet<T>(key: string): Promise<T | undefined> {
  const db = await getDb()
  return (await db.get(STORE, key)) as T | undefined
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const db = await getDb()
  await db.put(STORE, value, key)
}
