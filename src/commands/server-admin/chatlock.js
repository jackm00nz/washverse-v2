import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js"

export const data = new SlashCommandBuilder()
  .setName("chatlock")
  .setDescription("Lock the current channel for 5 minutes")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)

export async function execute(interaction) {
  const channel = interaction.channel

  try {
    // Lock the channel
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false,
    })

    await interaction.reply({ content: "🔒 This channel has been locked for 5 minutes.", ephemeral: false })

    // Unlock after 5 minutes
    setTimeout(
      async () => {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SendMessages: null,
        })

        await channel.send("🔓 This channel has been unlocked.")
      },
      5 * 60 * 1000,
    )
  } catch (error) {
    console.error("Error locking channel:", error)
    await interaction.reply({ content: "❌ Failed to lock channel.", flags: 64 })
  }
}
