import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kick a user from the server")
  .addUserOption((option) => option.setName("user").setDescription("The user to kick").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Reason for kick").setRequired(true))
  .addStringOption((option) => option.setName("proof").setDescription("Proof (link or description)").setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)

export async function execute(interaction) {
  const user = interaction.options.getUser("user")
  const reason = interaction.options.getString("reason")
  const proof = interaction.options.getString("proof") || "No proof provided"

  const member = await interaction.guild.members.fetch(user.id)

  try {
    // Try to DM before kicking
    try {
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("👢 Kicked from WashVerse")
            .setDescription(`You have been kicked from the WashVerse Discord server.`)
            .addFields({ name: "Reason", value: reason }, { name: "Moderator", value: interaction.user.tag })
            .setColor("#FF6B6B")
            .setTimestamp(),
        ],
      })
    } catch (error) {
      console.log("Could not DM user")
    }

    await member.kick(reason)

    // Log to database
    db.prepare(
      "INSERT INTO mod_logs (user_id, moderator_id, action, reason, proof, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(user.id, interaction.user.id, "kick", reason, proof, Date.now())

    // Send to mod logs channel
    const modLogChannel = interaction.guild.channels.cache.find((ch) => ch.name === "mod-logs")
    if (modLogChannel) {
      const embed = new EmbedBuilder()
        .setTitle("👢 User Kicked")
        .setColor("#FF6B6B")
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Reason", value: reason },
          { name: "Proof", value: proof },
        )
        .setTimestamp()

      await modLogChannel.send({ embeds: [embed] })
    }

    await interaction.reply({ content: `✅ ${user.tag} has been kicked.`, ephemeral: true })
  } catch (error) {
    console.error("Error kicking user:", error)
    await interaction.reply({ content: "❌ Failed to kick user.", ephemeral: true })
  }
}
