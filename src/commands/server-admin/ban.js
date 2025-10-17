import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Permanently ban a user from the server")
  .addUserOption((option) => option.setName("user").setDescription("The user to ban").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Reason for ban").setRequired(true))
  .addStringOption((option) => option.setName("proof").setDescription("Proof (link or description)").setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)

export async function execute(interaction) {
  const user = interaction.options.getUser("user")
  const reason = interaction.options.getString("reason")
  const proof = interaction.options.getString("proof") || "No proof provided"

  try {
    // Try to DM before banning
    try {
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("🔨 Banned from WashVerse")
            .setDescription(`You have been permanently banned from the WashVerse Discord server.`)
            .addFields({ name: "Reason", value: reason }, { name: "Moderator", value: interaction.user.tag })
            .setColor("#FF0000")
            .setTimestamp(),
        ],
      })
    } catch (error) {
      console.log("Could not DM user")
    }

    await interaction.guild.members.ban(user, { reason })

    // Log to database
    db.prepare(
      "INSERT INTO mod_logs (user_id, moderator_id, action, reason, proof, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(user.id, interaction.user.id, "ban", reason, proof, Date.now())

    // Send to mod logs channel
    const modLogChannel = interaction.guild.channels.cache.find((ch) => ch.name === "mod-logs")
    if (modLogChannel) {
      const embed = new EmbedBuilder()
        .setTitle("🔨 User Banned")
        .setColor("#FF0000")
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Type", value: "Permanent", inline: true },
          { name: "Reason", value: reason },
          { name: "Proof", value: proof },
        )
        .setTimestamp()

      await modLogChannel.send({ embeds: [embed] })
    }

    await interaction.reply({ content: `✅ ${user.tag} has been permanently banned.`, flags: 64 })
  } catch (error) {
    console.error("Error banning user:", error)
    await interaction.reply({ content: "❌ Failed to ban user.", flags: 64 })
  }
}
