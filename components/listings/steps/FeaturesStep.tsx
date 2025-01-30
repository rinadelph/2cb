"use client"

import * as React from "react"
import { UseFormReturn } from 'react-hook-form';
import { ListingFormValues } from '@/schemas/listing';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  HiSearch, 
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineCog,
  HiOutlineSparkles,
  HiX,
  HiCheck,
  HiOutlineHashtag,
  HiOutlineChevronRight
} from 'react-icons/hi';
import { FEATURE_CATEGORIES, type FeatureCategory, type Feature } from '@/lib/constants/property-features';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FeaturesStepProps {
  form: UseFormReturn<ListingFormValues>;
  onNext: () => void;
}

export function FeaturesStep({ form, onNext }: FeaturesStepProps) {
  const { setValue, watch } = form;
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<FeatureCategory | 'all'>('all');
  
  // Initialize form state properly
  React.useEffect(() => {
    const currentFeatures = form.getValues('features');
    const currentAmenities = form.getValues('amenities');
    
    if (!currentFeatures || Object.keys(currentFeatures).length === 0) {
      setValue('features', {}, { shouldDirty: false });
    }
    if (!currentAmenities || Object.keys(currentAmenities).length === 0) {
      setValue('amenities', {}, { shouldDirty: false });
    }
  }, [form, setValue]);

  // Watch for changes with proper defaults
  const features = watch('features') ?? {};
  const amenities = watch('amenities') ?? {};

  // Improved toggle function with proper type checking
  const toggleFeature = React.useCallback((categoryKey: string, featureKey: string) => {
    if (categoryKey === 'amenities') {
      const newAmenities = { ...amenities };
      newAmenities[featureKey] = !amenities[featureKey];
      
      setValue('amenities', newAmenities, { 
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true 
      });
    } else {
      const newFeatures = { ...features };
      newFeatures[featureKey] = !features[featureKey];
      
      setValue('features', newFeatures, { 
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true 
      });
    }
  }, [features, amenities, setValue]);

  // Debug helper
  const isFeatureSelected = React.useCallback((categoryKey: string, featureKey: string) => {
    const isSelected = categoryKey === 'amenities' 
      ? !!amenities[featureKey] 
      : !!features[featureKey];
    
    console.log(`Checking ${categoryKey}/${featureKey}: ${isSelected}`, 
      categoryKey === 'amenities' ? amenities : features);
    
    return isSelected;
  }, [features, amenities]);

  const getCategoryIcon = (key: string) => {
    switch(key) {
      case 'interior': return HiOutlineHome;
      case 'exterior': return HiOutlineOfficeBuilding;
      case 'utilities': return HiOutlineCog;
      case 'amenities': return HiOutlineSparkles;
      default: return HiOutlineHashtag;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-2xl font-semibold tracking-tight text-foreground/90">
              Property Features & Amenities
            </h3>
            <p className="text-sm text-muted-foreground/80">
              Help buyers understand what makes your property special
            </p>
          </div>
          <div className="bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            {Object.values({ ...features, ...amenities }).filter(Boolean).length} Selected
          </div>
        </div>

        {/* Search Section */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <HiSearch className="h-4 w-4 text-muted-foreground/70" />
          </div>
          <Input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 h-11 bg-background/50 border-muted/30 focus:border-primary/50 
                     text-sm placeholder:text-muted-foreground/50"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted/50 rounded-full"
              onClick={() => setSearchTerm('')}
            >
              <HiX className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4
                      scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted/10">
          <Button
            variant={selectedCategory === 'all' ? "default" : "outline"}
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "h-9 px-4 text-sm font-medium shrink-0 transition-all duration-200",
              selectedCategory === 'all'
                ? "bg-primary/90 text-primary-foreground shadow-md"
                : "hover:bg-muted/50 border-muted/30"
            )}
          >
            All Features ({Object.values({ ...features, ...amenities }).filter(Boolean).length})
          </Button>
          {Object.entries(FEATURE_CATEGORIES).map(([key, category]) => {
            const Icon = getCategoryIcon(key);
            const count = Object.entries(category.features).filter(
              ([featureKey]) => key === 'amenities' ? amenities[featureKey] : features[featureKey]
            ).length;
            
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                onClick={() => setSelectedCategory(key as FeatureCategory)}
                className={cn(
                  "h-9 px-4 text-sm font-medium shrink-0 transition-all duration-200",
                  selectedCategory === key
                    ? "bg-primary/90 text-primary-foreground shadow-md"
                    : "hover:bg-muted/50 border-muted/30",
                  count > 0 && selectedCategory !== key && "border-primary/30"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span>{category.label}</span>
                {count > 0 && (
                  <span className={cn(
                    "ml-2 rounded-full px-1.5 py-0.5 text-xs font-medium",
                    selectedCategory === key
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary"
                  )}>
                    {count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Features Grid */}
        <motion.div 
          layout 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {Object.entries(FEATURE_CATEGORIES)
              .filter(([key]) => selectedCategory === 'all' || key === selectedCategory)
              .map(([categoryKey, category]) => {
                const categoryFeatures = Object.entries(category.features)
                  .filter(([_, label]) => 
                    label.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                if (categoryFeatures.length === 0) return null;

                return (
                  <motion.div
                    key={categoryKey}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden border-[1px] border-muted/30 bg-muted/5 h-full">
                      <div className="p-4 space-y-1">
                        {categoryFeatures.map(([featureKey, label]) => {
                          const isChecked = isFeatureSelected(categoryKey, featureKey);

                          return (
                            <motion.button
                              key={featureKey}
                              layout
                              className={cn(
                                "flex items-center w-full p-3 rounded-lg transition-all",
                                "hover:bg-muted/10 active:scale-[0.98] group",
                                isChecked && "bg-primary/10"
                              )}
                              onClick={() => {
                                console.log(`Toggling ${categoryKey}/${featureKey}`);
                                toggleFeature(categoryKey, featureKey);
                              }}
                            >
                              <div className={cn(
                                "h-5 w-5 rounded-full border flex items-center justify-center mr-3",
                                "transition-all duration-200",
                                isChecked 
                                  ? "border-primary bg-primary text-primary-foreground" 
                                  : "border-muted-foreground/30"
                              )}>
                                <HiCheck className={cn(
                                  "h-3 w-3 transition-transform duration-200",
                                  isChecked ? "scale-100" : "scale-0"
                                )} />
                              </div>
                              <span className="text-sm font-medium text-foreground/80">{label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
} 