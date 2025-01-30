"use client";

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { GoogleMap } from "@/components/map/GoogleMap";
import { ListingCard } from "@/components/listings/ListingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GoogleMapsProvider } from "@/lib/contexts/GoogleMapsContext";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [propertyType, setPropertyType] = useState<string>();
  const [bedrooms, setBedrooms] = useState<string>();
  const [bathrooms, setBathrooms] = useState<string>();
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Search Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex items-center gap-4 h-16">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Search Filters</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] px-1">
                    <div className="space-y-6 py-4">
                      {/* Price Range */}
                      <div className="space-y-2">
                        <Label>Price Range</Label>
                        <Slider
                          min={0}
                          max={1000000}
                          step={10000}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>${priceRange[0].toLocaleString()}</span>
                          <span>${priceRange[1].toLocaleString()}</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Property Type */}
                      <div className="space-y-2">
                        <Label>Property Type</Label>
                        <Select value={propertyType} onValueChange={setPropertyType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single_family">Single Family</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="multi_family">Multi Family</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Bedrooms */}
                      <div className="space-y-2">
                        <Label>Bedrooms</Label>
                        <Select value={bedrooms} onValueChange={setBedrooms}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Bathrooms */}
                      <div className="space-y-2">
                        <Label>Bathrooms</Label>
                        <Select value={bathrooms} onValueChange={setBathrooms}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      {/* Additional Filters */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="verified">Verified listings only</Label>
                          <Switch
                            id="verified"
                            checked={showVerifiedOnly}
                            onCheckedChange={setShowVerifiedOnly}
                          />
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <SheetFooter className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPriceRange([0, 1000000]);
                        setPropertyType(undefined);
                        setBedrooms(undefined);
                        setBathrooms(undefined);
                        setShowVerifiedOnly(false);
                      }}
                    >
                      Reset Filters
                    </Button>
                    <Button>Apply Filters</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Map and Listings Container */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr,400px] overflow-hidden">
          {/* Map */}
          <GoogleMapsProvider>
            <div className="relative h-full">
              <GoogleMap />
            </div>
          </GoogleMapsProvider>

          {/* Listings Panel */}
          <div className="hidden lg:block border-l bg-background overflow-y-auto">
            <ScrollArea className="h-full">
              <div className="p-4">
                <h2 className="font-semibold mb-4">Properties</h2>
                <div className="space-y-4">
                  {/* Add ListingCard components here */}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </Layout>
  );
} 