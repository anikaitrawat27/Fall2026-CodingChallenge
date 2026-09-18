import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/Button";

export function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <EmptyState
        icon={<Compass size={32} />}
        title="Page not found"
        message="That link doesn't lead anywhere in Pinboard."
        action={
          <Link to="/">
            <Button>Back to your boards</Button>
          </Link>
        }
      />
    </div>
  );
}
