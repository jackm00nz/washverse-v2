import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder()
  .setName("training")
  .setDescription("Announce a training session")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Announcement type")
      .setRequired(true)
      .addChoices({ name: "Public Announce", value: "announce" }, { name: "Management Announce", value: "management" }),
  )
  .addStringOption((option) =>
    option.setName("time").setDescription("Start time (e.g., 3:00 PM EST)").setRequired(true),
  )
  .addUserOption((option) => option.setName("host").setDescription("Training host").setRequired(true))
  .addUserOption((option) => option.setName("cohost").setDescription("Training co-host").setRequired(false))

export async function execute(interaction) {
  // Check permissions
  if (!hasPermission(interaction.member, "CORPORATE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Corporate Staff or higher.",
      flags: 64,
    })
  }

  const type = interaction.options.getString("type")
  const time = interaction.options.getString("time")
  const host = interaction.options.getUser("host")
  const cohost = interaction.options.getUser("cohost")

  const embed = new EmbedBuilder()
    .setTitle("🎓 Training Session Announcement")
    .setColor("#4A90E2")
    .addFields(
      { name: "Start Time", value: time, inline: true },
      { name: "Host", value: host.toString(), inline: true },
    )
    .setTimestamp()

  if (cohost) {
    embed.addFields({ name: "Co-Host", value: cohost.toString(), inline: true })
  }

  if (type === "announce") {
    embed.setDescription("A training session has been scheduled! All staff members are encouraged to attend.")

    const trainingChannel = interaction.guild.channels.cache.find((ch) => ch.name === "training-announcements")
    if (trainingChannel) {
      await trainingChannel.send({ content: "@everyone", embeds: [embed] })
    }

    await interaction.reply({ content: "✅ Training announced to the public!", flags: 64 })
  } else if (type === "management") {
    embed.setDescription("Management is requested to join the training server to assist with the session.")

    const managementChannel = interaction.guild.channels.cache.find((ch) => ch.name === "management-announcements")
    if (managementChannel) {
      const managementRole = interaction.guild.roles.cache.find((role) => role.name === "Management")
      await managementChannel.send({ content: managementRole?.toString() || "@here", embeds: [embed] })
    }

    await interaction.reply({ content: "✅ Training announced to management!", flags: 64 })
  }
}
