"use client"

import { LoadScript } from '@react-google-maps/api';
import { createContext, useContext, ReactNode } from "react"

interface PropertyMapContextType {
  isLoaded: boolean
}

const PropertyMapContext = createContext<PropertyMapContextType>({
  isLoaded: false,
})

export function usePropertyMap() {
  return useContext(PropertyMapContext)
}

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"];

export function PropertyMapProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      libraries={libraries}
    >
      <PropertyMapContext.Provider value={{ isLoaded: true }}>
        {children}
      </PropertyMapContext.Provider>
    </LoadScript>
  );
} 