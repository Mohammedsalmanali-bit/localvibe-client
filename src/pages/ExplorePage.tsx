import { useState, useEffect } from "react";
import { eventsApi } from "@/services/api";
import type { Event } from "@/types";
import { useLocation } from "@/context/LocationContext";
import EventMap from "@/components/map/EventMap";
import EventFilters from "@/components/events/EventFilters";
import EventList from "@/components/events/EventList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, List } from "lucide-react";
import { toast } from "sonner";

export default function ExplorePage() {
  const { latitude, longitude } = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateRange, setDateRange] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (category && category !== "all") params.category = category;
        if (dateRange && dateRange !== "all") params.dateRange = dateRange;
        if (latitude && longitude) {
          params.lat = String(latitude);
          params.lng = String(longitude);
        }
        const res = await eventsApi.getAll(params);
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error("Failed to load events");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [search, category, dateRange, latitude, longitude]);

  const mapCenter: [number, number] = latitude && longitude
    ? [latitude, longitude]
    : [40.7128, -74.006];

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setDateRange("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Explore Events</h1>
        <p className="text-muted-foreground">
          Discover what's happening around you
        </p>
      </div>

      <div className="mb-6">
        <EventFilters
          search={search}
          category={category}
          dateRange={dateRange}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onDateRangeChange={setDateRange}
          onClear={clearFilters}
        />
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map" className="gap-2">
            <Map className="h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <EventMap
            events={events}
            center={mapCenter}
            zoom={13}
            className="h-[600px] w-full rounded-lg"
          />
          {!isLoading && events.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              Showing {events.length} event{events.length !== 1 ? "s" : ""} on the map
            </p>
          )}
        </TabsContent>

        <TabsContent value="list">
          <EventList
            events={events}
            isLoading={isLoading}
            emptyMessage="No events found in this area"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
