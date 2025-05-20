// src/app/api/blog/posts/[slug]/route.ts
import { NextResponse } from 'next/server';
import { getBlogPostsCollection } from '@/lib/mongodb';
import type { BlogPost } from '@/types/blog';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    const postsCollection = await getBlogPostsCollection();
    const postFromDb = await postsCollection.findOne({ slug });

    if (postFromDb) {
      const { _id, ...rest } = postFromDb;
      const post = { ...rest, id: _id.toHexString() } as BlogPost;
      return NextResponse.json(post);
    } else {
      return NextResponse.json({ message: 'Blog post not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to fetch blog post with slug ${params.slug}:`, error);
    return NextResponse.json({ message: 'Error fetching blog post', error: (error as Error).message }, { status: 500 });
  }
}
