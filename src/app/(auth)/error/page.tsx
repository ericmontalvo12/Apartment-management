import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="bg-card border rounded-xl shadow-sm p-8 space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-xl">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Authentication error</h1>
          <p className="text-sm text-muted-foreground">
            Something went wrong during sign in. Please try again.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/auth/login">Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
