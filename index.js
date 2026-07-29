const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

// आपकी Discord User ID
const OWNER_ID = "1434364209214390423";

// स्लैश कमांड्स
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("बॉट का रिस्पॉन्स टाइम चेक करें"),
  new SlashCommandBuilder().setName("hi").setDescription("Cutie को हैलो बोलें!"),
  new SlashCommandBuilder().setName("avatar").setDescription("अपनी या किसी यूजर की प्रोफाइल फोटो देखें")
    .addUserOption((option) => option.setName("user").setDescription("किसकी डीपी देखनी है?").setRequired(false)),
  new SlashCommandBuilder().setName("say").setDescription("बॉट से कोई मैसेज बुलवाएं")
    .addStringOption((option) => option.setName("message").setDescription("क्या बुलवाना है?").setRequired(true)),
  
  // 🎮 नए गेम्स के कमांड्स
  new SlashCommandBuilder().setName("guess").setDescription("1 से 10 के बीच का नंबर गेस करें!")
    .addIntegerOption((option) => option.setName("number").setDescription("अपना नंबर चुनें (1-10)").setRequired(true)),
  new SlashCommandBuilder().setName("rps").setDescription("Rock, Paper, Scissors खेलें!")
    .addStringOption((option) =>
      option.setName("choice")
        .setDescription("अपना विकल्प चुनें")
        .setRequired(true)
        .addChoices(
          { name: "🪨 Rock", value: "rock" },
          { name: "📄 Paper", value: "paper" },
          { name: "✂️ Scissors", value: "scissors" }
        )
    ),
  new SlashCommandBuilder().setName("truth-or-dare").setDescription("Truth या Dare चुनें!")
    .addStringOption((option) =>
      option.setName("type")
        .setDescription("Truth या Dare?")
        .setRequired(true)
        .addChoices(
          { name: "Truth", value: "truth" },
          { name: "Dare", value: "dare" }
        )
    ),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("All New Game Commands Registered!");
  } catch (error) {
    console.error(error);
  }
});

// 👑 ऑटोमैटिक ओनर एंट्री डिटेक्ट करने का इवेंट (Voice State Update)
client.on("voiceStateUpdate", async (oldState, newState) => {
  if (!oldState.channelId && newState.channelId) {
    if (newState.member.id === OWNER_ID) {
      const textChannel = newState.guild.systemChannel || newState.guild.channels.cache.find(
        (c) => c.isTextBased() && c.permissionsFor(newState.guild.members.me).has("SendMessages")
      );

      if (textChannel) {
        const embed = new EmbedBuilder()
          .setTitle("👑 Owner Arrival Notice!")
          .setDescription(`🚨 **Owner ${newState.member.user.username} is coming into ${newState.channel.name}!** 👑\nसब सावधान हो जाओ! 😎`)
          .setColor("#FFD700")
          .setTimestamp();

        textChannel.send({ embeds: [embed] });
      }
    }
  }
});

// कमांड्स हैंडलर
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "ping") {
    await interaction.reply(`🏓 Pong! Latency is **${client.ws.ping}ms**.`);
  } else if (commandName === "hi") {
    await interaction.reply("Hello! I am Cutie 🤖");
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
  } 
  
  // 🎯 Guess Number Game
  else if (commandName === "guess") {
    const userGuess = options.getInteger("number");
    const botNumber = Math.floor(Math.random() * 10) + 1;

    if (userGuess === botNumber) {
      await interaction.reply(`🎉 **जीत गए!** तुमने **${userGuess}** चुना था और मेरा नंबर भी **${botNumber}** ही था! 😎`);
    } else {
      await interaction.reply(`❌ **गलत जवाब!** तुमने **${userGuess}** चुना था, लेकिन मेरा नंबर **${botNumber}** था। दोबारा ट्राई करो! 😜`);
    }
  } 
  
  // ✂️ Rock Paper Scissors Game
  else if (commandName === "rps") {
    const userChoice = options.getString("choice");
    const choices = ["rock", "paper", "scissors"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = "";
    if (userChoice === botChoice) {
      result = "🤝 **Match Draw!** दोनों ने सेम चुना।";
    } else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    ) {
      result = `🎉 **तुम जीत गए!** तुमने **${userChoice}** चुना और मैंने **${botChoice}** चुना! 🔥`;
    } else {
      result = `😜 **मैं जीत गया!** मैंने **${botChoice}** चुना और तुमने **${userChoice}** चुना! 🏆`;
    }

    await interaction.reply(result);
  } 
  
  // 🎲 Truth or Dare Game
  else if (commandName === "truth-or-dare") {
    const type = options.getString("type");

    const truths = [
      "तुम्हारा सबसे एम्बैरेसिंग मोमेंट क्या रहा है?",
      "अगर तुम्हें 1 लाख रुपये मिलें, तो सबसे पहले क्या खरीदोगे?",
      "इस सर्वर में तुम्हारा सबसे फेवरेट बंदा कौन है?",
    ];

    const dares = [
      "किसी भी वॉइस चैनल में जाकर 10 सेकंड तक गाना गाओ!",
      "अपने प्रोफाइल स्टेटस में अगले 1 घंटे के लिए 'I Love Cutie Bot' लिखो!",
      "सर्वर के किसी भी मेंबर को एक रैंडम फनी मीम सेंड करो!",
    ];

    if (type === "truth") {
      const randomTruth = truths[Math.floor(Math.random() * truths.length)];
      await interaction.reply(`🤔 **Truth:** ${randomTruth}`);
    } else {
      const randomDare = dares[Math.floor(Math.random() * dares.length)];
      await interaction.reply(`🔥 **Dare:** ${randomDare}`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
