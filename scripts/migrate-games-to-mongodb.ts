import { games } from '../lib/games-data';
import { connectToDatabase } from '../lib/db';

/**
 * Migrate all games from games-data.ts to MongoDB
 */
async function migrateGamesToMongoDB() {
  try {
    console.log(`Starting migration of ${games.length} games to MongoDB...`);
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('games');
    
    // Add createdAt field to all games
    const gamesWithTimestamp = games.map(game => ({
      ...game,
      createdAt: new Date()
    }));
    
    // Check for existing games to avoid duplicates
    const existingGames = await collection.find({}).toArray();
    const existingIds = new Set(existingGames.map(game => game.id));
    
    // Filter out games that already exist in MongoDB
    const newGames = gamesWithTimestamp.filter(game => !existingIds.has(game.id));
    
    if (newGames.length === 0) {
      console.log('No new games to migrate. All games already exist in MongoDB.');
      return;
    }
    
    // Insert all games in a single operation
    const result = await collection.insertMany(newGames);
    
    console.log(`Successfully migrated ${result.insertedCount} games to MongoDB.`);
    console.log(`${games.length - newGames.length} games were already in MongoDB.`);
  } catch (error) {
    console.error('Error migrating games to MongoDB:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the migration
migrateGamesToMongoDB(); 