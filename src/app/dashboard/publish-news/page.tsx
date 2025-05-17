// src/app/dashboard/publish-news/page.tsx
"use client";

import { useState, useRef } from "react";
import { Newspaper, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/forms/RichTextEditor";
import type { Editor as TinyMCEEditor } from "tinymce";

export default function PublishNewsPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const { toast } = useToast();

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!title.trim()) {
      toast({
        title: "Title Missing",
        description: "Please enter a title for your news/blog post.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!content.trim() || content === "<p><br></p>") { // TinyMCE might add empty p tags
      toast({
        title: "Content Missing",
        description: "Please write some content for your news/blog post.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Mock submission
    console.log("Publishing News:", { title, content });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Post Submitted!",
      description: `"${title}" has been (mock) published.`,
    });

    // Clear form (optional)
    // setTitle("");
    // if (editorRef.current) {
    //   editorRef.current.setContent("");
    // }
    // setContent(""); 

    setIsLoading(false);
    // Potentially redirect or update UI
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Newspaper className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Publish News / Blog Post</h1>
      </div>
      <p className="text-muted-foreground">
        Create and publish engaging content for the chess community.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="post-title" className="text-lg">Post Title</Label>
          <Input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a catchy title"
            className="mt-1 text-base"
            required
          />
        </div>

        <div>
          <Label htmlFor="post-content" className="text-lg">Content</Label>
          <div className="mt-1 rounded-md border overflow-hidden">
            <RichTextEditor
              editorRef={editorRef}
              content={content}
              onChange={handleContentChange}
            />
          </div>
           <p className="text-sm text-muted-foreground mt-2">
            Use the rich text editor above to format your post, add images, links, and more.
          </p>
        </div>

        <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Send className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Publishing..." : "Publish Post"}
        </Button>
      </form>
    </div>
  );
}
