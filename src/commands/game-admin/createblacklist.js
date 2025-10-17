import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder()
  .setName("createblacklist")
  .setDescription("Create a permanent blacklist across all game facilities")

export async function execute(interaction) {
  // Check permissions - only Administrative Staff and above
  if (!hasPermission(interaction.member, "ADMINISTRATIVE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Administrative Staff or higher.",
      flags: 64,
    })
  }

  await interaction.reply({
    content: "⛔ **Permanent Blacklist Creation**\n\nPlease provide the ROBLOX username to blacklist:",
    flags: 64,
  })

  const filter = (m) => m.author.id === interaction.user.id
  const blacklistData = {}

  // Collect username
  const usernameCollector = interaction.channel.createMessageCollector({ filter, time: 300000, max: 1 })

  usernameCollector.on("collect", async (message) => {
    blacklistData.username = message.content
    await message.delete()

    await interaction.followUp({
      content: `Username: **${blacklistData.username}**\n\nPlease provide the reason for the blacklist:`,
      flags: 64,
    })

    // Collect reason
    const reasonCollector = interaction.channel.createMessageCollector({ filter, time: 300000, max: 1 })

    reasonCollector.on("collect", async (reasonMsg) => {
      blacklistData.reason = reasonMsg.content
      await reasonMsg.delete()

      await interaction.followUp({
        content: `Username: **${blacklistData.username}**\nReason: **${blacklistData.reason}**\n\nPlease attach proof (image link or description):`,
        flags: 64,
      })

      // Collect proof
      const proofCollector = interaction.channel.createMessageCollector({ filter, time: 300000, max: 1 })

      proofCollector.on("collect", async (proofMsg) => {
        blacklistData.proof = proofMsg.content
        await proofMsg.delete()

        // Save to database
        db.prepare(
          "INSERT INTO game_bans (roblox_username, banned_by, duration, reason, proof, end_date, ban_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ).run(
          blacklistData.username,
          interaction.user.id,
          "permanent",
          blacklistData.reason,
          blacklistData.proof,
          null,
          "blacklist",
        )

        // Send confirmation
        const embed = new EmbedBuilder()
          .setTitle("⛔ Permanent Blacklist Created")
          .setColor("#000000")
          .addFields(
            { name: "Username", value: blacklistData.username, inline: true },
            { name: "Blacklisted By", value: interaction.user.tag, inline: true },
            { name: "Type", value: "All Game Facilities", inline: true },
            { name: "Reason", value: blacklistData.reason },
            { name: "Proof", value: blacklistData.proof },
          )
          .setFooter({ text: "This is a permanent ban across all WashVerse games" })
          .setTimestamp()

        // Send to ban logs channel
        const banLogChannel = interaction.guild.channels.cache.find((ch) => ch.name === "ban-logs")
        if (banLogChannel) {
          await banLogChannel.send({ embeds: [embed] })
        }

        await interaction.followUp({
          content: `✅ Permanent blacklist created for **${blacklistData.username}**. This user is now banned from all WashVerse game facilities.`,
          flags: 64,
        })
      })
    })
  })
}
