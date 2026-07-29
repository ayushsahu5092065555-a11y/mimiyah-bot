const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// स्लैश कमांड्स
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("बॉट का रिस्पॉन्स टाइम चेक करें"),
  new SlashCommandBuilder()
    .setName("hi")
    .setDescription("Cutie को हैलो बोलें!"),
  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("अपनी या किसी यूजर की प्रोफाइल फोटो देखें")
    .addUserOption((option) =>
      option.setName("user").setDescription("किसकी डीपी देखनी है?").setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("बॉट से कोई मैसेज बुलवाएं")
    .addStringOption((option) =>
      option.setName("message").setDescription("क्या बुलवाना है?").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("सिक्का उछालें (Heads या Tails)"),
  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("पासा (Dice) फेंकें (1 से 6)"),
  new SlashCommandBuilder()
    .setName("joke")
    .setDescription("एक मज़ेदार चुटकुला सुनें"),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("All Slash Commands Registered!");
  } catch (error) {
    console.error(error);
  }
});

// कमांड्स हैंडलर
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "ping") {
    await interaction.reply(`🏓 Pong! Latency is **${client.ws.ping}ms**.`);
  } else if (commandName === "hi") {
    await interaction.reply("Hello! I am Cutie 🤖, how can I help you today?");
  } else if (commandName === "avatar") {
    const targetUser = options.getUser("user") || interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Avatar`)
      .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
      .setColor("#FF69B4");

    await interaction.reply({ embeds: [embed] });
  } else if (commandName === "say") {
    const text = options.getString("message");
    await interaction.reply({ content: text });
  } else if (commandName === "coinflip") {
    const result = Math.random() < 0.5 ? "🪙 **Heads**" : "🪙 **Tails**";
    await interaction.reply(`सिक्का उछाला गया... और आया: ${result}!`);
  } else if (commandName === "roll") {
    const diceNumber = Math.floor(Math.random() * 6) + 1;
    await interaction.reply(`🎲 आपने पासा फेंका और नंबर आया: **${diceNumber}**!`);
  } else if (commandName === "joke") {
    const jokes = [
      "टीचर: बताओ, सबसे पुराना जानवर कौन सा है? छात्र: ज़ेब्रा, क्योंकि वो ब्लैक एंड व्हाइट है! 😃",
      "पापा: बेटा, परीक्षा कैसी रही? बेटा: सवाल आसान थे, बस जवाब कठिन थे! 😂",
      "टीचर: 10 में से 8 गए तो कितने बचे? छात्र: मैडम, ये तो वही जाने जिसने लिए थे! 😆"
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    await interaction.reply(randomJoke);
  }
});

client.login(process.env.DISCORD_TOKEN);
