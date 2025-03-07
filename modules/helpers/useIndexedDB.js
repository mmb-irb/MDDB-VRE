import { openDB } from 'idb';

const DB_NAME = 'vre-lite-db';
const STORE_NAME = 'files';

export default function useIndexedDB() {

  // This function is used to retrieve (and create if not exists) a new IndexedDB database with the name DB_NAME and a store named STORE_NAME.
  const getDB = async() => {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }

  // This function is used to add a file to the IndexedDB database.
  const addFile = async(file) => {
    const db = await getDB();
    const id = await db.add(STORE_NAME, file);
    return id;
  }
  
  // This function is used to get a file from the IndexedDB database.
  const getFile = async (id) => {
    const db = await getDB();
    return await db.get(STORE_NAME, id);
  }

  // This function is used to get all files from the IndexedDB database.
  const getAllFiles = async() => {
    const db = await getDB();
    return await db.getAll(STORE_NAME);
  }
  
  // This function is used to delete a single file from the IndexedDB database.
  const deleteFile = async(id) => {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  }

  // This function is used to delete all files from the IndexedDB database.
  const deleteAllFiles = async () => {
    const db = await getDB();
    await db.clear(STORE_NAME);
  }

  return {
    addFile,
    getFile,
    getAllFiles,
    deleteFile,
    deleteAllFiles
  }

}
