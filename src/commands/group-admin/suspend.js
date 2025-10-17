import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"
import { suspendUser } from "../../utils/roblox-api.js"
import { createHyraLog } from "../../utils/hyra-api.js"

export const data = new SlashCommandBuilder()
  .setName("suspend")
  .setDescription("Suspend a user in the ROBLOX group")
  .addStringOption((option) => option.setName("username").setDescription("ROBLOX username").setRequired(true))
  .addStringOption((option) =>
    option.setName("duration").setDescription("Suspension duration (minimum 3d)").setRequired(true),
  )
  .addStringOption((option) => option.setName("reason").setDescription("Reason for suspension").setRequired(true))
  .addStringOption((option) => option.setName("proof").setDescription("Proof (link or description)").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction) {
  const username = interaction.options.getString("username")
  const duration = interaction.options.getString("duration")
  const reason = interaction.options.getString("reason")
  const proof = interaction.options.getString("proof")

  await interaction.deferReply({ ephemeral: true })

  // Parse duration (minimum 3 days)
  const durationMs = parseDuration(duration)
  if (!durationMs || durationMs < 3 * 24 * 60 * 60 * 1000) {
    return interaction.editReply({ content: "❌ Invalid duration. Minimum suspension is 3 days (3d)." })
  }

  try {
    // Suspend user in ROBLOX group
    const originalRank = await suspendUser(username)
    const endDate = Date.now() + durationMs

    // Save to database
    db.prepare(
      "INSERT INTO suspensions (user_id, roblox_username, original_rank, end_date, reason, proof) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(interaction.user.id, username, originalRank, endDate, reason, proof)

    // Create Hyra log
    await createHyraLog("suspend", username, reason, proof, interaction.user.tag)

    // Generate HR letter
    const hrLetter = generateHRLetter("suspension", username, reason, duration, proof)

    // Send letter to command runner's DMs
    await interaction.user.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📋 HR Letter - Suspension")
          .setDescription("Please send this message to the suspended user:")
          .addFields({ name: "Letter", value: hrLetter })
          .setColor("#FFA500")
          .setTimestamp(),
      ],
    })

    await interaction.editReply({
      content: `✅ ${username} has been suspended for ${duration}. HR letter sent to your DMs.`,
    })
  } catch (error) {
    console.error("Error suspending user:", error)
    await interaction.editReply({ content: "❌ Failed to suspend user. Please check the username and try again." })
  }
}

function parseDuration(duration) {
  const regex = /^(\d+)([dhw])$/
  const match = duration.match(regex)

  if (!match) return null

  const value = Number.parseInt(match[1])
  const unit = match[2]

  const multipliers = {
    d: 86400000,
    h: 3600000,
    w: 604800000,
  }

  return value * multipliers[unit]
}

function generateHRLetter(type, username, reason, duration, proof) {
  return `Dear ${username},

This letter is to inform you that you have been suspended from WashVerse for ${duration}.

**Reason:** ${reason}
**Evidence:** ${proof}

During your suspension period, you will be ranked as Customer and will not be able to participate in group activities. Your rank will be automatically restored after the suspension period ends.

If you have any questions or concerns, please contact Human Resources.

Best regards,
WashVerse Human Resources`
}
