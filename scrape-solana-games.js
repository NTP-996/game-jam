const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeGames() {
  console.log('🚀 Starting to scrape Solana Speedrun 3 games...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for production
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the Solana Speedrun 3 entries page
    console.log('📄 Loading itch.io page...');
    await page.goto('https://itch.io/jam/solana-speedrun-3/entries', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for the game entries to load
    await page.waitForSelector('.game_cell', { timeout: 10000 });
    
    console.log('🎮 Extracting game data...');
    
    // Extract game data
    const games = await page.evaluate(() => {
      const gameElements = document.querySelectorAll('.game_cell');
      const gamesData = [];
      
      gameElements.forEach((element, index) => {
        try {
          // Basic game info
          const titleElement = element.querySelector('.game_title a');
          const authorElement = element.querySelector('.game_author a');
          const thumbnailElement = element.querySelector('.game_thumb img');
          const linkElement = element.querySelector('.game_title a');
          
          // Extract data with fallbacks
          const title = titleElement?.textContent?.trim() || `Game ${index + 1}`;
          const author = authorElement?.textContent?.trim() || 'Unknown';
          const gameUrl = linkElement?.href || '';
          const thumbnailUrl = thumbnailElement?.src || '';
          
          // Try to extract description if available
          const descElement = element.querySelector('.game_short_text');
          const description = descElement?.textContent?.trim() || '';
          
          // Try to extract rating/stats if available
          const ratingElement = element.querySelector('.rating_count');
          const rating = ratingElement?.textContent?.trim() || '';
          
          gamesData.push({
            id: `speedrun-${index + 1}`,
            title,
            author,
            gameUrl,
            thumbnailUrl,
            description,
            rating,
            index: index + 1
          });
        } catch (error) {
          console.log(`Error processing game ${index + 1}:`, error.message);
        }
      });
      
      return gamesData;
    });

    console.log(`✅ Found ${games.length} games`);

    // Get detailed info for each game
    console.log('🔍 Getting detailed info for each game...');
    
    for (let i = 0; i < Math.min(games.length, 5); i++) { // Limit to first 5 for testing
      const game = games[i];
      
      if (game.gameUrl) {
        try {
          console.log(`📖 Scraping details for: ${game.title}`);
          
          await page.goto(game.gameUrl, { 
            waitUntil: 'networkidle2', 
            timeout: 15000 
          });
          
          // Extract detailed game info
          const details = await page.evaluate(() => {
            const getTextContent = (selector) => {
              const element = document.querySelector(selector);
              return element?.textContent?.trim() || '';
            };
            
            const getAttributes = (selector, attribute) => {
              const element = document.querySelector(selector);
              return element?.getAttribute(attribute) || '';
            };
            
            return {
              fullDescription: getTextContent('.formatted_description'),
              tags: Array.from(document.querySelectorAll('.tag')).map(tag => tag.textContent.trim()),
              screenshots: Array.from(document.querySelectorAll('.screenshot img')).map(img => img.src),
              downloadLinks: Array.from(document.querySelectorAll('.download_btn')).map(btn => btn.href),
              webPlayLink: getAttributes('.web_play_btn', 'href'),
              genre: getTextContent('.game_genre'),
              platforms: Array.from(document.querySelectorAll('.icon-platform')).map(icon => icon.className),
              publishDate: getTextContent('.game_info_panel_widget time'),
              fileSize: getTextContent('.file_size'),
              price: getTextContent('.buy_row .price')
            };
          });
          
          // Merge details with basic info
          games[i] = { ...game, ...details };
          
          // Small delay to be respectful
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.log(`❌ Error getting details for ${game.title}:`, error.message);
        }
      }
    }

    // Helper functions for code generation
    const generateGithubUrl = (author, title) => {
      const cleanAuthor = author.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      return `https://github.com/${cleanAuthor}/${cleanTitle}`;
    };
    
    const generateDate = (index) => {
      const baseDate = new Date('2024-01-20');
      baseDate.setDate(baseDate.getDate() - index);
      return baseDate.toISOString();
    };
    
    const categorizeGame = (game) => {
      const title = game.title.toLowerCase();
      const desc = (game.description || '').toLowerCase();
      const tags = (game.tags || []).join(' ').toLowerCase();
      const combined = `${title} ${desc} ${tags}`;
      
      if (combined.includes('rpg') || combined.includes('adventure') || combined.includes('quest')) return 'RPG/MMORPG';
      if (combined.includes('puzzle') || combined.includes('2048') || combined.includes('match')) return 'Puzzle';
      if (combined.includes('strategy') || combined.includes('tower') || combined.includes('tactics')) return 'Strategy';
      if (combined.includes('action') || combined.includes('shooter') || combined.includes('arena')) return 'Action/Adventure';
      if (combined.includes('casual') || combined.includes('mobile') || combined.includes('simple')) return 'Casual/Mobile';
      if (combined.includes('education') || combined.includes('learn') || combined.includes('science')) return 'Educational';
      if (combined.includes('sport') || combined.includes('racing') || combined.includes('boxing')) return 'Sports';
      if (combined.includes('simulation') || combined.includes('business') || combined.includes('startup')) return 'Simulation';
      
      return 'Action/Adventure'; // Default
    };

    // Generate TypeScript interface code
    const generateTypeScriptCode = (games) => {
      return `// Scraped from itch.io Solana Speedrun 3 - ${new Date().toISOString()}
const speedrun2024Games: Project[] = [
${games.map(game => `  {
    id: '${game.id}',
    project_name: '${game.title.replace(/'/g, "\\'")}',
    project_description: '${(game.fullDescription || game.description || `Game by ${game.author} from Solana Speedrun 3`).replace(/'/g, "\\'").substring(0, 150)}...',
    category: '${categorizeGame(game)}',
    tech_stack: [${game.tags ? game.tags.slice(0, 4).map(tag => `'${tag}'`).join(', ') : "'Solana', 'Web3'"}],
    banner_url: '${game.thumbnailUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop'}',
    logo_url: '${game.thumbnailUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=200&fit=crop'}',
    screenshot_urls: [${game.screenshots ? game.screenshots.slice(0, 3).map(url => `'${url}'`).join(', ') : `'${game.thumbnailUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop'}'`}],
    game_host_url: '${game.gameUrl}',
    github_url: '${generateGithubUrl(game.author, game.title)}',
    video_url: '',
    created_at: '${generateDate(game.index)}',
    creator_profile: { full_name: '${game.author}', avatar_url: null }
  }`).join(',\n')}
];

`;
    };

    // Save the raw data as JSON
    const jsonData = JSON.stringify(games, null, 2);
    fs.writeFileSync('scraped-games-data.json', jsonData);
    console.log('💾 Saved raw data to scraped-games-data.json');

    // Save the TypeScript code
    const tsCode = generateTypeScriptCode(games);
    fs.writeFileSync('scraped-games-code.ts', tsCode);
    console.log('💾 Saved TypeScript code to scraped-games-code.ts');

    // Display summary
    console.log('\n📊 SCRAPING SUMMARY:');
    console.log(`Total games found: ${games.length}`);
    console.log('\nFirst 5 games:');
    games.slice(0, 5).forEach((game, i) => {
      console.log(`${i + 1}. ${game.title} by ${game.author}`);
      console.log(`   URL: ${game.gameUrl}`);
      console.log(`   Description: ${(game.description || 'No description').substring(0, 100)}...`);
      console.log('');
    });

    // Generate a simple CSV for easy review
    const csvHeader = 'Index,Title,Author,URL,Description\n';
    const csvData = games.map((game, i) => 
      `${i + 1},"${game.title}","${game.author}","${game.gameUrl}","${(game.description || '').replace(/"/g, '""')}"`
    ).join('\n');
    
    fs.writeFileSync('scraped-games.csv', csvHeader + csvData);
    console.log('💾 Saved CSV summary to scraped-games.csv');

  } catch (error) {
    console.error('❌ Scraping failed:', error);
  } finally {
    await browser.close();
    console.log('✅ Browser closed. Scraping complete!');
  }
}

// Helper function to categorize games based on title/description
function categorizeGame(game) {
  const title = game.title.toLowerCase();
  const desc = (game.description || '').toLowerCase();
  const combined = `${title} ${desc}`;
  
  if (combined.includes('rpg') || combined.includes('adventure') || combined.includes('quest')) return 'RPG/MMORPG';
  if (combined.includes('puzzle') || combined.includes('2048') || combined.includes('match')) return 'Puzzle';
  if (combined.includes('strategy') || combined.includes('tower') || combined.includes('tactics')) return 'Strategy';
  if (combined.includes('action') || combined.includes('shooter') || combined.includes('arena')) return 'Action/Adventure';
  if (combined.includes('casual') || combined.includes('mobile') || combined.includes('simple')) return 'Casual/Mobile';
  if (combined.includes('education') || combined.includes('learn') || combined.includes('science')) return 'Educational';
  if (combined.includes('sport') || combined.includes('racing') || combined.includes('boxing')) return 'Sports';
  if (combined.includes('simulation') || combined.includes('business') || combined.includes('startup')) return 'Simulation';
  
  return 'Action/Adventure'; // Default
}

// Run the scraper
if (require.main === module) {
  scrapeGames().catch(console.error);
}

module.exports = { scrapeGames }; 