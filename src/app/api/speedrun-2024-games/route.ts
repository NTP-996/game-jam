import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const random = searchParams.get('random') === 'true';

    let query = supabase.from('speedrun_2024_games').select('*');

    // Apply filters
    if (featured) {
      query = query.eq('is_featured', true);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,developer_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply ordering
    if (random) {
      // For random, we'll get all results and shuffle on the client side
      // since Supabase doesn't have a native RANDOM() function in the client
      query = query.limit(limit);
    } else {
      query = query
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('rating', { ascending: false })
        .order('published_date', { ascending: false })
        .limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch games', details: error.message },
        { status: 500 }
      );
    }

    // If random is requested, shuffle the results
    let games = data || [];
    if (random && games.length > 0) {
      games = games.sort(() => Math.random() - 0.5);
    }

    return NextResponse.json({
      games,
      total: games.length,
      filters: {
        category,
        search,
        featured,
        random
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint for admin operations (creating/updating games)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, gameData } = body;

    if (action === 'create') {
      const { data, error } = await supabase
        .from('speedrun_2024_games')
        .insert(gameData)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create game', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ game: data });
    }

    if (action === 'update') {
      const { id, ...updateData } = gameData;
      const { data, error } = await supabase
        .from('speedrun_2024_games')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update game', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ game: data });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 