import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { rsvpApi } from "@/services/api";
import type { Event } from "@/types";
import EventList from "@/components/events/EventList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CalendarDays, Heart, LogOut, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [rsvpEvents, setRsvpEvents] = useState<Event[]>([]);
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchRsvps = async () => {
      try {
        const res = await rsvpApi.getMyRsvps();
        setRsvpEvents(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error("Failed to load your RSVPs");
      } finally {
        setIsLoadingRsvps(false);
      }
    };
    fetchRsvps();
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const goingEvents = rsvpEvents.filter((e) => e.userRsvp === "going");
  const interestedEvents = rsvpEvents.filter((e) => e.userRsvp === "interested");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                  </span>
                )}
              </div>
              {user.isOrganizer && (
                <span className="inline-flex items-center gap-1 mt-2 text-sm text-primary font-medium">
                  <User className="h-4 w-4" />
                  Event Organizer
                </span>
              )}
            </div>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="going">
        <TabsList className="mb-6">
          <TabsTrigger value="going" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Going ({goingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="interested" className="gap-2">
            <Heart className="h-4 w-4" />
            Interested ({interestedEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="going">
          <EventList
            events={goingEvents}
            isLoading={isLoadingRsvps}
            emptyMessage="No events you're going to yet"
          />
        </TabsContent>

        <TabsContent value="interested">
          <EventList
            events={interestedEvents}
            isLoading={isLoadingRsvps}
            emptyMessage="No events you're interested in yet"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
