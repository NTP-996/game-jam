const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Load the scraped games data
const gamesData = JSON.parse(fs.readFileSync('simple-scraped-data.json', 'utf8'));

// Helper function to categorize games
function categorizeGame(game) {
  const title = game.title.toLowerCase();
  const author = game.author.toLowerCase();
  
  if (title.includes('adventure') || title.includes('world') || title.includes('quest')) return 'Adventure';
  if (title.includes('tower') || title.includes('defense') || title.includes('arena') || title.includes('battle')) return 'Strategy';
  if (title.includes('racing') || title.includes('speed') || title.includes('runner')) return 'Racing';
  if (title.includes('puzzle') || title.includes('match')) return 'Puzzle';
  if (title.includes('rpg') || title.includes('character')) return 'RPG';
  if (title.includes('shoot') || title.includes('blast') || title.includes('war')) return 'Action';
  if (title.includes('mine') || title.includes('farm') || title.includes('craft')) return 'Simulation';
  if (title.includes('card') || title.includes('poker') || title.includes('casino')) return 'Card Game';
  
  return 'Arcade';
}

// Helper function to generate Solana features based on game
function generateSolanaFeatures(game) {
  const features = ['Gaming', 'Web3'];
  const title = game.title.toLowerCase();
  
  if (title.includes('nft') || title.includes('collect')) features.push('NFTs');
  if (title.includes('token') || title.includes('coin') || title.includes('economy')) features.push('Tokens');
  if (title.includes('defi') || title.includes('stake') || title.includes('yield')) features.push('DeFi');
  if (title.includes('chain') || title.includes('onchain')) features.push('On-chain Gaming');
  
  // Add some variety
  if (Math.random() > 0.5) features.push('SPL Tokens');
  if (Math.random() > 0.7) features.push('Program Derived Addresses');
  
  return features;
}

// Helper function to generate tech stack
function generateTechStack(game) {
  const baseStack = ['Solana', 'Web3', 'JavaScript'];
  const additionalTech = ['TypeScript', 'React', 'Unity', 'Rust', 'Anchor', 'Phaser', 'Canvas API', 'WebGL'];
  
  // Add 2-3 random additional technologies
  const selectedTech = additionalTech.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
  
  return [...baseStack, ...selectedTech];
}

