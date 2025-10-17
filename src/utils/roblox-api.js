import noblox from "noblox.js"

let authenticated = false

export async function authenticateRoblox() {
  if (authenticated) return

  try {
    await noblox.setCookie(process.env.ROBLOX_COOKIE)
    const currentUser = await noblox.getCurrentUser()
    console.log(`✅ Authenticated as ${currentUser.UserName}`)
    authenticated = true
  } catch (error) {
    console.error("❌ Failed to authenticate with ROBLOX:", error)
    throw error
  }
}

export async function setRank(username, rank) {
  await authenticateRoblox()
  const groupId = Number.parseInt(process.env.ROBLOX_GROUP_ID)

  try {
    const userId = await noblox.getIdFromUsername(username)
    await noblox.setRank(groupId, userId, rank)
    return true
  } catch (error) {
    console.error(`Error setting rank for ${username}:`, error)
    throw error
  }
}

export async function demoteUser(username) {
  await authenticateRoblox()
  const groupId = Number.parseInt(process.env.ROBLOX_GROUP_ID)

  try {
    const userId = await noblox.getIdFromUsername(username)
    const currentRank = await noblox.getRankInGroup(groupId, userId)
    await noblox.setRank(groupId, userId, currentRank - 1)
    return true
  } catch (error) {
    console.error(`Error demoting ${username}:`, error)
    throw error
  }
}

export async function suspendUser(username) {
  await authenticateRoblox()
  const groupId = Number.parseInt(process.env.ROBLOX_GROUP_ID)

  try {
    const userId = await noblox.getIdFromUsername(username)
    const currentRank = await noblox.getRankNameInGroup(groupId, userId)
    await noblox.setRank(groupId, userId, "Customer")
    return currentRank
  } catch (error) {
    console.error(`Error suspending ${username}:`, error)
    throw error
  }
}

export async function restoreRankAfterSuspension(username, originalRank) {
  await authenticateRoblox()
  const groupId = Number.parseInt(process.env.ROBLOX_GROUP_ID)

  try {
    const userId = await noblox.getIdFromUsername(username)
    await noblox.setRank(groupId, userId, originalRank)
    return true
  } catch (error) {
    console.error(`Error restoring rank for ${username}:`, error)
    throw error
  }
}

export async function getUserRank(username) {
  await authenticateRoblox()
  const groupId = Number.parseInt(process.env.ROBLOX_GROUP_ID)

  try {
    const userId = await noblox.getIdFromUsername(username)
    const rank = await noblox.getRankNameInGroup(groupId, userId)
    return rank
  } catch (error) {
    console.error(`Error getting rank for ${username}:`, error)
    throw error
  }
}
