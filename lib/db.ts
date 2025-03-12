import { MongoClient, ServerApiVersion } from 'mongodb';
import { Game } from './games-data';

// MongoDB connection URI (from environment variables)
const uri = process.env.MONGODB_URI || '';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connection cache for serverless environment
let cachedClient: MongoClient | null = null;
let cachedDb: ReturnType<MongoClient['db']> | null = null;

/**
 * Connect to MongoDB and return the database instance
 */
export async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    console.log('Using cached MongoDB connection');
    return { client: cachedClient, db: cachedDb };
  }

  if (!uri) {
    console.error('MongoDB URI not provided');
    throw new Error('MongoDB URI not provided');
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    // Connect to the MongoDB server
    if (!cachedClient) {
      cachedClient = await client.connect();
      console.log('Connected to MongoDB server');
    }

    // Get the database
    const db = cachedClient.db('daily-games-hub');
    cachedDb = db;
    console.log('Connected to daily-games-hub database');

    return { client: cachedClient, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Store a contact email for a GitHub issue
 */
export async function storeContactEmail(issueNumber: number, email: string) {
  try {
    console.log(`Attempting to store contact email for issue #${issueNumber}: ${email}`);
    const { db } = await connectToDatabase();
    const collection = db.collection('contacts');

    const result = await collection.insertOne({
      issueNumber,
      email,
      createdAt: new Date()
    });
    
    console.log(`Stored contact email for issue #${issueNumber}, insertedId:`, result.insertedId);
    return true;
  } catch (error) {
    console.error(`Failed to store contact email for issue #${issueNumber}:`, error);
    return false;
  }
}

/**
 * Get contact email for a GitHub issue
 */
export async function getContactEmail(issueNumber: number) {
  try {
    console.log(`Attempting to get contact email for issue #${issueNumber}`);
    const { db } = await connectToDatabase();
    const collection = db.collection('contacts');

    const result = await collection.findOne(
      { issueNumber },
      { sort: { createdAt: -1 } }
    );
    
    if (result) {
      console.log(`Found contact email for issue #${issueNumber}:`, result.email);
      return result.email;
    } else {
      console.log(`No contact email found for issue #${issueNumber}`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to get contact email for issue #${issueNumber}:`, error);
    return null;
  }
}

/**
 * Delete contact email for a GitHub issue after it's been used
 */
export async function deleteContactEmail(issueNumber: number) {
  try {
    console.log(`Attempting to delete contact email for issue #${issueNumber}`);
    const { db } = await connectToDatabase();
    const collection = db.collection('contacts');

    const result = await collection.deleteMany({ issueNumber });
    
    console.log(`Deleted ${result.deletedCount} contact email(s) for issue #${issueNumber}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete contact email for issue #${issueNumber}:`, error);
    return false;
  }
}

/**
 * Add a game to the pending suggestions collection
 */
export async function addPendingGameSuggestion(
  issueNumber: number,
  gameData: Game,
  contactEmail?: string
): Promise<boolean> {
  try {
    console.log(`Adding game "${gameData.name}" to pending suggestions`);
    
    const { db } = await connectToDatabase();
    const collection = db.collection('pending_games');
    
    // Create a pending game object with issue number and timestamp
    const pendingGame = {
      issueNumber,
      gameData,
      contactEmail,
      createdAt: new Date(),
      status: 'pending' // pending, approved, rejected
    };
    
    // Insert the pending game into MongoDB
    const result = await collection.insertOne(pendingGame);
    console.log(`Game "${gameData.name}" added to pending suggestions, insertedId:`, result.insertedId);
    
    return true;
  } catch (error) {
    console.error('Error adding game to pending suggestions:', error);
    return false;
  }
}

/**
 * Get a pending game suggestion by issue number
 */
export async function getPendingGameByIssueNumber(issueNumber: number) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('pending_games');
    
    return await collection.findOne({ issueNumber });
  } catch (error) {
    console.error(`Error getting pending game for issue #${issueNumber}:`, error);
    return null;
  }
}

/**
 * Update the status of a pending game suggestion
 */
export async function updatePendingGameStatus(
  issueNumber: number,
  status: 'approved' | 'rejected',
  comment?: string
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('pending_games');
    
    const result = await collection.updateOne(
      { issueNumber },
      { 
        $set: { 
          status,
          processedAt: new Date(),
          comment
        } 
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error(`Error updating pending game status for issue #${issueNumber}:`, error);
    return false;
  }
}