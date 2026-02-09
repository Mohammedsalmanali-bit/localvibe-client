import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "@/services/api";
import type { Event } from "@/types";
import { CATEGORIES } from "@/types";
import EventList from "@/components/events/EventList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, Sparkles, CalendarDays, Compass } from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await eventsApi.getFeatured();
        setFeaturedEvents(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error("Failed to load featured events");
      } finally {
        setIsLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchUpcoming = async () => {
      setIsLoadingUpcoming(true);
      try {
        const params: Record<string, string> = {};
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        const res = await eventsApi.getAll(params);
        setUpcomingEvents(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error("Failed to load events");
      } finally {
        setIsLoadingUpcoming(false);
      }
    };
    fetchUpcoming();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/20 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Local<span className="text-primary">Vibe</span>
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover amazing events happening in your neighborhood. Connect with your community and never miss out.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/explore" className="gap-2">
                <Compass className="h-5 w-5" />
                Explore Events
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/create-event" className="gap-2">
                <CalendarDays className="h-5 w-5" />
                Host an Event
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Featured Events</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/explore" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <EventList
          events={featuredEvents}
          isLoading={isLoadingFeatured}
          emptyMessage="No featured events right now"
        />
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Browse by Category</h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge
            variant={selectedCategory === "" ? "default" : "outline"}
            className="cursor-pointer text-sm px-4 py-1.5"
            onClick={() => setSelectedCategory("")}
          >
            All
          </Badge>
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer text-sm px-4 py-1.5"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
        <EventList
          events={upcomingEvents}
          isLoading={isLoadingUpcoming}
          emptyMessage={selectedCategory ? `No ${selectedCategory} events found` : "No upcoming events"}
        />
      </section>
    </div>
  );
}
