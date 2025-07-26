import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Get all games first, then pick random on server side
    const { data, error } = await supabase
      .from('speedrun_2024_games')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch games', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No games found' },
        { status: 404 }
      );
    }

    // Pick a random game
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomGame = data[randomIndex];

    return NextResponse.json({
      game: randomGame,
      total_games: data.length
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 