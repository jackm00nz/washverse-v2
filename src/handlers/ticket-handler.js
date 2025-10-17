import { EmbedBuilder, ChannelType, PermissionFlagsBits } from "discord.js"

export async function handleTicketButton(interaction, args) {
  const action = args[0] // 'create'

  if (action === "create") {
    const guild = interaction.guild
    const user = interaction.user

    // Check if user already has a ticket
    const existingTicket = guild.channels.cache.find(
      (ch) => ch.name === `ticket-${user.username.toLowerCase()}` && ch.type === ChannelType.GuildText,
    )

    if (existingTicket) {
      return interaction.reply({ content: "❌ You already have an open ticket.", ephemeral: true })
    }

    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      parent: interaction.channel.parent,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
      ],
    })

    const embed = new EmbedBuilder()
      .setTitle("🎫 Support Ticket")
      .setDescription("Thank you for creating a ticket. A staff member will be with you shortly.")
      .setColor("#3498DB")
      .setTimestamp()

    await ticketChannel.send({ content: `${user}`, embeds: [embed] })
    await interaction.reply({ content: `✅ Ticket created: ${ticketChannel}`, ephemeral: true })
  }
}
