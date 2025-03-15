import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const messageSchema = z.object({
  receiverId: z.string().uuid(),
  listingId: z.number().int().positive(),
  content: z.string().min(1).max(1000),
});

// Get all conversations for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all conversations where the user is either sender or receiver
    const { data: conversations, error } = await supabaseAdmin.rpc('get_user_conversations', {
      user_id: session.user.id
    });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { message: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// Send a new message
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
    const result = messageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { receiverId, listingId, content } = result.data;
    
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
    
    // Check if receiver exists
    const { data: receiver } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', receiverId)
      .single();
    
    if (!receiver) {
      return NextResponse.json(
        { message: 'Receiver not found' },
        { status: 404 }
      );
    }
    
    // Create message
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({
        sender_id: session.user.id,
        receiver_id: receiverId,
        listing_id: listingId,
        content,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(
      { message: 'Message sent successfully', id: message.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
