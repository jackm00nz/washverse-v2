import { SlashCommandBuilder } from "discord.js"
import { db } from "../../database/init.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder()
  .setName("setrequirement")
  .setDescription("Set activity requirements for a rank")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Requirement type")
      .setRequired(true)
      .addChoices(
        { name: "Sessions Attended", value: "sessions_attended" },
        { name: "Sessions Hosted", value: "sessions_hosted" },
        { name: "Minutes", value: "minutes" },
        { name: "Messages", value: "messages" },
      ),
  )
  .addStringOption((option) => option.setName("rank").setDescription("Rank name").setRequired(true))
  .addIntegerOption((option) => option.setName("value").setDescription("Requirement value").setRequired(true))

export async function execute(interaction) {
  // Check permissions - only Administrative Staff and above
  if (!hasPermission(interaction.member, "ADMINISTRATIVE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Administrative Staff or higher.",
      flags: 64,
    })
  }

  const type = interaction.options.getString("type")
  const rank = interaction.options.getString("rank")
  const value = interaction.options.getInteger("value")

  try {
    // Update or insert requirement
    db.prepare(
      `INSERT INTO activity_requirements (rank, ${type}) VALUES (?, ?)
       ON CONFLICT(rank) DO UPDATE SET ${type} = ?`,
    ).run(rank, value, value)

    await interaction.reply({
      content: `✅ Requirement updated: **${rank}** now requires **${value}** ${type.replace("_", " ")}`,
      flags: 64,
    })
  } catch (error) {
    console.error("Error setting requirement:", error)
    await interaction.reply({ content: "❌ Failed to set requirement.", flags: 64 })
  }
}
