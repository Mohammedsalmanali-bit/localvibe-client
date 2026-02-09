import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { Event } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Star } from "lucide-react";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const formattedDate = format(new Date(event.startDate), "EEE, MMM d · h:mm a");

  return (
    <Link to={`/events/${event.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="relative aspect-[16/9] overflow-hidden">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <CalendarDays className="h-12 w-12 text-primary/40" />
            </div>
          )}
          {event.isFeatured && (
            <Badge className="absolute top-3 left-3 gap-1">
              <Star className="h-3 w-3" />
              Featured
            </Badge>
          )}
          {event.price > 0 && (
            <Badge variant="secondary" className="absolute top-3 right-3">
              {event.currency || "$"}{event.price}
            </Badge>
          )}
          {event.price === 0 && (
            <Badge variant="secondary" className="absolute top-3 right-3">
              Free
            </Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {event.category}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{event.location.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{event.goingCount} going · {event.interestedCount} interested</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
