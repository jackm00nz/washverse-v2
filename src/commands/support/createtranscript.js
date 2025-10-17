import { SlashCommandBuilder, AttachmentBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
  .setName("createtranscript")
  .setDescription("Create a transcript of the ticket")

export async function execute(interaction) {
  if (!interaction.channel.name.startsWith("ticket-")) {
    return interaction.reply({ content: "❌ This command can only be used in ticket channels.", ephemeral: true })
  }

  await interaction.deferReply({ ephemeral: true })

  try {
    // Fetch all messages in the channel
    const messages = await interaction.channel.messages.fetch({ limit: 100 })
    const sortedMessages = Array.from(messages.values()).reverse()

    // Create transcript text
    let transcript = `Ticket Transcript - ${interaction.channel.name}\n`
    transcript += `Generated: ${new Date().toLocaleString()}\n`
    transcript += `${"=".repeat(50)}\n\n`

    for (const message of sortedMessages) {
      const timestamp = message.createdAt.toLocaleString()
      transcript += `[${timestamp}] ${message.author.tag}:\n${message.content}\n\n`
    }

    // Create attachment
    const buffer = Buffer.from(transcript, "utf-8")
    const attachment = new AttachmentBuilder(buffer, { name: `transcript-${interaction.channel.name}.txt` })

    // Send to transcript logs channel
    const transcriptChannel = interaction.guild.channels.cache.find((ch) => ch.name === "ticket-transcripts")
    if (transcriptChannel) {
      await transcriptChannel.send({
        content: `Transcript for ${interaction.channel.name}`,
        files: [attachment],
      })
    }

    await interaction.editReply({ content: "✅ Transcript created and saved!", files: [attachment] })
  } catch (error) {
    console.error("Error creating transcript:", error)
    await interaction.editReply({ content: "❌ Failed to create transcript." })
  }
}
