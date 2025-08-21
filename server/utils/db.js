import { MongoClient } from 'mongodb'

let client
let db

export async function connectToDatabase() {
  if (db) return { client, db }

  const config = useRuntimeConfig()
  client = new MongoClient(config.mongodbUri)

  try {
    await client.connect()
    db = client.db()
    console.log('Connected to MongoDB')
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}