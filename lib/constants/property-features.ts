import {
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineWifi,
  HiOutlineFire,
  HiOutlineCube,
  HiOutlineKey,
  HiOutlineCog,
  HiOutlineSparkles,
} from 'react-icons/hi';

export const FEATURE_CATEGORIES = {
  interior: {
    label: 'Interior Features',
    icon: HiOutlineHome,
    features: {
      hardwood_floors: 'Hardwood Floors',
      granite_countertops: 'Granite Countertops',
      stainless_steel_appliances: 'Stainless Steel Appliances',
      central_air: 'Central Air',
      fireplace: 'Fireplace',
      walk_in_closet: 'Walk-in Closet',
      high_ceilings: 'High Ceilings',
    }
  },
  exterior: {
    label: 'Exterior Features',
    icon: HiOutlineOfficeBuilding,
    features: {
      pool: 'Pool',
      patio: 'Patio/Deck',
      fenced_yard: 'Fenced Yard',
      garage: 'Garage',
      garden: 'Garden',
      view: 'View',
    }
  },
  utilities: {
    label: 'Utilities & Systems',
    icon: HiOutlineCog,
    features: {
      solar_panels: 'Solar Panels',
      smart_thermostat: 'Smart Thermostat',
      security_system: 'Security System',
      water_filtration: 'Water Filtration',
      generator: 'Generator',
    }
  },
  amenities: {
    label: 'Community Amenities',
    icon: HiOutlineSparkles,
    features: {
      gym: 'Fitness Center',
      pool: 'Community Pool',
      clubhouse: 'Clubhouse',
      tennis: 'Tennis Courts',
      playground: 'Playground',
      gated: 'Gated Community',
    }
  }
} as const;

export type FeatureCategory = keyof typeof FEATURE_CATEGORIES;
export type Feature = {
  [K in FeatureCategory]: keyof typeof FEATURE_CATEGORIES[K]['features'];
}[FeatureCategory]; 