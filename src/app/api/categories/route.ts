import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentOnly = searchParams.get('parentOnly') === 'true';
    
    let query = supabaseAdmin
      .from('categories')
      .select('*')
      .order('id');
    
    if (parentOnly) {
      query = query.is('parent_id', null);
    }
    
    const { data: categories, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
