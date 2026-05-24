const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");
require("dotenv").config();

// ─── Client Setup ────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

// ─── DisTube Setup ───────────────────────────────────────────────────────────
const distube = new DisTube(client, {
  plugins: [new YtDlpPlugin({ update: false })],
  emitNewSongOnly: true,
  joinNewVoiceChannel: true,
});

const PREFIX = process.env.PREFIX || "!";

// ─── Ready Event ─────────────────────────────────────────────────────────────
client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity("🎵 Music | !help", { type: ActivityType.Listening });
});

// ─── Message Handler ─────────────────────────────────────────────────────────
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const voiceChannel = message.member?.voice?.channel;

  // ── !help ──
  if (command === "help") {
    return message.reply({
      embeds: [{
        color: 0x5865f2,
        title: "🎵 Music Bot Commands",
        description: [
          `\`${PREFIX}play <song/URL>\` — Play a song or add to queue`,
          `\`${PREFIX}skip\` — Skip current song`,
          `\`${PREFIX}stop\` — Stop and clear queue`,
          `\`${PREFIX}pause\` — Pause playback`,
          `\`${PREFIX}resume\` — Resume playback`,
          `\`${PREFIX}queue\` — Show current queue`,
          `\`${PREFIX}volume <1-100>\` — Set volume`,
          `\`${PREFIX}nowplaying\` — Show current song`,
          `\`${PREFIX}shuffle\` — Shuffle the queue`,
          `\`${PREFIX}loop\` — Toggle loop mode`,
        ].join("\n"),
      }],
    });
  }

  // ── !play ──
  if (command === "play" || command === "p") {
    if (!voiceChannel) return message.reply("❌ You need to be in a voice channel!");
    const query = args.join(" ");
    if (!query) return message.reply("❌ Please provide a song name or URL!");
    try {
      await distube.play(voiceChannel, query, {
        message,
        textChannel: message.channel,
      });
    } catch (err) {
      message.reply(`❌ Error: ${err.message}`);
    }
    return;
  }

  // ── Queue-required commands ──
  const queue = distube.getQueue(message.guild);

  if (command === "skip" || command === "s") {
    if (!queue) return message.reply("❌ Nothing is playing!");
    await distube.skip(message.guild);
    return message.reply("⏭️ Skipped!");
  }

  if (command === "stop") {
    if (!queue) return message.reply("❌ Nothing is playing!");
    await distube.stop(message.guild);
    return message.reply("⏹️ Stopped and cleared queue.");
  }

  if (command === "pause") {
    if (!queue) return message.reply("❌ Nothing is playing!");
    distube.pause(message.guild);
    return message.reply("⏸️ Paused.");
  }

  if (command === "resume" || command === "r") {
    if (!queue) return message.reply("❌ Nothing is paused!");
    distube.resume(message.guild);
    return message.reply("▶️ Resumed.");
  }

  if (command === "shuffle") {
    if (!queue) return message.reply("❌ Nothing is playing!");
    await distube.shuffle(message.guild);
    return message.reply("🔀 Queue shuffled!");
  }

  if (command === "loop" || command === "l") {
    if (!queue) return message.reply("❌ Nothing is playing!");
    const mode = queue.repeatMode === 0 ? 2 : 0;
    await distube.setRepeatMode(message.guild, mode);
    return message.reply(mode === 2 ? "🔁 Loop queue: **ON**" : "🔁 Loop: **OFF**");
  }

  if (command === "volume" || command === "v") {
    if (!queue) return message.reply("❌ Nothing is playing!");
    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 1 || vol > 100)
      return message.reply("❌ Please provide a volume between 1 and 100.");
    distube.setVolume(message.guild, vol);
    return message.reply(`🔊 Volume set to **${vol}%**`);
  }

  if (command === "nowplaying" || command === "np") {
    if (!queue || !queue.songs[0]) return message.reply("❌ Nothing is playing!");
    const song = queue.songs[0];
    return message.reply({
      embeds: [{
        color: 0x5865f2,
        title: "🎵 Now Playing",
        description: `**[${song.name}](${song.url})**`,
        fields: [
          { name: "Duration", value: song.formattedDuration, inline: true },
          { name: "Requested by", value: `${song.user}`, inline: true },
        ],
        thumbnail: { url: song.thumbnail },
      }],
    });
  }

  if (command === "queue" || command === "q") {
    if (!queue || !queue.songs.length) return message.reply("❌ Queue is empty!");
    const songs = queue.songs
      .slice(0, 10)
      .map((s, i) => `${i === 0 ? "▶️" : `${i}.`} **${s.name}** (${s.formattedDuration})`)
      .join("\n");
    return message.reply({
      embeds: [{
        color: 0x5865f2,
        title: "📋 Queue",
        description: songs + (queue.songs.length > 10 ? `\n...and ${queue.songs.length - 10} more` : ""),
      }],
    });
  }
});

// ─── DisTube Events ──────────────────────────────────────────────────────────
distube.on("playSong", (queue, song) => {
  queue.textChannel?.send({
    embeds: [{
      color: 0x57f287,
      title: "▶️ Now Playing",
      description: `**[${song.name}](${song.url})**`,
      fields: [
        { name: "Duration", value: song.formattedDuration, inline: true },
        { name: "Requested by", value: `${song.user}`, inline: true },
      ],
      thumbnail: { url: song.thumbnail },
    }],
  });
});

distube.on("addSong", (queue, song) => {
  queue.textChannel?.send(`✅ Added **${song.name}** to the queue!`);
});

distube.on("error", (channel, error) => {
  console.error("DisTube error:", error);
  channel?.send(`❌ An error occurred: ${error.message}`);
});

distube.on("finish", (queue) => {
  queue.textChannel?.send("✅ Queue finished! Add more songs with `!play`.");
});

// ─── Login ───────────────────────────────────────────────────────────────────
client.login(process.env.DISCORD_TOKEN);
