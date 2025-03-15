import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = parseInt(params.id);
    if (isNaN(listingId)) {
      return NextResponse.json(
        { message: 'Invalid listing ID' },
        { status: 400 }
      );
    }
    
    // Get listing details
    const { data: listing, error } = await supabaseAdmin
      .from('listings')
      .select(`
        *,
        users(id, name),
        categories(name)
      `)
      .eq('id', listingId)
      .eq('status', 'active')
      .single();
    
    if (error || !listing) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Get listing images
    const { data: images } = await supabaseAdmin
      .from('listing_images')
      .select('image_url')
      .eq('listing_id', listingId)
      .order('order_index');
    
    // Increment view count
    await supabaseAdmin
      .from('listings')
      .update({ views: listing.views + 1 })
      .eq('id', listingId);
    
    // Format the response
    const formattedListing = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      condition: listing.condition,
      location: listing.location,
      category_name: listing.categories?.name,
      seller_id: listing.users?.id,
      seller_name: listing.users?.name,
      created_at: listing.created_at,
      views: listing.views + 1,
      images: images?.map(img => img.image_url) || [],
    };
    
    return NextResponse.json(formattedListing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { message: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}
