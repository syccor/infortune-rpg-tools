import { readFileSync } from 'node:fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(
  readFileSync(new URL('./serviceAccountKey.json', import.meta.url), 'utf8'),
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const db = getFirestore();

export async function seedCollection(collectionName, data) {
  const batch = db.batch();

  for (const item of data) {
    const { id, ...payload } = item;
    const ref = db.collection(collectionName).doc(id);
    batch.set(ref, payload, { merge: true });
  }

  await batch.commit();
  console.log(`✅ Seeded ${collectionName}`);
}
