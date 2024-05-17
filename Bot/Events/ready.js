module.exports = {
    name: "ready",
    async execute(client) {

        console.log("Bot başarıyla giriş yaptı.")
        client.application.commands.set(client.globalCommands).then(() => console.log("Slash komutları başarıyla yüklendi.")).catch(() => console.log("Slash komutları yüklenirken bir hata ile karşılaşıldı."));

    }
};