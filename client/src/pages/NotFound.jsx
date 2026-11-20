import { Link } from "react-router-dom";
import Button, { ArrowIcon } from "../components/ui/Button";
import { LogoMark } from "../components/ui/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <LogoMark size={36} className="mx-auto" />
        <p className="eyebrow mt-8">Error 404</p>
        <h1 className="display mt-3 text-6xl sm:text-7xl">
          This pixel <em>isn't lit</em>.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-muted">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link to="/" className="mt-8 inline-block">
          <Button variant="outline">Back home <ArrowIcon /></Button>
        </Link>
      </div>
    </main>
  );
}
