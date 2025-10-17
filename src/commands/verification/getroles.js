import { SlashCommandBuilder } from "discord.js"
import { updateUserRoles } from "../../utils/bloxlink-api.js"

export const data = new SlashCommandBuilder()
  .setName("getroles")
  .setDescription("Update your roles based on your ROBLOX rank")

export async function execute(interaction) {
  await interaction.deferReply({ flags: 64 })

  try {
    await updateUserRoles(interaction.member)
    await interaction.editReply({ content: "✅ Your roles have been updated!" })
  } catch (error) {
    console.error("Error updating roles:", error)
    await interaction.editReply({ content: "❌ Failed to update roles. Make sure you are verified first." })
  }
}
