import { connectToDatabase, incrementCategoryCount } from './db';
import { Game } from './games-data';
import { WithId, Document } from 'mongodb';

/**
 * Capitalize the first letter of each word in a string
 */
export function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Add a new game to MongoDB
 */
export async function addGameToDataFile(
  name: string, 
  url: string, 
  description: string, 
  category: string,
  tags: string[] = []
): Promise<boolean> {
  try {
    // Capitalize the first letter of each word in the name
    const capitalizedName = capitalizeWords(name);
    
    // Limit description length to 100 characters and capitalize first letter
    const trimmedDescription = description.trim().slice(0, 100);
    const capitalizedDescription = capitalizeFirstLetter(trimmedDescription);
    
    // Ensure all tags are lowercase
    const lowerTags = tags.map(tag => tag.toLowerCase());
    
    // Validate tag length (min 2, max 20 characters)
    const validLengthTags = lowerTags.filter(tag => 
      tag.length >= 2 && tag.length <= 20
    );
    
    // Ensure tags don't include the category (redundant)
    const gameTags = validLengthTags.filter(tag => tag !== category);
    
    // Limit to 3 tags maximum
    const finalTags = gameTags.slice(0, 3);
    
    // Ensure there's at least one tag (use category as fallback)
    const tagsToUse = finalTags.length > 0 ? finalTags : [category];
    
    // Create a game object
    const gameData: Game = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: capitalizedName,
      description: capitalizedDescription,
      url: url,
      category: category,
      tags: tagsToUse,
      popularity: 1,
      createdAt: new Date()
    };
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('games');
    
    // Check if a game with this ID already exists
    const existingGame = await collection.findOne({ id: gameData.id });
    if (existingGame) {
      console.log(`Game with ID ${gameData.id} already exists`);
      return false;
    }
    
    // Insert the game into MongoDB
    const result = await collection.insertOne(gameData);
    
    // Update category counts
    await incrementCategoryCount(category);
    
    console.log(`Game "${gameData.name}" added to MongoDB, insertedId:`, result.insertedId);
    return true;
  } catch (error) {
    console.error('Error adding game to MongoDB:', error);
    return false;
  }
}

/**
 * Convert MongoDB document to plain object
 */
function convertMongoGameToPlain(doc: WithId<Document>): Game {
  // MongoDB documents are guaranteed to have these fields based on our schema
  return {
    id: doc.id as string,
    name: doc.name as string,
    description: doc.description as string,
    url: doc.url as string,
    category: doc.category as string,
    tags: doc.tags as string[],
    popularity: doc.popularity as number,
    createdAt: doc.createdAt as Date | undefined
  };
}

/**
 * Get all games from MongoDB
 */
export async function getGamesFromMongoDB() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('games');
    
    const games = await collection.find({}).sort({ popularity: -1 }).toArray();
    return games.map(convertMongoGameToPlain);
  } catch (error) {
    console.error('Error getting games from MongoDB:', error);
    return [];
  }
}

/**
 * Get games by category from MongoDB
 */
export async function getGamesByCategory(categoryId: string) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('games');
    
    // Get games for this category
    const games = await collection
      .find({ category: categoryId })
      .sort({ popularity: -1 })
      .toArray();
    
    return games.map(convertMongoGameToPlain);
  } catch (error) {
    console.error(`Error getting games for category ${categoryId}:`, error);
    return [];
  }
}

/**
 * Search games in MongoDB
 */
export async function searchGames(query: string) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('games');
    
    // Normalize the search query
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return [];
    }
    
    // Perform search using regex instead of text index
    const games = await collection
      .find({
        $or: [
          { name: { $regex: normalizedQuery, $options: 'i' } },
          { description: { $regex: normalizedQuery, $options: 'i' } },
          { tags: { $in: [normalizedQuery] } }
        ]
      })
      .sort({ popularity: -1 })
      .toArray();
    
    return games.map(convertMongoGameToPlain);
  } catch (error) {
    console.error(`Error searching games for "${query}":`, error);
    return [];
  }
}

/**
 * Get favorite games from MongoDB
 */
export async function getFavoriteGamesFromDB(favoriteIds: string[]) {
  try {
    if (!favoriteIds || favoriteIds.length === 0) {
      return [];
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('games');
    
    const games = await collection
      .find({ id: { $in: favoriteIds } })
      .sort({ popularity: -1 })
      .toArray();
    
    return games.map(convertMongoGameToPlain);
  } catch (error) {
    console.error('Error getting favorite games from MongoDB:', error);
    return [];
  }
} 