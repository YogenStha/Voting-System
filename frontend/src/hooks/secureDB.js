import { openDB } from 'idb';

const DB_NAME = 'SecureDB';
const STORE_NAME = 'PrivateKeys';
const DB_VERSION = 1;

let dbInstance = null;

// Initialize database
const initDB = async () => {
  if (dbInstance) return dbInstance;
  
  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading SecureDB from ${oldVersion} to ${newVersion}`);
        
        // Delete old store if it exists (in case of schema changes)
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        
        // Create new store
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'user_id' });
        console.log('Created object store:', STORE_NAME);
      },
      blocked() {
        console.warn('Database blocked - another connection is upgrading');
      },
      blocking() {
        console.warn('Database blocking - close this connection to allow upgrade');
        dbInstance?.close();
        dbInstance = null;
      },
      terminated() {
        console.warn('Database connection terminated');
        dbInstance = null;
      },
    });
    
    console.log('SecureDB initialized successfully');
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    dbInstance = null;
    throw error;
  }
};

// Store private key with validation and error handling
export const storePrivateKey = async (user_id, privateKey) => {
  console.log(`🔐 Attempting to store private key for user: ${user_id}`);
  
  if (!user_id) {
    throw new Error('User ID is required');
  }
  
  if (!privateKey || typeof privateKey !== 'string' || privateKey.trim() === '') {
    throw new Error('Valid private key is required');
  }

  try {
    const db = await initDB();
    
    const keyData = {
      user_id: user_id,
      key: privateKey.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Use a transaction for reliability
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    await store.put(keyData);
    await tx.complete;
    
    console.log(`✅ Private key stored successfully for user: ${user_id}`);
    
    // Verify the key was stored by reading it back
    const verification = await store.get(user_id);
    if (verification && verification.key) {
      console.log(`✅ Storage verification successful for user: ${user_id}`);
      return true;
    } else {
      throw new Error('Failed to verify key storage');
    }
    
  } catch (error) {
    console.error(`❌ Error storing private key for user ${user_id}:`, error);
    throw new Error(`Failed to store private key: ${error.message}`);
  }
};

// Load private key with detailed logging
export const loadPrivateKey = async (user_id) => {
  console.log(`🔍 Attempting to load private key for user: ${user_id}`);
  
  if (!user_id) {
    console.error('❌ No user ID provided');
    return null;
  }

  try {
    const db = await initDB();
    
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    const result = await store.get(user_id);
    await tx.complete;
    
    if (result && result.key) {
      console.log(`✅ Private key found for user: ${user_id}`);
      console.log(`📅 Key created: ${result.created_at || 'Unknown'}`);
      return result.key;
    } else {
      console.warn(`⚠️ No private key found for user: ${user_id}`);
      
      // Debug: List all stored keys
      const allKeys = await getAllUserIds();
      console.log(`🔍 Debug - All stored user IDs: [${allKeys.join(', ')}]`);
      
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Error loading private key for user ${user_id}:`, error);
    return null;
  }
};

// Check if private key exists for user
export const hasPrivateKey = async (user_id) => {
  try {
    const key = await loadPrivateKey(user_id);
    const exists = key !== null && key !== undefined && key.trim() !== '';
    console.log(`🔍 User ${user_id} has private key: ${exists}`);
    return exists;
  } catch (error) {
    console.error(`❌ Error checking private key for user ${user_id}:`, error);
    return false;
  }
};

// Delete private key
export const deletePrivateKey = async (user_id) => {
  console.log(`🗑️ Attempting to delete private key for user: ${user_id}`);
  
  if (!user_id) {
    throw new Error('User ID is required');
  }

  try {
    const db = await initDB();
    
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    await store.delete(user_id);
    await tx.complete;
    
    console.log(`✅ Private key deleted for user: ${user_id}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error deleting private key for user ${user_id}:`, error);
    throw new Error(`Failed to delete private key: ${error.message}`);
  }
};

// Get all user IDs (for debugging)
export const getAllUserIds = async () => {
  try {
    const db = await initDB();
    
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    const keys = await store.getAllKeys();
    await tx.complete;
    
    console.log(`📋 Found ${keys.length} stored user IDs:`, keys);
    return keys;
    
  } catch (error) {
    console.error('❌ Error getting all user IDs:', error);
    return [];
  }
};

// Get all stored data (for debugging)
export const getAllStoredData = async () => {
  try {
    const db = await initDB();
    
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    const allData = await store.getAll();
    await tx.complete;
    
    console.log(`📋 All stored data (${allData.length} entries):`, 
      allData.map(item => ({
        user_id: item.user_id,
        created_at: item.created_at,
        key_length: item.key ? item.key.length : 0
      }))
    );
    
    return allData;
    
  } catch (error) {
    console.error('❌ Error getting all stored data:', error);
    return [];
  }
};

// Clear all data (for testing/debugging)
export const clearAllData = async () => {
  try {
    const db = await initDB();
    
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    await store.clear();
    await tx.complete;
    
    console.log('🧹 All data cleared from SecureDB');
    return true;
    
  } catch (error) {
    console.error('❌ Error clearing all data:', error);
    throw new Error(`Failed to clear data: ${error.message}`);
  }
};