import mongoose from 'mongoose'

/**
 * Connect to MongoDB. Reads the connection string from MONGODB_URI (.env),
 * falling back to a LOCAL MongoDB on the developer's own machine.
 * No external/private server is hardcoded anywhere.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/teamflow'
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  const where = process.env.MONGODB_URI ? 'MONGODB_URI from .env' : 'local fallback (127.0.0.1)'
  console.log(`✅ MongoDB connected (${where})`)
}
