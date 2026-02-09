import type { Event } from "@/types";
import EventCard from "./EventCard";
import { CalendarDays } from "lucide-react";

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  emptyMessage?: string;
}

export default function EventList({ events, isLoading, emptyMessage = "No events found" }: EventListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card animate-pulse">
            <div className="aspect-[16/9] bg-muted rounded-t-xl" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarDays className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">{emptyMessage}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Check back later or try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
