import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const listingId = parseInt(params.id);
    if (isNaN(listingId)) {
      return NextResponse.json(
        { message: 'Invalid listing ID' },
        { status: 400 }
      );
    }
    
    // Check if listing exists
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('id')
      .eq('id', listingId)
      .single();
    
    if (!listing) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Check if already favorited
    const { data: existingFavorite } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('listing_id', listingId)
      .single();
    
    if (existingFavorite) {
      // Remove from favorites
      await supabaseAdmin
        .from('favorites')
        .delete()
        .eq('id', existingFavorite.id);
      
      return NextResponse.json(
        { message: 'Removed from favorites' }
      );
    } else {
      // Add to favorites
      await supabaseAdmin
        .from('favorites')
        .insert({
          user_id: session.user.id,
          listing_id: listingId,
        });
      
      return NextResponse.json(
        { message: 'Added to favorites' },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Favorite error:', error);
    return NextResponse.json(
      { message: 'Failed to update favorites' },
      { status: 500 }
    );
  }
}
