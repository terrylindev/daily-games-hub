import fs from 'fs/promises';
import path from 'path';

/**
 * Add a new game to the games-data.ts file
 */
export async function addGameToDataFile(
  name: string, 
  url: string, 
  description: string, 
  category: string,
  tags: string[] = []
): Promise<boolean> {
  try {
    // Limit description length to 500 characters
    const trimmedDescription = description.trim().slice(0, 500);
    
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
    
    const filePath = path.join(process.cwd(), 'lib', 'games-data.ts');
    const content = await fs.readFile(filePath, 'utf8');
    
    // Create a new game entry
    const gameEntry = `  {
    id: "${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
    name: "${name.replace(/"/g, '\\"')}",
    description: "${trimmedDescription.replace(/"/g, '\\"')}",
    url: "${url.replace(/"/g, '\\"')}",
    category: "${category}",
    tags: [${finalTags.length > 0 ? finalTags.map(tag => `"${tag.replace(/"/g, '\\"')}"`).join(', ') : `"${category}"`}],
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
    console.log(`Game "${name}" added to data file successfully with tags: ${finalTags.join(', ') || category}`);
    return true;
  } catch (error) {
    console.error('Error adding game to data file:', error);
    return false;
  }
} 