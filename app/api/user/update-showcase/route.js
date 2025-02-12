import User from '@/models/User';
import {connectDB} from '@/db/connectDb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await connectDB();

  try {
    const { username, workShowcaseItem } = await request.json();
    console.log('Received workShowcaseItem:', workShowcaseItem);

    const user = await User.findOne({ username });

    if (!user) {
      console.error('User not found:', username);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const workShowcaseDoc = {
      type: workShowcaseItem.type,
      projectName: workShowcaseItem.projectName || '',
      url: workShowcaseItem.url,
      description: workShowcaseItem.description || ''
    };

    user.workShowcase.push(workShowcaseDoc);
    await user.save();

    console.log('Saved user workShowcase:', user.workShowcase);

    return NextResponse.json({
      success: true, 
      message: 'Showcase updated successfully',
      workShowcaseItem: workShowcaseDoc
    }, { 
      status: 200 
    });

  } catch (error) {
    console.error('Error updating showcase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}