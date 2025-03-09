import fs from 'fs/promises';
import path from 'path';

/**
 * Add a new game to the games-data.ts file
 */
export async function addGameToDataFile(
  name: string, 
  url: string, 
  description: string, 
  category: string
): Promise<boolean> {
  try {
    const filePath = path.join(process.cwd(), 'lib', 'games-data.ts');
    const content = await fs.readFile(filePath, 'utf8');
    
    // Create a new game entry
    const gameEntry = `  {
    id: "${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
    name: "${name.replace(/"/g, '\\"')}",
    description: "${description.replace(/"/g, '\\"')}",
    url: "${url.replace(/"/g, '\\"')}",
    category: "${category}",
    tags: ["${category}"],
    popularity: 1,
  },`;
    
    // Find the position to insert the new game (before the closing bracket of the games array)
    const insertPosition = content.lastIndexOf('];');
    if (insertPosition === -1) {
      throw new Error('Could not find games array in the data file');
    }
    
    // Insert the new game
    const updatedContent = 
      content.slice(0, insertPosition) + 
      gameEntry + '\n' + 
      content.slice(insertPosition);
    
    // Write the updated content back to the file
    await fs.writeFile(filePath, updatedContent, 'utf8');
    console.log(`Game "${name}" added to data file successfully`);
    return true;
  } catch (error) {
    console.error('Error adding game to data file:', error);
    return false;
  }
} 