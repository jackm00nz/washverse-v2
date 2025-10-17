import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js"
import { db } from "../../database/init.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder()
  .setName("createban")
  .setDescription("Create an in-game ban for the car wash")

export async function execute(interaction) {
  // Check permissions
  if (!hasPermission(interaction.member, "CORPORATE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Corporate Staff or higher.",
      flags: 64,
    })
  }

  // Start the ban creation process
  await interaction.reply({
    content: "🚫 **In-Game Ban Creation**\n\nPlease provide the ROBLOX username of the player to ban:",
    flags: 64,
  })

  // Create a collector for the username
  const filter = (m) => m.author.id === interaction.user.id
  const collector = interaction.channel.createMessageCollector({ filter, time: 300000, max: 1 })

  const banData = {}

  collector.on("collect", async (message) => {
    banData.username = message.content
    await message.delete()

    // Ask for duration
    const durationMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ban_duration")
        .setPlaceholder("Select ban duration")
        .addOptions([
          { label: "1 Day", value: "1d" },
          { label: "3 Days", value: "3d" },
          { label: "5 Days", value: "5d" },
          { label: "1 Week", value: "1w" },
          { label: "Permanent", value: "perm" },
        ]),
    )

    await interaction.followUp({
      content: `Username: **${banData.username}**\n\nPlease select the ban duration:`,
      components: [durationMenu],
      flags: 64,
    })
  })

  // Handle duration selection
  const durationFilter = (i) => i.customId === "ban_duration" && i.user.id === interaction.user.id
  const durationCollector = interaction.channel.createMessageComponentCollector({
    filter: durationFilter,
    time: 300000,
  })

  durationCollector.on("collect", async (i) => {
    banData.duration = i.values[0]
    await i.update({
      content: `Username: **${banData.username}**\nDuration: **${banData.duration}**\n\nPlease provide the reason for the ban:`,
      components: [],
    })

    // Collect reason
    const reasonCollector = interaction.channel.createMessageCollector({ filter, time: 300000, max: 1 })

    reasonCollector.on("collect", async (reasonMsg) => {
      banData.reason = reasonMsg.content
      await reasonMsg.delete()

      await interaction.followUp({
        content: `Username: **${banData.username}**\nDuration: **${banData.duration}**\nReason: **${banData.reason}**\n\nPlease attach proof (image link or description):`,
        flags: 64,
      })

      // Collect proof
      const proofCollector = interaction.channel.createMessageCollector({ filter, time: 300000, max: 1 })

      proofCollector.on("collect", async (proofMsg) => {
        banData.proof = proofMsg.content
        await proofMsg.delete()

        // Calculate end date
        const endDate = calculateEndDate(banData.duration)

        // Save to database
        db.prepare(
          "INSERT INTO game_bans (roblox_username, banned_by, duration, reason, proof, end_date, ban_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ).run(
          banData.username,
          interaction.user.id,
          banData.duration,
          banData.reason,
          banData.proof,
          endDate,
          "car_wash",
        )

        // Send confirmation
        const embed = new EmbedBuilder()
          .setTitle("🚫 In-Game Ban Created")
          .setColor("#FF0000")
          .addFields(
            { name: "Username", value: banData.username, inline: true },
            { name: "Duration", value: banData.duration, inline: true },
            { name: "Banned By", value: interaction.user.tag, inline: true },
            { name: "Reason", value: banData.reason },
            { name: "Proof", value: banData.proof },
            { name: "End Date", value: endDate === null ? "Permanent" : `<t:${Math.floor(endDate / 1000)}:F>` },
          )
          .setTimestamp()

        // Send to ban logs channel
        const banLogChannel = interaction.guild.channels.cache.find((ch) => ch.name === "ban-logs")
        if (banLogChannel) {
          await banLogChannel.send({ embeds: [embed] })
        }

        await interaction.followUp({
          content: `✅ In-game ban created for **${banData.username}**. This ban will be enforced in the car wash game.`,
          flags: 64,
        })
      })
    })
  })
}

function calculateEndDate(duration) {
  if (duration === "perm") return null

  const multipliers = {
    "1d": 86400000,
    "3d": 259200000,
    "5d": 432000000,
    "1w": 604800000,
  }

  return Date.now() + multipliers[duration]
}
