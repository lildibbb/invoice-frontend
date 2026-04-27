import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background mesh-gradient-bg p-6">
      <div className="animate-scale-in text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">403</h1>
        <h2 className="text-xl font-semibold text-foreground mb-3">Access Denied</h2>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <Button asChild size="lg">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
