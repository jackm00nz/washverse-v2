import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder()
  .setName("transfer")
  .setDescription("Transfer ticket to another department")
  .addStringOption((option) =>
    option
      .setName("department")
      .setDescription("Department to transfer to")
      .setRequired(true)
      .addChoices(
        { name: "Moderation", value: "moderation" },
        { name: "Human Resources", value: "human-resources" },
        { name: "Communications", value: "communications" },
        { name: "Development", value: "development" },
      ),
  )

export async function execute(interaction) {
  if (!interaction.channel.name.startsWith("ticket-")) {
    return interaction.reply({ content: "❌ This command can only be used in ticket channels.", ephemeral: true })
  }

  const department = interaction.options.getString("department")

  // Update database
  db.prepare("UPDATE tickets SET department = ? WHERE channel_id = ?").run(department, interaction.channel.id)

  const embed = new EmbedBuilder()
    .setTitle("🔄 Ticket Transferred")
    .setDescription(
      `This ticket has been transferred to the **${department}** department by ${interaction.user.toString()}`,
    )
    .setColor("#4A90E2")
    .setTimestamp()

  await interaction.channel.send({ embeds: [embed] })

  // Ping the department role
  const departmentRole = interaction.guild.roles.cache.find((role) => role.name.toLowerCase().includes(department))
  if (departmentRole) {
    await interaction.channel.send({
      content: `${departmentRole.toString()} - New ticket transferred to your department!`,
    })
  }

  await interaction.reply({ content: `✅ Ticket transferred to ${department}!`, ephemeral: true })
}
