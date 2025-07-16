
import { openDB } from 'idb';

const DB_NAME = 'SecureDB';
const STORE_NAME = 'PrivateKeys';

const getDB = () => openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'user_id' });
    }
  },
});

// Save private key
export const storePrivateKey = async (user_id, privateKey) => {
  try{
    const db = await getDB();
    await db.put(STORE_NAME, { user_id, key: privateKey });
    console.log(`Private key stored for user: ${user_id}`);
  }catch (error) {
    console.error("Error storing private key:", error);
    throw new Error("Failed to store private key");
  }
  
};

// Load private key
export const loadPrivateKey = async (user_id) => {
  const db = await getDB();
  const result = await db.get(STORE_NAME, user_id);
  return result?.key;
};

// Delete private key
export const deletePrivateKey = async (user_id) => {
  const db = await getDB();
  await db.delete(STORE_NAME, user_id);
};
