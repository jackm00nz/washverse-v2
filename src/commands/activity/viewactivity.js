import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { getActivityData } from "../../utils/hyra-api.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder()
  .setName("viewactivity")
  .setDescription("View activity information for a user")
  .addUserOption((option) => option.setName("user").setDescription("The user to view activity for").setRequired(true))

export async function execute(interaction) {
  // Check permissions
  if (!hasPermission(interaction.member, "CORPORATE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Corporate Staff or higher.",
      flags: 64,
    })
  }

  const targetUser = interaction.options.getUser("user")
  await interaction.deferReply({ flags: 64 })

  try {
    const activityData = await getActivityData(targetUser.id)

    const embed = new EmbedBuilder()
      .setTitle(`📊 Activity for ${targetUser.tag}`)
      .setColor("#00FF00")
      .addFields(
        { name: "Requirement Completion", value: `${activityData.completionPercent}%`, inline: true },
        { name: "Sessions Attended", value: activityData.sessionsAttended.toString(), inline: true },
        { name: "Sessions Hosted", value: activityData.sessionsHosted.toString(), inline: true },
        { name: "Total Minutes", value: activityData.minutes.toString(), inline: true },
        { name: "Messages Sent", value: activityData.messages.toString(), inline: true },
      )
      .setFooter({ text: `Activity period: ${activityData.period}` })
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error("Error fetching activity:", error)
    await interaction.editReply({ content: "❌ Failed to fetch activity data." })
  }
}
