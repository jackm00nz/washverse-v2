import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { getActivityData } from "../../utils/hyra-api.js"

export const data = new SlashCommandBuilder().setName("myactivity").setDescription("View your activity information")

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const activityData = await getActivityData(interaction.user.id)

    const embed = new EmbedBuilder()
      .setTitle("📊 Your Activity")
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
