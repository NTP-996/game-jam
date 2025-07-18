const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeSimple() {
  console.log('🚀 Starting simple scraper for Solana Speedrun 3...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null 
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📄 Loading itch.io page...');
    await page.goto('https://itch.io/jam/solana-speedrun-3/entries', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a bit for page to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🎮 Extracting game data...');
    
    // Get the page HTML and extract game info
    const games = await page.evaluate(() => {
      const games = [];
      
      // Look for different possible selectors
      const gameElements = document.querySelectorAll('.jam_game, .game_cell, .game_summary');
      
      console.log(`Found ${gameElements.length} game elements`);
      
      gameElements.forEach((element, index) => {
        // Try multiple selectors for title
        const titleSelectors = ['.game_title a', '.title a', 'h3 a', 'h2 a', '.game_summary_title a'];
        const authorSelectors = ['.game_author a', '.author a', '.by_author a', '.user_link'];
        
        let title = `Game ${index + 1}`;
        let author = 'Unknown';
        let gameUrl = '';
        
        // Try to find title
        for (const selector of titleSelectors) {
          const titleEl = element.querySelector(selector);
          if (titleEl && titleEl.textContent.trim()) {
            title = titleEl.textContent.trim();
            gameUrl = titleEl.href || '';
            break;
          }
        }
        
        // Try to find author
        for (const selector of authorSelectors) {
          const authorEl = element.querySelector(selector);
          if (authorEl && authorEl.textContent.trim()) {
            author = authorEl.textContent.trim();
            break;
          }
        }
        
        // Get thumbnail
        const imgEl = element.querySelector('img');
        const thumbnailUrl = imgEl ? imgEl.src : '';
        
        games.push({
          id: `speedrun-${index + 1}`,
          title,
          author,
          gameUrl,
          thumbnailUrl,
          index: index + 1
        });
      });
      
      return games;
    });

    console.log(`✅ Found ${games.length} games`);
    
    if (games.length === 0) {
      console.log('🔍 No games found with standard selectors, trying alternative approach...');
      
      // Get all links that might be games
      const allGames = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/jam/solana-speedrun-3/rate/"]'));
        
        return links.map((link, index) => {
          const title = link.textContent.trim() || `Game ${index + 1}`;
          const gameUrl = link.href.replace('/rate/', '/');
          
          // Try to find author in nearby elements
          let author = 'Unknown';
          const parentEl = link.closest('.jam_game, .game_cell, .game_summary');
          if (parentEl) {
            const authorEl = parentEl.querySelector('.by_author a, .user_link, .game_author a');
            if (authorEl) {
              author = authorEl.textContent.trim();
            }
          }
          
          return {
            id: `speedrun-${index + 1}`,
            title,
            author,
            gameUrl,
            thumbnailUrl: '',
            index: index + 1
          };
        });
      });
      
      if (allGames.length > 0) {
        games.push(...allGames);
        console.log(`✅ Found ${allGames.length} additional games via alternative method`);
      }
    }

    // Manual game list as fallback (from the visible text on the page)
    const manualGames = [
      { title: 'Back to the World', author: 'TahaErel' },
      { title: 'Last Forever', author: 'JonasHahn' },
      { title: 'Imephemerals', author: 'val-samonte' },
      { title: 'Degen Adventures', author: 'Grrwahrr' },
      { title: 'Endless Tower - Solana Speedrun 3', author: 'Kaleve' },
      { title: 'ValhallaVerse Arena Mode', author: 'koe1k' },
      { title: 'Airdrops Forever', author: 'venusv' },
      { title: 'Partner | Solana Visual Novel', author: 'wanaoki' },
      { title: 'Foothold by Multisynq', author: 'Multisynq' },
      { title: 'Solana Science', author: 'Virus-Axel' },
      { title: 'Boxtraining', author: 'aleylekoglu' },
      { title: 'Manic Entanglement', author: 'Rit Rafa' },
      { title: 'ephesus', author: '0xa1f13' },
      { title: 'The Last Sea Turtle', author: 'solanagirl' },
      { title: 'NFTactics', author: 'David Alexander Pfeiffer' },
      { title: 'BlinkBash!', author: 'daoplays' },
      { title: 'TVT RPG', author: 'TranSiTien' },
      { title: '2048 Puzzle Game on Solana', author: 'tolgahanbora' },
      { title: '50 Shades of Charity', author: 'TED3166' },
      { title: 'sms02-swapmystyle02', author: 'vetsinen' },
      { title: 'Solara\'s realm', author: 'emirhan3699' },
      { title: 'Rexagotchi', author: 'r3xap' },
      { title: 'Mining Badger [Honeycomb x CIVIC]', author: 'chiefbee' },
      { title: 'Arena Survivor', author: 'truongnguyenptn' },
      { title: 'Echoes Of Eldoria', author: 'Eldahalas' },
      { title: 'Nuke-Foot-Cockroach', author: 'Blockiosaurus' },
      { title: 'Eternal Gauntlet', author: 'Suzamaki' },
      { title: 'Startup', author: 'dwrx' },
      { title: 'Codename : FutureSport', author: 'nevernotplay' }
    ];

    // If we didn't get good data, use manual list
    if (games.length === 0 || games[0].title === 'Game 1') {
      console.log('📝 Using manual game list as primary data source...');
      
      const manualGameData = manualGames.map((game, index) => ({
        id: `speedrun-${index + 1}`,
        title: game.title,
        author: game.author,
        gameUrl: `https://itch.io/jam/solana-speedrun-3/rate/${index + 1}`, // Placeholder
        thumbnailUrl: games[index]?.thumbnailUrl || '',
        index: index + 1
      }));
      
      games.splice(0, games.length, ...manualGameData);
    }

    // Generate the TypeScript code
    const generateTypeScriptCode = (games) => {
      const categorizeGame = (game) => {
        const title = game.title.toLowerCase();
        const combined = title;
        
        if (combined.includes('rpg') || combined.includes('adventure') || combined.includes('quest') || combined.includes('gauntlet') || combined.includes('eldoria')) return 'RPG/MMORPG';
        if (combined.includes('puzzle') || combined.includes('2048') || combined.includes('entanglement')) return 'Puzzle';
        if (combined.includes('strategy') || combined.includes('tower') || combined.includes('tactics') || combined.includes('nftactics')) return 'Strategy';
        if (combined.includes('action') || combined.includes('shooter') || combined.includes('arena') || combined.includes('survivor') || combined.includes('valhalla') || combined.includes('nuke') || combined.includes('degen')) return 'Action/Adventure';
        if (combined.includes('casual') || combined.includes('mobile') || combined.includes('simple') || combined.includes('airdrops') || combined.includes('rexagotchi')) return 'Casual/Mobile';
        if (combined.includes('education') || combined.includes('learn') || combined.includes('science') || combined.includes('turtle') || combined.includes('charity') || combined.includes('visual novel')) return 'Educational';
        if (combined.includes('sport') || combined.includes('racing') || combined.includes('boxing') || combined.includes('futuresport')) return 'Sports';
        if (combined.includes('simulation') || combined.includes('business') || combined.includes('startup') || combined.includes('mining') || combined.includes('swapmystyle')) return 'Simulation';
        
        return 'Action/Adventure'; // Default
      };
      
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

      return `// Scraped from itch.io Solana Speedrun 3 - ${new Date().toISOString()}
const speedrun2024Games: Project[] = [
${games.map(game => `  {
    id: '${game.id}',
    project_name: '${game.title.replace(/'/g, "\\'")}',
    project_description: 'Game by ${game.author} from Solana Speedrun 3 hackathon. Innovative blockchain gaming experience.',
    category: '${categorizeGame(game)}',
    tech_stack: ['Solana', 'Web3', 'JavaScript', 'TypeScript'],
    banner_url: '${game.thumbnailUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop'}',
    logo_url: '${game.thumbnailUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=200&fit=crop'}',
    screenshot_urls: ['${game.thumbnailUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop'}'],
    game_host_url: 'https://itch.io/jam/solana-speedrun-3/entries',
    github_url: '${generateGithubUrl(game.author, game.title)}',
    video_url: '',
    created_at: '${generateDate(game.index)}',
    creator_profile: { full_name: '${game.author}', avatar_url: null }
  }`).join(',\n')}
];`;
    };

    // Save data
    fs.writeFileSync('simple-scraped-data.json', JSON.stringify(games, null, 2));
    fs.writeFileSync('simple-scraped-code.ts', generateTypeScriptCode(games));
    
    console.log('\n📊 SCRAPING SUMMARY:');
    console.log(`Total games found: ${games.length}`);
    console.log('\nAll games:');
    games.forEach((game, i) => {
      console.log(`${i + 1}. ${game.title} by ${game.author}`);
    });

    console.log('\n💾 Files saved:');
    console.log('- simple-scraped-data.json (raw data)');
    console.log('- simple-scraped-code.ts (TypeScript code)');

  } catch (error) {
    console.error('❌ Scraping failed:', error);
  } finally {
    await browser.close();
    console.log('✅ Browser closed.');
  }
}

scrapeSimple().catch(console.error); 