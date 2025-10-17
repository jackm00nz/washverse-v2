import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { generateDistributionReport } from "../../utils/hyra-api.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder()
  .setName("distribute")
  .setDescription("Generate activity distribution report for HR leads")

export async function execute(interaction) {
  // Check permissions - only Administrative Staff and above
  if (!hasPermission(interaction.member, "ADMINISTRATIVE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Administrative Staff or higher.",
      flags: 64,
    })
  }

  await interaction.deferReply({ flags: 64 })

  try {
    const report = await generateDistributionReport()

    const embed = new EmbedBuilder()
      .setTitle("📈 Activity Distribution Report")
      .setColor("#FF6B6B")
      .addFields(
        { name: "Total Failed Staff", value: report.totalFailed.toString(), inline: true },
        { name: "Report Period", value: report.period, inline: true },
      )
      .setTimestamp()

    // Add failed staff by rank
    for (const [rank, count] of Object.entries(report.failedByRank)) {
      embed.addFields({ name: `${rank}`, value: `${count} failed`, inline: true })
    }

    // Add top 3 staff
    if (report.topStaff.length > 0) {
      const topStaffText = report.topStaff
        .map((staff, index) => `${index + 1}. ${staff.username} - ${staff.completionPercent}%`)
        .join("\n")
      embed.addFields({ name: "🏆 Top 3 Staff", value: topStaffText })
    }

    // Add failed staff list
    if (report.failedStaff.length > 0) {
      const failedStaffText = report.failedStaff.map((staff) => `• ${staff.username} (${staff.rank})`).join("\n")
      embed.addFields({ name: "❌ Failed Staff List", value: failedStaffText })
    }

    // Send to HR leads
    const hrLeadRole = interaction.guild.roles.cache.find((role) => role.name === "Human Resources Lead")
    if (hrLeadRole) {
      const hrLeads = hrLeadRole.members
      for (const [, member] of hrLeads) {
        try {
          await member.send({ embeds: [embed] })
        } catch (error) {
          console.error(`Failed to send report to ${member.user.tag}:`, error)
        }
      }
    }

    await interaction.editReply({
      content: `✅ Distribution report generated and sent to ${hrLeadRole?.members.size || 0} HR leads.`,
    })
  } catch (error) {
    console.error("Error generating distribution:", error)
    await interaction.editReply({ content: "❌ Failed to generate distribution report." })
  }
}
