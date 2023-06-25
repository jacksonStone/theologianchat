const db = require("./mongodb");
const { createNewChatHistory, readChat, appendUserAndChatGPTResponse } = require("./chatHistories");
const { upsertTheologian, getTheologians, getTheologian } = require("./theologians");

(async function () {
    await db.connect();
    const theologians = await getTheologians();
    console.log(theologians)
    const theologian = theologians.find(t => t.name === "C.S. Lewis");
    const teacherId = theologian._id;
    const userId = "test";

    const resp = await createNewChatHistory(teacherId, userId);
    console.log(resp);
    await appendUserAndChatGPTResponse(resp.insertedId, userId, "Should I study other religious texts such as the Quran?")
    console.log(await readChat(resp.insertedId, userId));
    await db.close()
})()