// Helper function to generate description
function generateDescription(game) {
  const descriptions = [
    `An innovative blockchain game submitted to Solana Speedrun 3 hackathon by ${game.author}. Experience cutting-edge Web3 gaming mechanics built on Solana.`,
    `${game.title} brings together traditional gaming and blockchain technology. Developed during the Solana Speedrun 3 hackathon, showcasing the future of decentralized gaming.`,
    `A creative submission from ${game.author} for the Solana Speedrun 3 hackathon. This game demonstrates the power of building on Solana's fast and scalable blockchain.`,
    `Built during the intense Solana Speedrun 3 hackathon, ${game.title} showcases innovative game mechanics powered by Solana blockchain technology.`,
    `${game.author}'s contribution to Solana Speedrun 3 hackathon. An exciting game that explores the intersection of gaming and decentralized finance.`,
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Helper function to generate GitHub URL
function generateGithubUrl(author, title) {
  const cleanAuthor = author.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `https://github.com/${cleanAuthor}/${cleanTitle}`;
}

// Helper function to generate proper itch.io game URL
function generateItchGameUrl(author, title) {
  const cleanAuthor = author.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTitle = title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Remove multiple consecutive hyphens
    .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
  
  return `https://${cleanAuthor}.itch.io/${cleanTitle}`;
}

// Helper function to generate published date
function generatePublishedDate(index) {
  // Generate dates from September 2024 (when the hackathon likely happened)
  const baseDate = new Date('2024-09-01');
  const randomDays = Math.floor(Math.random() * 30); // 30 days spread
  const randomHours = Math.floor(Math.random() * 24);
  const date = new Date(baseDate.getTime() + randomDays * 24 * 60 * 60 * 1000 + randomHours * 60 * 60 * 1000);
  return date.toISOString();
}

// Convert games data to database format
function convertGamesToDbFormat(games) {
  return games.map((game, index) => ({
    name: game.title,
    description: generateDescription(game),
    developer_name: game.author,
    itch_url: generateItchGameUrl(game.author, game.title),
    github_url: generateGithubUrl(game.author, game.title),
    demo_url: generateItchGameUrl(game.author, game.title), // Use proper itch.io URL as demo
    thumbnail_url: game.thumbnailUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=240&fit=crop',
    banner_url: game.thumbnailUrl ? game.thumbnailUrl.replace('/300x240', '/800x400') : 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop',
    screenshot_urls: [
      game.thumbnailUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop'
    ],
    tech_stack: generateTechStack(game),
    category: categorizeGame(game),
    tags: ['Solana', 'Web3', 'Speedrun 3', 'Hackathon', categorizeGame(game)],
    itch_id: game.id,
    published_date: generatePublishedDate(index),
    downloads_count: Math.floor(Math.random() * 1000) + 50, // Random downloads 50-1050
    rating: (Math.random() * 2 + 3).toFixed(1), // Random rating 3.0-5.0
    rating_count: Math.floor(Math.random() * 50) + 5, // Random rating count 5-55
    solana_features: generateSolanaFeatures(game),
    solana_program_ids: [], // Empty for now, could be populated later
    is_featured: index < 5, // Feature first 5 games
    display_order: index,
  }));
}

async function uploadGames() {
  try {
    console.log('🚀 Starting upload of Speedrun 2024 games...');
    
    // Convert data
    const dbGames = convertGamesToDbFormat(gamesData);
    
    console.log(`📊 Prepared ${dbGames.length} games for upload`);
    
    // First, check if table exists and is accessible
    console.log('🔍 Checking database connection...');
    const { data: testData, error: testError } = await supabase
      .from('speedrun_2024_games')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      console.log('💡 Make sure you have run the schema file first:');
      console.log('   psql -h your-db-host -U postgres -d postgres -f speedrun-2024-schema.sql');
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Clear existing data (optional - remove this if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    const { error: deleteError } = await supabase
      .from('speedrun_2024_games')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (deleteError) {
      console.log('⚠️ Warning: Could not clear existing data:', deleteError.message);
    }
    
    // Upload games in batches (Supabase has limits on bulk inserts)
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < dbGames.length; i += batchSize) {
      batches.push(dbGames.slice(i, i + batchSize));
    }
    
    console.log(`📦 Uploading ${batches.length} batches...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`   Uploading batch ${i + 1}/${batches.length} (${batch.length} games)...`);
      
      const { data, error } = await supabase
        .from('speedrun_2024_games')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`   ❌ Batch ${i + 1} failed:`, error.message);
        errorCount += batch.length;
      } else {
        console.log(`   ✅ Batch ${i + 1} uploaded successfully (${data.length} games)`);
        successCount += data.length;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📈 UPLOAD SUMMARY:');
    console.log(`✅ Successfully uploaded: ${successCount} games`);
    console.log(`❌ Failed uploads: ${errorCount} games`);
    console.log(`📊 Total processed: ${successCount + errorCount} games`);
    
    if (successCount > 0) {
      console.log('\n🎉 Upload completed! You can now use the API endpoints to fetch the data.');
      console.log('\n🔗 Next steps:');
      console.log('1. Create API endpoint: /api/speedrun-2024-games');
      console.log('2. Update your catalogue page to use the API');
      console.log('3. Test the integration');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error during upload:', error);
  }
}

// Check if the script should run
if (require.main === module) {
  // Check if data file exists
  if (!fs.existsSync('simple-scraped-data.json')) {
    console.error('❌ Data file not found. Please run the scraper first:');
    console.log('   node simple-scraper.js');
    process.exit(1);
  }
  
  uploadGames().catch(console.error);
}

module.exports = { uploadGames, convertGamesToDbFormat }; 