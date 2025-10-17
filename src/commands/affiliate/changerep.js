import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder()
  .setName("changerep")
  .setDescription("Change representatives for an alliance")
  .addUserOption((option) => option.setName("user").setDescription("New representative").setRequired(true))
  .addStringOption((option) => option.setName("group").setDescription("Group name").setRequired(true))

export async function execute(interaction) {
  if (!hasPermission(interaction.member, "ADMINISTRATIVE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Administrative Staff or higher.",
      ephemeral: true,
    })
  }

  const user = interaction.options.getUser("user")
  const groupName = interaction.options.getString("group")

  const alliance = db.prepare("SELECT * FROM alliances WHERE group_name = ?").get(groupName)

  if (!alliance) {
    return interaction.reply({ content: `❌ Alliance "${groupName}" not found.`, ephemeral: true })
  }

  // Update representative
  db.prepare("UPDATE alliances SET representatives = ? WHERE group_name = ?").run(user.tag, groupName)

  // Notify the alliance channel
  if (alliance.channel_id) {
    const channel = interaction.guild.channels.cache.get(alliance.channel_id)
    if (channel) {
      const embed = new EmbedBuilder()
        .setTitle("👥 Representative Change")
        .setDescription(`The representative for this alliance has been changed to ${user.toString()}`)
        .setColor("#FFA500")
        .setTimestamp()

      await channel.send({ embeds: [embed] })
    }
  }

  await interaction.reply({ content: `✅ Representative changed to ${user.tag} for ${groupName}!`, ephemeral: true })
}
