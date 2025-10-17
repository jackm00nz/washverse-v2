import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { readdirSync } from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function loadCommands(client) {
  const commandsPath = join(__dirname, "../commands")
  const commandFolders = readdirSync(commandsPath)

  for (const folder of commandFolders) {
    const folderPath = join(commandsPath, folder)
    const commandFiles = readdirSync(folderPath).filter((file) => file.endsWith(".js"))

    for (const file of commandFiles) {
      const filePath = join(folderPath, file)
      const command = await import(`file://${filePath}`)

      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command)
      }
    }
  }
}
