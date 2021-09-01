const mineflayer = require("mineflayer");
const fetch = require("node-fetch");

const { multiPlayerStatChecking, apiKey, username, password, host, port, prefix } = require("./config.json");

// Options for bot
const botInfo = {
    host: host,
	port: port,
    username: username,
    password: password
};

const bot = mineflayer.createBot(botInfo);

// What to do once the bot spawns
bot.once('spawn', () => {
	console.log(`I have spawned in as '${bot.username}'`);
	bot.chat("Hey!");
    return
});

// Chat event
bot.on('chat', async (username, message) => {
    if (username === bot.username) return

    message = message.toLowerCase();

    if (message.startsWith(`${prefix}bw`)) {
        let players = message.split(" ");
    
        if (multiPlayerStatChecking) {
            for (let i = 1; i < players.length; i++) {
                const player = players[i];
                const stats = await checkStats(player);
                bot.chat(stats);
            }
        } else {
            const player = player[1];
            const stats = await checkStats(player);
            bot.chat(stats);
        }
            return

    } else if (message.startsWith(`${prefix}help`)) {
        bot.chat("cs - Check Stats of Provided User | help - This command dummy!");
        return
    } else if (message.startsWith(prefix)) {
        bot.chat("Unknown command!");
        return
    };
});

// Function for checking stats of provided user
async function checkStats(name) {
    try {
        const mojang_data = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`, {method: "GET"});
        const mojangData = await mojang_data.json();

        const apiRaw = await fetch(`https://api.hypixel.net/player?key=${apiKey}&uuid=${mojangData.id}`, {method: "GET"});
        const apiData = await apiRaw.json();

        const stars = apiData.player.achievements.bedwars_level;
        const finalDeaths = apiData.player.stats.Bedwars.final_deaths_bedwars;
        const finalKills = apiData.player.stats.Bedwars.final_kills_bedwars;
        const fkdr = parseFloat(((finalKills) / (finalDeaths)).toFixed(1));
        const index = ((stars * fkdr ** 2) / 10).toFixed(1);
        const wins = apiData.player.stats.Bedwars.wins_bedwars || 0;
        const losses = apiData.player.stats.Bedwars.losses_bedwars || 0;
        const wlr = (wins / losses).toFixed(2);
        const ign = mojangData.name;

        const result = `[✫${stars}] ${ign} | FKDR: ${fkdr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} | Index: ${index.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} | WLR: ${wlr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} | !! Ignore: ${Math.floor(Math.random() * 100)}`;
        return result

    } catch (err) {
        console.log(err);
        return `Invalid Player Specified!`;
    }
};

// If bot gets kicked, we log it to the console
bot.on('kicked', kickError => {
    console.log(kickError);
});

// If bot encounters an error, we log it to the console
bot.on('error', error => {
    console.log(error);
});