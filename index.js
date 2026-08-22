const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/yt-dlp');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

// Stable Music Engine
const distube = new DisTube(client, {
  emitNewSongOnly: true,
  plugins: [new YouTubePlugin()]
});

const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('VC me gaana bajaye')
    .addStringOption(option => 
      option.setName('song')
        .setDescription('Gaane ka naam ya YouTube link')
        .setRequired(true)),
  new SlashCommandBuilder().setName('pause').setDescription('Gaana pause kare'),
  new SlashCommandBuilder().setName('resume').setDescription('Gaana resume kare'),
  new SlashCommandBuilder().setName('stop').setDescription('Music band karke VC chhod de'),
  new SlashCommandBuilder().setName('help').setDescription('Commands dekhe')
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`Bot Ready: ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('Music Slash Commands Synced!');
  } catch (err) {
    console.error(err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const voiceChannel = interaction.member.voice.channel;

  if (commandName === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFB6C1')
      .setTitle('🌸 cutie† | Music Bot')
      .setDescription('• `/play <song>` - VC me gaana chalaye\n• `/pause` - Gaana roke\n• `/resume` - Gaana resume kare\n• `/stop` - VC chhod de');
    return await interaction.reply({ embeds: [helpEmbed] });
  }

  if (commandName === 'play') {
    if (!voiceChannel) {
      return await interaction.reply({ content: '❌ Pehle kisi Voice Channel (VC) me join ho jao!', ephemeral: true });
    }

    await interaction.deferReply();
    const song = interaction.options.getString('song');

    try {
      await distube.play(voiceChannel, song, {
        textChannel: interaction.channel,
        member: interaction.member
      });
      await interaction.editReply(`🎶 **Requested:** \`${song}\` in **${voiceChannel.name}** 🎧`);
    } catch (e) {
      console.error(e);
      await interaction.editReply('❌ Song play karne me problem aayi! Please try again.');
    }
  }

  else if (commandName === 'pause') {
    distube.pause(interaction.guild);
    await interaction.reply('⏸️ Gaana pause ho gaya!');
  }

  else if (commandName === 'resume') {
    distube.resume(interaction.guild);
    await interaction.reply('▶️ Gaana firse shuru ho gaya!');
  }

  else if (commandName === 'stop') {
    distube.voices.leave(interaction.guild);
    await interaction.reply('⏹️ Bot VC se nikal gaya!');
  }
});

client.login(process.env.DISCORD_TOKEN);
