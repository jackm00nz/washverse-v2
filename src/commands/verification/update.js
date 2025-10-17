import { SlashCommandBuilder } from "discord.js"
import { updateUserRoles } from "../../utils/bloxlink-api.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder()
  .setName("update")
  .setDescription("Update a user's roles (Role Commander only)")
  .addUserOption((option) => option.setName("user").setDescription("User to update").setRequired(true))

export async function execute(interaction) {
  // Check for Role Commander role
  const hasRoleCommander = interaction.member.roles.cache.some((role) => role.name === "Role Commander")

  if (!hasRoleCommander && !hasPermission(interaction.member, "CORPORATE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required: Role Commander or Corporate Staff.",
      flags: 64,
    })
  }

  const targetUser = interaction.options.getUser("user")
  const targetMember = await interaction.guild.members.fetch(targetUser.id)

  await interaction.deferReply({ flags: 64 })

  try {
    await updateUserRoles(targetMember)
    await interaction.editReply({ content: `✅ Roles updated for ${targetUser.tag}!` })
  } catch (error) {
    console.error("Error updating roles:", error)
    await interaction.editReply({ content: "❌ Failed to update roles." })
  }
}
