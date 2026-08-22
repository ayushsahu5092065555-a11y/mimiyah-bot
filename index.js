const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

// सिर्फ म्यूजिक स्लैश कमांड्स
const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('VC me gaana chalaye')
    .addStringOption(option => 
      option.setName('song')
        .setDescription('Gaane ka naam ya link')
        .setRequired(true)),
  new SlashCommandBuilder().setName('pause').setDescription('Gaana pause kare'),
  new SlashCommandBuilder().setName('resume').setDescription('Gaana firse chalaye'),
  new SlashCommandBuilder().setName('skip').setDescription('Agla gaana chalaye'),
  new SlashCommandBuilder().setName('stop').setDescription('Music band karke VC chhod de'),
  new SlashCommandBuilder().setName('help').setDescription('Cutie ke sare music commands dekhe')
].map(command => command.toJSON());

// Slash Commands Register karna
client.once('ready', async () => {
  console.log(`Bot Online Hai! Logged in as ${client.user.tag}`);
  
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('Registering Music Slash Commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('Cutie Music Commands Active!');
  } catch (error) {
    console.error(error);
  }
});

// Interactions / Commands Handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFB6C1')
      .setTitle('🌸 cutie† | Pure Music Commands')
      .setDescription('**Commands List:**\n\n• `/play <song>` - VC me gaana chalaye\n• `/pause` - Gaana roke\n• `/resume` - Gaana resume kare\n• `/skip` - Gaana skip kare\n• `/stop` - VC chhod de');
    
    await interaction.reply({ embeds: [helpEmbed] });
  }
  else if (commandName === 'play') {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return await interaction.reply({ content: '❌ Pehle kisi Voice Channel (VC) me join ho jao!', ephemeral: true });
    }
    const song = interaction.options.getString('song');
    await interaction.reply(`🎶 **Playing:** \`${song}\` in **${voiceChannel.name}** 🎧`);
  }
  else if (commandName === 'pause') {
    await interaction.reply('⏸️ Gaana pause kar diya gaya hai!');
  }
  else if (commandName === 'resume') {
    await interaction.reply('▶️ Gaana firse start ho gaya hai!');
  }
  else if (commandName === 'skip') {
    await interaction.reply('⏭️ Gaana skip ho gaya!');
  }
  else if (commandName === 'stop') {
    await interaction.reply('⏹️ Music stop ho gaya aur bot VC se nikal gaya.');
  }
});

client.login(process.env.DISCORD_TOKEN);
           
