import { openDB } from 'idb';

const DB_NAME = 'vre-lite-db';
const STORE_NAME = 'files';

/*async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function addFile(file) {
  const db = await getDB();
  const id = await db.add(STORE_NAME, file);
  return id;
}

export async function getFiles() {
  const db = await getDB();
  return await db.getAll(STORE_NAME);
}

export async function deleteFile(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}***/

export default function useIndexedDB() {

  const getDB = async() => {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }

  const addFile = async(file) => {
    const db = await getDB();
    const id = await db.add(STORE_NAME, file);
    return id;
  }
  
  const getFiles = async() => {
    const db = await getDB();
    return await db.getAll(STORE_NAME);
  }
  
  const deleteFile = async(id) => {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  }

  return {
    addFile,
    getFiles,
    deleteFile
  }

}
