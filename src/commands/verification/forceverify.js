import { SlashCommandBuilder } from "discord.js"
import { forceVerifyUser } from "../../utils/bloxlink-api.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder()
  .setName("forceverify")
  .setDescription("Force verify a user with a ROBLOX username")
  .addUserOption((option) => option.setName("user").setDescription("User to verify").setRequired(true))
  .addStringOption((option) => option.setName("username").setDescription("ROBLOX username").setRequired(true))

export async function execute(interaction) {
  if (!hasPermission(interaction.member, "ADMINISTRATIVE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Administrative Staff or higher.",
      ephemeral: true,
    })
  }

  const targetUser = interaction.options.getUser("user")
  const robloxUsername = interaction.options.getString("username")

  await interaction.deferReply({ ephemeral: true })

  try {
    await forceVerifyUser(targetUser.id, robloxUsername, interaction.guild)
    await interaction.editReply({ content: `✅ ${targetUser.tag} has been force verified as ${robloxUsername}!` })
  } catch (error) {
    console.error("Error force verifying user:", error)
    await interaction.editReply({ content: "❌ Failed to force verify user." })
  }
}
