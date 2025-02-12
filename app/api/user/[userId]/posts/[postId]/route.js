import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/db/connectToDb';


export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { userId, postId } = params; 


    if (!userId || !postId) {
      return NextResponse.json({ error: 'User ID and Post ID are required' }, { status: 400 });
    }


    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) }, 
      { $pull: { workShowcase: { _id: new ObjectId(postId) } } } 
    );



    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Post not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 });
  }
}