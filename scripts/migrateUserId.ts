import { db } from "../firebase/admin";

async function migrate() {
  const snapshot = await db.collection("interviews").get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    const data = doc.data() as any;
    if (!data.userId) {
      const candidate = data.userid || data.uid || data.UID || data.Uid;
      if (candidate) {
        console.log(`updating ${doc.id} -> userId=${candidate}`);
        batch.update(doc.ref, { userId: candidate });
      }
    }
  });
  await batch.commit();
  console.log("migration complete");
}

migrate().catch(console.error);
