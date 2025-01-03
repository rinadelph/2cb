import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CreateListingButton() {
  return (
    <Button asChild>
      <Link href="/listings/create">
        Create Listing
      </Link>
    </Button>
  );
} 