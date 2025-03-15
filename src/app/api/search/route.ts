import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000000');
    const condition = searchParams.get('condition') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Build query
    let supabaseQuery = supabaseAdmin
      .from('listings')
      .select(`
        *,
        users(name),
        categories(name),
        listing_images(image_url)
      `, { count: 'exact' })
      .eq('status', 'active')
      .gte('price', minPrice)
      .lte('price', maxPrice);
    
    // Add filters
    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    
    if (category) {
      supabaseQuery = supabaseQuery.eq('categories.slug', category);
    }
    
    if (location) {
      supabaseQuery = supabaseQuery.ilike('location', `%${location}%`);
    }
    
    if (condition) {
      supabaseQuery = supabaseQuery.eq('condition', condition);
    }
    
    // Execute query with pagination
    const { data: listings, error, count } = await supabaseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw error;
    }
    
    // Format the response
    const formattedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      condition: listing.condition,
      location: listing.location,
      created_at: listing.created_at,
      seller_name: listing.users?.name,
      category_name: listing.categories?.name,
      image_url: listing.listing_images?.[0]?.image_url,
    }));
    
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      listings: formattedListings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error searching listings:', error);
    return NextResponse.json(
      { message: 'Failed to search listings' },
      { status: 500 }
    );
  }
}
