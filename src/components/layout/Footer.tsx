import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">LocalVibe</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover amazing local events happening in your neighborhood.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Explore</h4>
            <div className="space-y-2">
              <Link to="/explore" className="block text-sm text-muted-foreground hover:text-foreground">
                Map View
              </Link>
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground">
                Featured Events
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">For Organizers</h4>
            <div className="space-y-2">
              <Link to="/create-event" className="block text-sm text-muted-foreground hover:text-foreground">
                Create Event
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Account</h4>
            <div className="space-y-2">
              <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground">
                Log in
              </Link>
              <Link to="/register" className="block text-sm text-muted-foreground hover:text-foreground">
                Sign up
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LocalVibe. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-primary fill-primary" /> for local communities
          </p>
        </div>
      </div>
    </footer>
  );
}
