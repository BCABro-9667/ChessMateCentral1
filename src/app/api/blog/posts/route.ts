// src/app/api/blog/posts/route.ts
import { NextResponse } from 'next/server';
import { getBlogPostsCollection } from '@/lib/mongodb';
import type { NewBlogPost, BlogPost } from '@/types/blog';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const postsCollection = await getBlogPostsCollection();
    const postsFromDb = await postsCollection.find({}).sort({ createdAt: -1 }).toArray();
    
    const posts = postsFromDb.map(p => {
      const { _id, ...rest } = p;
      return { ...rest, id: _id.toHexString() } as BlogPost;
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return NextResponse.json({ message: 'Error fetching blog posts', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const postData = await request.json() as NewBlogPost;
    
    if (!postData.title || !postData.slug || !postData.content || !postData.category) {
        return NextResponse.json({ message: 'Missing required blog post data (title, slug, content, category)' }, { status: 400 });
    }

    // Ensure tags is an array
    const tags = Array.isArray(postData.tags) ? postData.tags : (postData.tags ? String(postData.tags).split(',').map(tag => tag.trim()).filter(tag => tag) : []);


    const newPostDocument: Omit<BlogPost, 'id'> = {
      ...postData,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const postsCollection = await getBlogPostsCollection();
    
    // Optional: Check for slug uniqueness if desired, or let database index handle it
    const existingPostBySlug = await postsCollection.findOne({ slug: newPostDocument.slug });
    if (existingPostBySlug) {
        return NextResponse.json({ message: `A post with slug "${newPostDocument.slug}" already exists. Please use a unique slug.` }, { status: 409 });
    }

    const result = await postsCollection.insertOne(newPostDocument as any); 

    if (!result.insertedId) {
        return NextResponse.json({ message: 'Failed to insert blog post into database' }, { status: 500 });
    }
    
    const createdPost: BlogPost = {
        ...newPostDocument,
        id: result.insertedId.toHexString(),
    };

    return NextResponse.json(createdPost, { status: 201 });
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return NextResponse.json({ message: 'Error creating blog post', error: (error as Error).message }, { status: 500 });
  }
}
