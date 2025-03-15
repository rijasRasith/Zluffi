import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const listingSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  price: z.number().positive(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  location: z.string().min(3),
  categoryId: z.number().int().positive(),
  images: z.array(z.string().url()).min(1).max(5),
});

// Get all listings (with pagination)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Get listings
    const { data: listings, error, count } = await supabaseAdmin
      .from('listings')
      .select(`
        *,
        users(name),
        categories(name),
        listing_images(image_url)
      `, { count: 'exact' })
      .eq('status', 'active')
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
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

// Create new listing
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate input
    const result = listingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { title, description, price, condition, location, categoryId, images } = result.data;
    
    // Insert listing
    const { data: listing, error } = await supabaseAdmin
      .from('listings')
      .insert({
        title,
        description,
        price,
        condition,
        location,
        category_id: categoryId,
        user_id: session.user.id,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Insert images
    const imageInserts = images.map((imageUrl, index) => ({
      listing_id: listing.id,
      image_url: imageUrl,
      order_index: index,
    }));
    
    const { error: imageError } = await supabaseAdmin
      .from('listing_images')
      .insert(imageInserts);
    
    if (imageError) {
      throw imageError;
    }
    
    return NextResponse.json(
      { message: 'Listing created successfully', id: listing.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { message: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
