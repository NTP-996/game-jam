import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function makeImagesSquare() {
  console.log('🎯 FIXING RECTANGULAR IMAGES -> SQUARE FORMAT');
  console.log('Converting forced 16:9 rectangles back to natural square format...');
  
  // Get all games with their current banner URLs
  const { data: games, error } = await supabase
    .from('speedrun_2024_games')
    .select('id, name, banner_url')
    .limit(10); // Test with 10 first
  
  if (error) {
    console.error('Error fetching games:', error);
    return;
  }

  for (const game of games) {
    if (!game.banner_url) {
      console.log(`⏭️ Skipping ${game.name} - no banner URL`);
      continue;
    }

    try {
      console.log(`\n🔧 Processing: ${game.name}`);
      console.log(`   Current URL: ${game.banner_url}`);
      
      // Download the current image
      const response = await axios.get(game.banner_url, {
        responseType: 'arraybuffer',
        timeout: 15000
      });
      
      // Get image metadata
      const metadata = await sharp(Buffer.from(response.data)).metadata();
      console.log(`   Current dimensions: ${metadata.width}x${metadata.height}`);
      
      // Create a square version by cropping to the smaller dimension
      const squareSize = Math.min(metadata.width || 400, metadata.height || 400);
      
      const squareBuffer = await sharp(Buffer.from(response.data))
        .resize(squareSize, squareSize, {
          fit: 'cover',
          position: 'center'
        })
        .webp({
          quality: 90,
          effort: 4
        })
        .toBuffer();
      
      // Upload the square version
      const fileName = `square-${game.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.webp`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('game-banners')
        .upload(`speedrun-2024/${fileName}`, squareBuffer, {
          contentType: 'image/webp',
          upsert: true
        });
      
      if (uploadError) {
        console.error(`   ❌ Upload error: ${uploadError.message}`);
        continue;
      }
      
      const newImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-banners/${uploadData.path}`;
      
      // Update database with square image
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
        console.log(`   ✅ Converted to ${squareSize}x${squareSize} square!`);
        console.log(`   🆕 New URL: ${newImageUrl}`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Error processing ${game.name}:`, error);
    }
  }
  
  console.log('\n🎉 COMPLETED! Images are now properly square!');
  console.log('   ✅ Cropped rectangular images to square format');
  console.log('   ✅ Maintained image quality');
  console.log('   ✅ Updated database with new URLs');
  console.log('\nRefresh your browser to see the square images!');
}

makeImagesSquare().catch(console.error); 