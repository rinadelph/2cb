"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api"
import { motion } from "framer-motion"
import { Listing } from "@/types/listing"
import { formatPrice } from "@/lib/utils"
import { getListingLocation, logLocationAttempt } from "@/lib/map-utils"

interface PropertyGoogleMapProps {
  listings?: Listing[]
  selectedListingId?: string
  onListingSelect?: (listingId: string | null) => void
}

const mapStyles = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#e9e9e9" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#c9c9c9" }]
  }
]

// Move these outside component to prevent re-renders
const defaultCenter = { lat: 25.7617, lng: -80.1918 } // Miami
const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const mapOptions = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
  backgroundColor: '#f5f5f5',
}

export function PropertyGoogleMap({ 
  listings = [], 
  selectedListingId,
  onListingSelect 
}: PropertyGoogleMapProps) {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<Listing | null>(null)
  const [locationCache, setLocationCache] = useState<Record<string, google.maps.LatLngLiteral>>({})
  const [locationErrors, setLocationErrors] = useState<Record<string, string>>({})
  const [isMapReady, setIsMapReady] = useState(false)

  // Use useCallback for map handlers
  const onLoad = useCallback((map: google.maps.Map) => {
    console.log("Map loaded")
    setMapInstance(map)
    setIsMapReady(true)
  }, [])

  const onUnmount = useCallback(() => {
    setMapInstance(null)
    setIsMapReady(false)
  }, [])

  // Only process locations when map is ready
  useEffect(() => {
    if (!isMapReady || !mapInstance || !listings.length) return

    console.log('=== Starting Batch Location Resolution ===')
    console.log('Processing listings:', listings.length)

    const resolveLocations = async () => {
      const bounds = new google.maps.LatLngBounds()
      const newLocationCache: Record<string, google.maps.LatLngLiteral> = {}
      const newLocationErrors: Record<string, string> = {}
      let successCount = 0

      for (const listing of listings) {
        try {
          console.group(`Processing listing ${listing.id}`)
          const result = await getListingLocation(listing)
          logLocationAttempt(listing, result)
          
          newLocationCache[listing.id] = result.position
          bounds.extend(result.position)
          successCount++
          
          console.log('Location cached:', {
            listingId: listing.id,
            position: result.position
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'An unknown error occurred'
            
          logLocationAttempt(listing, null, error as Error)
          newLocationErrors[listing.id] = errorMessage
        } finally {
          console.groupEnd()
        }
      }

      console.log('Batch processing complete:', {
        total: listings.length,
        successful: successCount,
        failed: Object.keys(newLocationErrors).length
      })

      setLocationCache(newLocationCache)
      setLocationErrors(newLocationErrors)

      if (successCount > 0) {
        mapInstance.fitBounds(bounds)
      }
    }

    resolveLocations()
  }, [listings, mapInstance, isMapReady])

  // Update selected marker when selectedListingId changes
  useEffect(() => {
    if (selectedListingId) {
      const listing = listings.find(l => l.id === selectedListingId)
      setSelectedMarker(listing || null)
    } else {
      setSelectedMarker(null)
    }
  }, [selectedListingId, listings])

  return (
    <div className="w-full h-full relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={12}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {isMapReady && listings.map((listing) => {
          const position = locationCache[listing.id]
          if (!position) return null

          return (
            <Marker
              key={listing.id}
              position={position}
              onClick={() => {
                setSelectedMarker(listing)
                onListingSelect?.(listing.id)
              }}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="${
                      selectedListingId === listing.id ? '#0ea5e9' : '#64748b'
                    }" stroke="white" stroke-width="2"/>
                  </svg>
                `)}`,
                scaledSize: new google.maps.Size(24, 24),
                anchor: new google.maps.Point(12, 12),
              }}
            />
          )
        })}

        {isMapReady && selectedMarker && locationCache[selectedMarker.id] && (
          <InfoWindow
            position={locationCache[selectedMarker.id]}
            onCloseClick={() => {
              setSelectedMarker(null)
              onListingSelect?.(null)
            }}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-sm">{selectedMarker.title}</h3>
              <p className="text-sm font-medium text-blue-600">
                {formatPrice(selectedMarker.price)}
              </p>
              {selectedMarker.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {selectedMarker.description}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
} 