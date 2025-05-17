import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Crown, Users, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <Crown className="w-24 h-24 text-primary mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Welcome to Chessmate Central
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              The ultimate platform for organizing and managing chess tournaments with unparalleled ease and sophistication.
            </p>
            <div className="space-x-4">
              <Button size="lg" asChild>
                <Link href="/login">Organizer Login</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/tournaments/example-public-tournament">View Example Tournament</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Why Choose Chessmate Central?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <CardTitle>Effortless Organization</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Streamline tournament creation, player registration, and results management all in one place.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <CardTitle>AI-Powered Descriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Generate captivating tournament descriptions instantly with our intelligent AI assistant.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full mb-4">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <CardTitle>Public Showcase</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Beautifully designed public pages to display tournament details and attract participants.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Image section */}
        <section className="py-16 bg-secondary/50">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Visualize Your Victory</h2>
                <Image 
                    src="https://placehold.co/1200x600.png" 
                    alt="Chess Tournament"
                    data-ai-hint="chess game" 
                    width={1200} 
                    height={600} 
                    className="rounded-lg shadow-2xl mx-auto"
                />
            </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-card border-t border-border">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} Chessmate Central. All rights reserved.
          </div>
        </footer>
      </main>
    </>
  );
}
