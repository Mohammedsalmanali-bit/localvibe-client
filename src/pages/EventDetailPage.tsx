import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { eventsApi, rsvpApi } from "@/services/api";
import type { Event } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EventMap from "@/components/map/EventMap";
import {
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Star,
  ArrowLeft,
  Share2,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        const res = await eventsApi.getById(id);
        setEvent(res.data);
      } catch {
        toast.error("Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRsvp = async (status: "going" | "interested") => {
    if (!isAuthenticated) {
      toast.error("Please log in to RSVP");
      return;
    }
    if (!id) return;
    setRsvpLoading(true);
    try {
      if (event?.userRsvp === status) {
        await rsvpApi.cancelRsvp(id);
        setEvent((prev) => prev ? { ...prev, userRsvp: null } : null);
        toast.success("RSVP cancelled");
      } else {
        await rsvpApi.rsvp(id, status);
        setEvent((prev) => prev ? { ...prev, userRsvp: status } : null);
        toast.success(status === "going" ? "You're going!" : "Marked as interested");
      }
    } catch {
      toast.error("Failed to update RSVP");
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-32" />
          <div className="aspect-[2/1] bg-muted rounded-xl" />
          <div className="h-10 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Event not found</h2>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6 gap-2">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <div className="relative rounded-xl overflow-hidden mb-8">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full aspect-[2/1] object-cover"
          />
        ) : (
          <div className="w-full aspect-[2/1] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <CalendarDays className="h-20 w-20 text-primary/30" />
          </div>
        )}
        {event.isFeatured && (
          <Badge className="absolute top-4 left-4 gap-1">
            <Star className="h-3 w-3" />
            Featured
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">{event.category}</Badge>
              {event.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-muted-foreground">
              Hosted by {event.organizerName || event.organizer?.name}
            </p>
          </div>

          <Separator />

          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mb-2">About this event</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Location</h3>
            <div className="flex items-start gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-muted-foreground">{event.location.address}</p>
            </div>
            <EventMap
              events={[event]}
              center={[event.location.coordinates[1], event.location.coordinates[0]]}
              zoom={15}
              className="h-[300px] w-full rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.startDate), "h:mm a")} -{" "}
                    {format(new Date(event.endDate), "h:mm a")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const diff = new Date(event.endDate).getTime() - new Date(event.startDate).getTime();
                      const hours = Math.floor(diff / 3600000);
                      const minutes = Math.floor((diff % 3600000) / 60000);
                      return `${hours}h ${minutes > 0 ? `${minutes}m` : ""} duration`;
                    })()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <p className="font-medium">
                  {event.price === 0 ? "Free" : `${event.currency || "$"}${event.price}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{event.goingCount}</span> going ·{" "}
                    <span className="font-medium">{event.interestedCount}</span> interested
                  </p>
                  {event.maxAttendees > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {event.maxAttendees - event.attendeeCount} spots remaining
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  className="w-full gap-2"
                  variant={event.userRsvp === "going" ? "secondary" : "default"}
                  onClick={() => handleRsvp("going")}
                  disabled={rsvpLoading}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {event.userRsvp === "going" ? "Going ✓" : "I'm Going"}
                </Button>
                <Button
                  className="w-full gap-2"
                  variant={event.userRsvp === "interested" ? "secondary" : "outline"}
                  onClick={() => handleRsvp("interested")}
                  disabled={rsvpLoading}
                >
                  <Heart className="h-4 w-4" />
                  {event.userRsvp === "interested" ? "Interested ✓" : "Interested"}
                </Button>
              </div>

              <Button variant="ghost" className="w-full gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share Event
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Organizer</h3>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {(event.organizerName || event.organizer?.name || "O").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{event.organizerName || event.organizer?.name}</p>
                  <p className="text-sm text-muted-foreground">Event Organizer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
