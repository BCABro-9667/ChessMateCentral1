// src/app/blog/[slug]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import type { BlogPost } from '@/types/blog';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TagsIcon, UserCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const { getBlogPostBySlug, isLoadingBlogPosts, errorBlogPosts } = useBlogPosts();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined); // undefined for initial loading state

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        const fetchedPost = await getBlogPostBySlug(slug);
        setPost(fetchedPost);
      };
      fetchPost();
    }
  }, [slug, getBlogPostBySlug]);

  if (isLoadingBlogPosts || post === undefined) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-10 max-w-4xl">
          <Skeleton className="h-10 w-3/4 mb-4" /> {/* Title */}
          <Skeleton className="h-6 w-1/2 mb-6" /> {/* Meta */}
          <Skeleton className="w-full h-72 md:h-96 mb-8 rounded-lg" /> {/* Image */}
          <div className="space-y-4"> {/* Content */}
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </main>
      </>
    );
  }

  if (post === null && !isLoadingBlogPosts) { 
    notFound();
  }
  
  if (errorBlogPosts && !post) {
      return (
           <>
            <Header />
            <main className="container mx-auto px-4 py-10 text-center">
                <h1 className="text-2xl font-bold text-destructive mb-4">Error loading post</h1>
                <p className="text-muted-foreground mb-6">{errorBlogPosts}</p>
                <Button asChild variant="outline">
                    <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
                </Button>
            </main>
           </>
      )
  }

  if (!post) {
     return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-10 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p>Loading post data...</p>
        </main>
      </>
    );
  }

  const coverImageSrc = post.imageUrl || `https://placehold.co/1200x600.png`;

  return (
    <>
      <Header />
      <main className="flex-grow bg-background py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="bg-card shadow-xl rounded-lg overflow-hidden">
            {post.imageUrl && (
              <div className="relative h-72 md:h-96 w-full">
                <Image
                  src={coverImageSrc}
                  alt={post.title}
                  fill
                  style={{objectFit:"cover"}}
                  className="bg-muted"
                  data-ai-hint="article cover"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.srcset = `https://placehold.co/1200x600.png`;
                    target.src = `https://placehold.co/1200x600.png`;
                  }}
                />
              </div>
            )}
            <div className="p-6 md:p-10">
              <header className="mb-8">
                <div className="mb-4">
                  <Badge variant="default">{post.category}</Badge>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-1">
                  <div className="flex items-center">
                    <UserCircle className="w-4 h-4 mr-1.5" />
                    <span>By Chessmate Admin</span> {/* Placeholder author */}
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1.5" />
                    <span>Published on {format(new Date(post.createdAt), 'MMMM dd, yyyy')}</span>
                  </div>
                </div>
                 {post.tags && post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <TagsIcon className="w-4 h-4 text-muted-foreground" />
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </header>

              {/* Render plain text content, respecting newlines */}
              <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-line">
                {post.content}
              </div>
              
              <div className="mt-12 border-t pt-8">
                 <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                 </Button>
              </div>

            </div>
          </article>
        </div>
      </main>
       <footer className="py-8 bg-card border-t border-border mt-auto">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} Chessmate Central. All rights reserved.
          </div>
        </footer>
    </>
  );
}
