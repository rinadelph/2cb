export interface MapLocation {
  lat: number;
  lng: number;
}

export interface MapBounds {
  ne: MapLocation;
  sw: MapLocation;
}

export interface MapViewport {
  center: MapLocation;
  zoom: number;
  bounds?: MapBounds;
} 