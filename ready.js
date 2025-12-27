const { ActivityType } = require("discord.js");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        if (!client.user) {
            console.error("Client user is not defined.");
            return;
        }

        await client.user.setPresence({
            activities: [
                {
                    name: "GVRB",
                    type: ActivityType.Playing,
                },
            ],
            status: "online",
        });

        console.log(`${client.user.tag} is online`);
        console.log(`Status: ${client.presence?.status || "unknown"}`);

        client.user.setStatus("online");

    },
};
