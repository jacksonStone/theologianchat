import theologians from './theologianData.json';
import { connect, close } from './mongodb';
import { upsertTheologian } from './theologians';

(async function () {
  await connect();
  for (const t of theologians) {
    console.log(t);
    await upsertTheologian(t.name, t.prompt, t.description, t.imageUrl);
  }
  await close();
})();
