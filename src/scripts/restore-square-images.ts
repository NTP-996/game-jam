import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function restoreSquareImages() {
  console.log('🔧 FIXING THE RECTANGLE PROBLEM!');
  console.log('Images were forced into 16:9 aspect ratio - restoring natural square format...');
  
  // Get all games
  const { data: games, error } = await supabase
    .from('speedrun_2024_games')
    .select('id, name, banner_url')
    .limit(5); // Test with 5 first
  
  if (error) {
    console.error('Error fetching games:', error);
    return;
  }

  for (const game of games) {
    try {
      console.log(`\n📸 Processing: ${game.name}`);
      
      // Try to get original image from DoraHacks (not the processed one)
      const originalUrl = game.banner_url?.replace('/optimized-', '/original-') || 
                         game.banner_url?.replace('optimized-', '') ||
                         game.banner_url;
      
      console.log(`   Original URL: ${originalUrl}`);
      
      // Download the image
      const response = await axios.get(originalUrl, {
        responseType: 'arraybuffer',
        timeout: 10000
      });
      
      // Process image while MAINTAINING aspect ratio
      const processedBuffer = await sharp(Buffer.from(response.data))
        .resize(400, 400, {
          fit: 'inside', // This maintains aspect ratio!
          withoutEnlargement: true
        })
        .webp({
          quality: 90,
          effort: 4
        })
        .toBuffer();
      
      // Upload to supabase
      const fileName = `square-${game.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.webp`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('game-banners')
        .upload(`speedrun-2024/${fileName}`, processedBuffer, {
          contentType: 'image/webp',
          upsert: true
        });
      
      if (uploadError) {
        console.error(`   ❌ Upload error: ${uploadError.message}`);
        continue;
      }
      
      const newImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-banners/${uploadData.path}`;
      
      // Update database
      const { error: updateError } = await supabase
        .from('speedrun_2024_games')
        .update({ 
          banner_url: newImageUrl,
          thumbnail_url: newImageUrl 
        })
        .eq('id', game.id);
      
      if (updateError) {
        console.error(`   ❌ Database update error: ${updateError.message}`);
      } else {
        console.log(`   ✅ Restored square aspect ratio!`);
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ Error processing ${game.name}:`, error);
    }
  }
  
  console.log('\n🎯 DONE! Images should now display in their natural square format!');
  console.log('   - Removed forced 16:9 aspect ratio');
  console.log('   - Maintained original proportions');
  console.log('   - Converted to WebP for optimization');
}

restoreSquareImages().catch(console.error); 