import Database from "better-sqlite3"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const db = new Database(join(__dirname, "../../data/washverse.db"))

export function initDatabase() {
  // Mod logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mod_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      action TEXT NOT NULL,
      reason TEXT,
      proof TEXT,
      duration TEXT,
      timestamp INTEGER NOT NULL
    )
  `)

  // Activity tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity (
      user_id TEXT PRIMARY KEY,
      roblox_username TEXT,
      sessions_attended INTEGER DEFAULT 0,
      sessions_hosted INTEGER DEFAULT 0,
      minutes INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0,
      last_updated INTEGER NOT NULL
    )
  `)

  // Activity requirements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_requirements (
      rank TEXT PRIMARY KEY,
      sessions_attended INTEGER DEFAULT 0,
      sessions_hosted INTEGER DEFAULT 0,
      minutes INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0
    )
  `)

  // Leave of Absence table
  db.exec(`
    CREATE TABLE IF NOT EXISTS loa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      roblox_username TEXT NOT NULL,
      start_date INTEGER NOT NULL,
      end_date INTEGER NOT NULL,
      reason TEXT,
      active INTEGER DEFAULT 1
    )
  `)

  // Alliances table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alliances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_name TEXT NOT NULL,
      group_link TEXT NOT NULL,
      server_link TEXT,
      channel_id TEXT,
      representatives TEXT
    )
  `)

  // Suspensions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS suspensions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      roblox_username TEXT NOT NULL,
      original_rank TEXT NOT NULL,
      end_date INTEGER NOT NULL,
      reason TEXT,
      proof TEXT,
      active INTEGER DEFAULT 1
    )
  `)

  // Verification table
  db.exec(`
    CREATE TABLE IF NOT EXISTS verification (
      user_id TEXT PRIMARY KEY,
      roblox_id TEXT NOT NULL,
      roblox_username TEXT NOT NULL,
      verified_at INTEGER NOT NULL
    )
  `)

  // Session logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS session_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      host_id TEXT NOT NULL,
      role TEXT NOT NULL,
      user_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `)

  // Suggestions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      suggestion TEXT NOT NULL,
      message_id TEXT,
      status TEXT DEFAULT 'pending',
      timestamp INTEGER NOT NULL
    )
  `)

  // Game bans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_bans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roblox_username TEXT NOT NULL,
      banned_by TEXT NOT NULL,
      duration TEXT NOT NULL,
      reason TEXT NOT NULL,
      proof TEXT,
      end_date INTEGER,
      ban_type TEXT NOT NULL,
      timestamp INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `)

  // Log requests table for session management
  db.exec(`
    CREATE TABLE IF NOT EXISTS log_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id TEXT NOT NULL,
      role TEXT NOT NULL,
      host_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `)

  // Tickets table for support system
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      department TEXT,
      claimed_by TEXT,
      status TEXT DEFAULT 'open',
      created_at INTEGER NOT NULL,
      closed_at INTEGER
    )
  `)

  console.log("Database tables initialized")
}
