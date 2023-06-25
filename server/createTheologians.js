const theologians = require("./theologianData.json");
const db = require("./mongodb");
const { upsertTheologian } = require("./theologians");

(async function () {
    await db.connect();
    for (t of theologians) {
        console.log(t)
        await upsertTheologian(t.name, t.prompt, t.description, t.imageUrl)
    }
    await db.close()
})()