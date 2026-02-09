import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Event } from "@/types";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface EventMapProps {
  events: Event[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function EventMap({
  events,
  center = [40.7128, -74.006],
  zoom = 13,
  className = "h-[500px] w-full rounded-lg",
}: EventMapProps) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className={`${className} bg-muted animate-pulse flex items-center justify-center`}>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer center={center} zoom={zoom} className={className} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.location.coordinates[1], event.location.coordinates[0]]}
        >
          <Popup>
            <div className="min-w-[200px] space-y-2">
              <Link to={`/events/${event.id}`} className="font-semibold text-sm hover:text-primary">
                {event.title}
              </Link>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  {event.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.startDate), "MMM d, yyyy · h:mm a")}
              </p>
              <p className="text-xs text-muted-foreground">{event.location.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
