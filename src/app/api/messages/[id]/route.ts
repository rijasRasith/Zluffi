import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/supabase';

// Get all messages in a conversation
export async function GET(
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
    
    const conversationId = params.id;
    const [otherUserId, listingId] = conversationId.split('_');
    
    if (!otherUserId || !listingId) {
      return NextResponse.json(
        { message: 'Invalid conversation ID' },
        { status: 400 }
      );
    }
    
    // Get all messages between the two users about the specific listing
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:sender_id(name),
        receiver:receiver_id(name)
      `)
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
      .eq('listing_id', listingId)
      .order('created_at');
    
    if (error) {
      throw error;
    }
    
    // Mark messages as read if current user is the receiver
    await supabaseAdmin
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', session.user.id)
      .eq('listing_id', listingId)
      .or(`sender_id.eq.${otherUserId}`);
    
    // Get listing details
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('title, price')
      .eq('id', listingId)
      .single();
    
    return NextResponse.json({
      messages,
      listing,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
