"use client";

import { Layout } from "@/components/Layout";
import { PropertyMapSection } from "@/components/property-map/PropertyMapSection";
import { PropertyGoogleMapSection } from "@/components/property-map/PropertyGoogleMapSection";

export default function SearchPage() {
  return (
    <Layout>
      <div className="container py-6 space-y-6">
        {/* New Google Maps Implementation */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Google Maps View</h2>
          <PropertyGoogleMapSection />
        </div>

        {/* Original Implementation */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Original Map View</h2>
          <div className="h-[500px] border rounded-lg overflow-hidden">
            <PropertyMapSection />
          </div>
        </div>
      </div>
    </Layout>
  );
} 