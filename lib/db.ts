import { MongoClient, ServerApiVersion } from 'mongodb';
import { Game, GameStats } from './games-data';

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

/**
 * Delete a pending game suggestion and its contact email when issue is closed
 */
export async function cleanupClosedIssue(issueNumber: number): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    
    // Delete from both collections
    const [pendingResult, contactResult] = await Promise.all([
      db.collection('pending_games').deleteMany({ issueNumber }),
      db.collection('contacts').deleteMany({ issueNumber })
    ]);
    
    console.log(`Cleaned up issue #${issueNumber}: deleted ${pendingResult.deletedCount} pending games and ${contactResult.deletedCount} contacts`);
    
    return true;
  } catch (error) {
    console.error(`Error cleaning up issue #${issueNumber}:`, error);
    return false;
  }
}

/**
 * Get category counts from the database
 */
export async function getCategoryCounts() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('category_stats');
    
    // Get the latest category stats document
    const stats = await collection.findOne(
      { type: 'category_counts' },
      { sort: { updatedAt: -1 } }
    );
    
    if (stats) {
      return stats.counts;
    }
    
    // If no stats exist, calculate them and store them
    return await recalculateCategoryCounts();
  } catch (error) {
    console.error('Error getting category counts:', error);
    return {};
  }
}

/**
 * Recalculate category counts and store them in the database
 */
export async function recalculateCategoryCounts() {
  try {
    const { db } = await connectToDatabase();
    const gamesCollection = db.collection('games');
    const statsCollection = db.collection('category_stats');
    
    // Aggregate games by category
    const aggregationResult = await gamesCollection.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();
    
    // Convert to a more usable format
    const counts: Record<string, number> = {};
    let total = 0;
    
    aggregationResult.forEach(result => {
      counts[result._id] = result.count;
      total += result.count;
    });
    
    // Add total count
    counts['total'] = total;
    
    // Store the counts in the database
    await statsCollection.updateOne(
      { type: 'category_counts' },
      { 
        $set: { 
          counts,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    return counts;
  } catch (error) {
    console.error('Error recalculating category counts:', error);
    return {};
  }
}

/**
 * Update category counts when a game is added
 */
export async function incrementCategoryCount(categoryId: string) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('category_stats');
    
    // Update the category count and total count
    await collection.updateOne(
      { type: 'category_counts' },
      { 
        $inc: { 
          [`counts.${categoryId}`]: 1,
          'counts.total': 1
        },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    );
    
    return true;
  } catch (error) {
    console.error(`Error incrementing count for category ${categoryId}:`, error);
    return false;
  }
}

/**
 * Update category counts when a game is removed
 */
export async function decrementCategoryCount(categoryId: string) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('category_stats');
    
    // Update the category count and total count
    await collection.updateOne(
      { type: 'category_counts' },
      { 
        $inc: { 
          [`counts.${categoryId}`]: -1,
          'counts.total': -1
        },
        $set: { updatedAt: new Date() }
      }
    );
    
    return true;
  } catch (error) {
    console.error(`Error decrementing count for category ${categoryId}:`, error);
    return false;
  }
}

/**
 * Track a game interaction (click, favorite, unfavorite)
 */
export async function trackGameInteraction(
  gameId: string,
  type: 'click' | 'favorite' | 'unfavorite'
): Promise<boolean> {
  try {
    console.log(`trackGameInteraction called: gameId=${gameId}, type=${type}`);
    
    const { db } = await connectToDatabase();
    console.log('Connected to database successfully');
    
    const statsCollection = db.collection('game_stats');
    const gamesCollection = db.collection('games');
    
    // Update game stats directly
    const updateOperation: { $set: { lastUpdated: Date }; $inc?: { totalClicks?: number; totalFavorites?: number } } = { 
      $set: { lastUpdated: new Date() } 
    };
    
    if (type === 'click') {
      updateOperation.$inc = { totalClicks: 1 };
    } else if (type === 'favorite') {
      updateOperation.$inc = { totalFavorites: 1 };
    } else if (type === 'unfavorite') {
      updateOperation.$inc = { totalFavorites: -1 };
    }
    
    console.log('Update operation:', JSON.stringify(updateOperation, null, 2));
    
    // Update stats (create if doesn't exist)
    // First try to update existing document
    let updateResult = await statsCollection.updateOne(
      { gameId },
      updateOperation
    );
    
    // If no document was found, create one with proper initialization
    if (updateResult.matchedCount === 0) {
      const initOperation = {
        $set: { 
          gameId,
          lastUpdated: new Date(),
          totalClicks: type === 'click' ? 1 : 0,
          totalFavorites: type === 'favorite' ? 1 : (type === 'unfavorite' ? -1 : 0)
        }
      };
      
      updateResult = await statsCollection.updateOne(
        { gameId },
        initOperation,
        { upsert: true }
      );
    }
    
    console.log('Stats update result:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      upsertedCount: updateResult.upsertedCount,
      upsertedId: updateResult.upsertedId
    });
    
    // Recalculate and update popularity score
    const stats = await statsCollection.findOne({ gameId });
    console.log('Retrieved stats after update:', stats);
    
    if (stats) {
      // Weighted scoring system
      const clickWeight = 1;
      const favoriteWeight = 3; // Favorites are more valuable
      
      const rawScore = (stats.totalClicks || 0) * clickWeight + (stats.totalFavorites || 0) * favoriteWeight;
      console.log(`Calculated rawScore: ${rawScore} (clicks: ${stats.totalClicks || 0}, favorites: ${stats.totalFavorites || 0})`);
      
      // Simple normalization to 1-5 scale
      let popularityScore = 1;
      if (rawScore >= 100) popularityScore = 5;
      else if (rawScore >= 50) popularityScore = 4;
      else if (rawScore >= 20) popularityScore = 3;
      else if (rawScore >= 5) popularityScore = 2;
      
      console.log(`Setting popularity score to: ${popularityScore}`);
      
      // Update both stats and game popularity
      const [statsUpdateResult, gameUpdateResult] = await Promise.all([
        statsCollection.updateOne(
          { gameId },
          { $set: { popularityScore } }
        ),
        gamesCollection.updateOne(
          { id: gameId },
          { $set: { popularity: popularityScore } }
        )
      ]);
      
      console.log('Final update results:', {
        statsUpdate: { matchedCount: statsUpdateResult.matchedCount, modifiedCount: statsUpdateResult.modifiedCount },
        gameUpdate: { matchedCount: gameUpdateResult.matchedCount, modifiedCount: gameUpdateResult.modifiedCount }
      });
    } else {
      console.log('No stats found after update - this might indicate an issue');
    }
    
    console.log('trackGameInteraction completed successfully');
    return true;
  } catch (error) {
    console.error(`Error tracking ${type} interaction for game ${gameId}:`, error);
    return false;
  }
}


/**
 * Get game statistics
 */
export async function getGameStats(gameId: string): Promise<GameStats | null> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('game_stats');
    
    const stats = await collection.findOne({ gameId });
    return stats as GameStats | null;
  } catch (error) {
    console.error(`Error getting stats for game ${gameId}:`, error);
    return null;
  }
}

