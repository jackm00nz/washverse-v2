import axios from "axios"
import { db } from "../database/init.js"

export async function createHyraLog(action, username, reason, proof, moderator) {
  try {
    const response = await axios.post(
      `${process.env.HYRA_API_URL}/logs`,
      {
        action,
        username,
        reason,
        proof,
        moderator,
        timestamp: Date.now(),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HYRA_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    return response.data
  } catch (error) {
    console.error("Error creating Hyra log:", error)
    throw error
  }
}

export async function getActivityData(username) {
  try {
    const response = await axios.get(`${process.env.HYRA_API_URL}/activity/${username}`, {
      headers: {
        Authorization: `Bearer ${process.env.HYRA_API_KEY}`,
      },
    })

    return response.data
  } catch (error) {
    console.error("Error fetching activity data:", error)
    throw error
  }
}

export async function generateDistributionReport() {
  try {
    // Fetch all activity data from Hyra
    const response = await axios.get(`${process.env.HYRA_API_URL}/activity/report`, {
      headers: {
        Authorization: `Bearer ${process.env.HYRA_API_KEY}`,
      },
    })

    const activityData = response.data

    // Get requirements from database
    const requirements = db.prepare("SELECT * FROM activity_requirements").all()

    // Calculate failed staff
    const failedStaff = []
    const failedByRank = {}

    for (const user of activityData.users) {
      const requirement = requirements.find((r) => r.rank === user.rank)

      if (requirement) {
        const sessionsAttendedMet = user.sessions_attended >= requirement.sessions_attended
        const sessionsHostedMet = user.sessions_hosted >= requirement.sessions_hosted
        const minutesMet = user.minutes >= requirement.minutes
        const messagesMet = user.messages >= requirement.messages

        const totalRequirements = 4
        const metRequirements = [sessionsAttendedMet, sessionsHostedMet, minutesMet, messagesMet].filter(Boolean).length
        const completionPercent = Math.round((metRequirements / totalRequirements) * 100)

        if (completionPercent < 100) {
          failedStaff.push({
            username: user.username,
            rank: user.rank,
            completionPercent,
          })

          failedByRank[user.rank] = (failedByRank[user.rank] || 0) + 1
        }
      }
    }

    // Get top 3 staff
    const topStaff = activityData.users
      .map((user) => {
        const requirement = requirements.find((r) => r.rank === user.rank)
        if (!requirement) return null

        const sessionsAttendedMet = user.sessions_attended >= requirement.sessions_attended
        const sessionsHostedMet = user.sessions_hosted >= requirement.sessions_hosted
        const minutesMet = user.minutes >= requirement.minutes
        const messagesMet = user.messages >= requirement.messages

        const totalRequirements = 4
        const metRequirements = [sessionsAttendedMet, sessionsHostedMet, minutesMet, messagesMet].filter(Boolean).length
        const completionPercent = Math.round((metRequirements / totalRequirements) * 100)

        return {
          username: user.username,
          completionPercent,
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.completionPercent - a.completionPercent)
      .slice(0, 3)

    return {
      totalFailed: failedStaff.length,
      failedByRank,
      failedStaff,
      topStaff,
      period: activityData.period || "Current Period",
    }
  } catch (error) {
    console.error("Error generating distribution report:", error)
    throw error
  }
}
