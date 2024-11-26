"use client"

import { Layout } from "@/components/Layout";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ImageUpload } from "@/components/listings/image-upload";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Building2, DollarSign, MapPin, Home, ListPlus, Image, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressIndicator } from "@/components/listings/progress-indicator";
import { FormValidationSummary } from "@/components/listings/form-validation-summary";
import { FormError } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";
import { listingSchema, type ListingFormValues } from "@/lib/schemas/listing-schema";
import { createListing } from "@/lib/services/listings";
import { TEST_LISTING_DATA } from "@/lib/services/listings";
import { saveTestListingLocally } from "@/lib/services/listings";

// Add these constants at the top of the file
const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family Home' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'multi_family', label: 'Multi-Family' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' }
] as const;

const LISTING_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'sold', label: 'Sold' },
  { value: 'archived', label: 'Archived' }
] as const;

export default function CreateListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  const [formProgress, setFormProgress] = useState({
    basic: false,
    location: false,
    details: false,
    features: false,
    media: false
  });

  // Add authentication check
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a listing",
        variant: "destructive"
      });
      router.push('/login');
    }
  }, [user, router, toast]);

  // If not authenticated, show loading or redirect
  if (!user) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      // Basic Information
      title: "",
      description: "",
      mls_number: "",
      status: "draft",
      
      // Location
      address_street: "",
      address_unit: "",
      city: "",
      state: "",
      zip_code: "",
      county: "",
      folio_number: "",
      parcel_number: "",
      legal_description: "",
      
      // Property Details
      property_type: "single_family",
      year_built: "",
      bedrooms: "",
      bathrooms_full: "",
      bathrooms_half: "",
      square_feet_living: "",
      square_feet_total: "",
      lot_size_sf: "",
      garage_spaces: "",
      carport_spaces: "",
      
      // Features
      furnished: false,
      pool: false,
      waterfront: false,
      water_access: false,
      construction_type: [],
      interior_features: [],
      exterior_features: [],
      parking_description: [],
      lot_description: [],
      
      // Financial
      price: "",
      tax_amount: "",
      tax_year: "",
      maintenance_fee: "",
      special_assessment: false,
      
      // Media & Marketing
      images: [],
      virtual_tour_url: "",
      broker_remarks: "",
      showing_instructions: "",
      
      // Agent Information
      listing_office: "",
      listing_agent_name: "",
      listing_agent_phone: "",
      listing_agent_email: "",
      listing_agent_license: ""
    }
  });

  // Add validation tracking
  const [validationState, setValidationState] = useState({
    basic: { isValid: false, errors: [] },
    location: { isValid: false, errors: [] },
    details: { isValid: false, errors: [] },
    features: { isValid: false, errors: [] },
    media: { isValid: false, errors: [] },
  });

  // Track completed fields
  const completedFields = Object.entries(form.getValues())
    .filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return true;
      return value !== '' && value !== undefined && value !== null;
    })
    .map(([key]) => key);

  // Enhanced validation function
  const validateTab = async (tab: string): Promise<boolean> => {
    const fieldsToValidate = {
      basic: ["title", "description", "price", "property_type"],
      location: ["address_street", "city", "state", "zip_code"],
      details: ["bedrooms", "bathrooms_full", "square_feet_living"],
      features: ["construction_type", "interior_features"],
      media: ["images", "listing_office", "listing_agent_name"],
    }[tab];

    const result = await form.trigger(fieldsToValidate);
    
    // Get errors for this tab's fields
    const errors = Object.entries(form.formState.errors)
      .filter(([key]) => fieldsToValidate.includes(key))
      .map(([key, error]) => ({
        field: key,
        message: error.message as string,
      }));

    setValidationState(prev => ({
      ...prev,
      [tab]: { isValid: result, errors },
    }));

    return result;
  };

  // Enhanced tab change handler
  const handleTabChange = async (tab: string) => {
    const isValid = await validateTab(currentTab);
    
    if (!isValid) {
      toast({
        title: "Please fix the errors",
        description: "Complete all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    setFormProgress(prev => ({
      ...prev,
      [currentTab]: true
    }));
    setCurrentTab(tab);
  };

  // Update onSubmit to validate all tabs
  const onSubmit = async (data: ListingFormValues) => {
    try {
      setIsSubmitting(true);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Create the listing
      const { listing, error: listingError } = await createListing(data, user.id);

      if (listingError) throw listingError;

      toast({
        title: "Success!",
        description: "Your listing has been created.",
      });

      // Redirect to the listing page
      router.push(`/listings/${listing.id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation buttons
  const handleNext = async () => {
    const tabs = ["basic", "location", "details", "features", "media"];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      await handleTabChange(tabs[currentIndex + 1]);
    } else {
      // On last tab, trigger form submission
      form.handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    const tabs = ["basic", "location", "details", "features", "media"];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  // Add test data function
  const handleCreateTestListing = async () => {
    try {
      if (!user?.id) {
        toast({
          title: "Error",
          description: "Please sign in to create a listing",
          variant: "destructive"
        });
        router.push('/login');
        return;
      }

      setIsSubmitting(true);
      
      // Save test listing locally instead of to database
      const { listing, error } = saveTestListingLocally(user.id);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Test listing saved locally",
      });

      // Redirect to the listings page
      router.push('/listings');
    } catch (error) {
      console.error('Error creating test listing:', error);
      toast({
        title: "Error",
        description: "Failed to create test listing",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Listing
            </h1>
            <p className="text-muted-foreground">
              Fill in the details below to create your property listing.
            </p>
          </div>

          {/* Add test data button */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              onClick={handleCreateTestListing}
              disabled={isSubmitting}
              variant="outline"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Test...
                </>
              ) : (
                "Create Test Listing"
              )}
            </Button>
          )}
        </div>

        {/* Form Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="space-y-8">
              <TabsList className="grid w-full grid-cols-5 gap-4 bg-transparent p-0 mb-8">
                {['basic', 'location', 'details', 'features', 'media'].map((step, index) => (
                  <motion.div
                    key={step}
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                  >
                    <TabsTrigger
                      value={step}
                      className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
                    >
                      <div className="flex flex-col items-center space-y-2 py-4">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {index === 0 && <Building2 className="w-4 h-4" />}
                          {index === 1 && <MapPin className="w-4 h-4" />}
                          {index === 2 && <Home className="w-4 h-4" />}
                          {index === 3 && <ListPlus className="w-4 h-4" />}
                          {index === 4 && <Image className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium capitalize">
                          {step}
                        </span>
                      </div>
                    </TabsTrigger>
                    {index < 4 && (
                      <div className="absolute top-1/2 -right-2 w-4 h-0.5 bg-muted" />
                    )}
                  </motion.div>
                ))}
              </TabsList>

              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Essential details about the property listing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Title and MLS Number */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Luxury Apartment in Downtown" 
                                {...field}
                                className={cn(
                                  "h-12",
                                  form.formState.errors.title && "border-destructive"
                                )}
                              />
                            </FormControl>
                            <FormDescription>
                              Create a descriptive title for your listing
                            </FormDescription>
                            {form.formState.errors.title && (
                              <FormError message={form.formState.errors.title.message} />
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mls_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MLS Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="A11612628"
                                className="h-12 font-mono"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Multiple Listing Service reference number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Price and Status */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  type="number"
                                  placeholder="1565000"
                                  className="pl-10 h-12 font-mono"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Enter the listing price without commas or decimals
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Listing Status</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LISTING_STATUSES.map(status => (
                                  <SelectItem 
                                    key={status.value} 
                                    value={status.value}
                                    className={cn(
                                      "cursor-pointer",
                                      status.value === 'active' && "text-green-600",
                                      status.value === 'pending' && "text-yellow-600",
                                      status.value === 'sold' && "text-blue-600",
                                      status.value === 'archived' && "text-gray-600"
                                    )}
                                  >
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Current status of the listing
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Property Type */}
                    <FormField
                      control={form.control}
                      name="property_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PROPERTY_TYPES.map(type => (
                                <SelectItem 
                                  key={type.value} 
                                  value={type.value}
                                >
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Type of property being listed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Welcome to East Shenandoah's most beautiful and cozy home. This meticulous property offers..."
                              className="min-h-[150px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a detailed description of the property
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Location</CardTitle>
                    <CardDescription>
                      Enter the property&apos;s location details and identifiers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Primary Location Information */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="address_street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="1227 SW 21st Ter"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address_unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit/Apt (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Unit 4B"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* City, State, ZIP */}
                    <div className="grid gap-6 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="MIAMI"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="FL"
                                maxLength={2}
                                className="h-12 uppercase"
                                {...field}
                                onChange={e => field.onChange(e.target.value.toUpperCase())}
                              />
                            </FormControl>
                            <FormDescription>
                              2-letter state code
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zip_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="33145"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Property Identifiers */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="folio_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Folio Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="0141390073710"
                                className="h-12 font-mono"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              County property identifier
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parcel_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parcel Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="3710"
                                className="h-12 font-mono"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Legal Description */}
                    <FormField
                      control={form.control}
                      name="legal_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="EAST SHENANDOAH PB 14-55 LOT 24 BLK 69 LOT SIZE 57.000 X 104 OR 12825-2194 0386"
                              className="min-h-[100px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Official property legal description
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                    <CardDescription>
                      Enter the property specifications and measurements.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Property Specifications */}
                    <div className="grid gap-6 md:grid-cols-4">
                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bedrooms</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                placeholder="3"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bathrooms_full"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Baths</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                placeholder="2"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bathrooms_half"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Half Baths</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                placeholder="1"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="year_built"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Built</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="1800"
                                max={new Date().getFullYear()}
                                placeholder="1938"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Square Footage */}
                    <div className="grid gap-6 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="square_feet_living"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Living Area (sq ft)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                placeholder="1,912"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Total living area square footage
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="square_feet_total"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Area (sq ft)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                placeholder="2,500"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Total property square footage
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lot_size_sf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lot Size (sq ft)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                placeholder="5,928"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Total lot square footage
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Parking */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="garage_spaces"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Garage Spaces</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                placeholder="2"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="carport_spaces"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carport Spaces</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                placeholder="0"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Property Features */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="furnished"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Furnished</FormLabel>
                              <FormDescription>
                                Property comes furnished
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pool"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Pool</FormLabel>
                              <FormDescription>
                                Property includes a pool
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features">
                <Card>
                  <CardHeader>
                    <CardTitle>Features & Amenities</CardTitle>
                    <CardDescription>
                      Specify the property&apos;s features, construction details, and amenities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Construction Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Construction Details</h3>
                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="construction_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Construction Type</FormLabel>
                              <FormControl>
                                <Select 
                                  onValueChange={(value) => field.onChange([...field.value, value])}
                                  value={field.value?.[0]}
                                >
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select construction type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="concrete_block">Concrete Block</SelectItem>
                                    <SelectItem value="wood_frame">Wood Frame</SelectItem>
                                    <SelectItem value="steel_frame">Steel Frame</SelectItem>
                                    <SelectItem value="brick">Brick</SelectItem>
                                    <SelectItem value="elevated">Elevated</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="year_built"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year Built</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="1938"
                                  className="h-12"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Property Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Property Features</h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="furnished"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Furnished</FormLabel>
                                <FormDescription>
                                  Property comes furnished
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="waterfront"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Waterfront</FormLabel>
                                <FormDescription>
                                  Property has water frontage
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pool"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Pool</FormLabel>
                                <FormDescription>
                                  Property includes a pool
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Interior Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Interior Features</h3>
                      <FormField
                        control={form.control}
                        name="interior_features"
                        render={({ field }) => (
                          <FormItem>
                            <div className="grid gap-4 md:grid-cols-3">
                              {[
                                'Walk-in Closets',
                                'Built-ins',
                                'First Floor Entry',
                                'Dual Sinks',
                                'Separate Tub & Shower',
                                'Family Room',
                                'Breakfast Area',
                                'Formal Dining',
                                'Snack Bar/Counter'
                              ].map((feature) => (
                                <FormItem
                                  key={feature}
                                  className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(feature)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value || [], feature])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== feature) || []
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {feature}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Exterior Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Exterior Features</h3>
                      <FormField
                        control={form.control}
                        name="exterior_features"
                        render={({ field }) => (
                          <FormItem>
                            <div className="grid gap-4 md:grid-cols-3">
                              {[
                                'Exterior Lighting',
                                'Fence',
                                'High Impact Doors',
                                'Patio',
                                'Room For Pool',
                                'Storm Protection',
                                'High Impact Windows',
                                'Green Energy Features'
                              ].map((feature) => (
                                <FormItem
                                  key={feature}
                                  className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(feature)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value || [], feature])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== feature) || []
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {feature}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media">
                <Card>
                  <CardHeader>
                    <CardTitle>Media & Marketing</CardTitle>
                    <CardDescription>
                      Add images and virtual tour information for your listing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Images Upload */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Property Images</h3>
                      <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                onRemove={(url) => {
                                  field.onChange(field.value.filter((val) => val !== url));
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Upload high-quality images of your property. First image will be used as the main photo.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Virtual Tour */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Virtual Tour</h3>
                      <FormField
                        control={form.control}
                        name="virtual_tour_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Virtual Tour URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://my-virtual-tour.com/property"
                                className="h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Add a link to your virtual tour or 3D walkthrough
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Marketing Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Marketing Details</h3>
                      <FormField
                        control={form.control}
                        name="broker_remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Broker Remarks</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional information for other brokers..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Notes visible only to other brokers
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="showing_instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Showing Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Instructions for showing the property..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Provide instructions for property showings
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Agent Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Agent Information</h3>
                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="listing_office"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Listing Office</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Reid Advisors, LLC"
                                  className="h-12"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="listing_agent_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Agent Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John Doe"
                                  className="h-12"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="listing_agent_phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Agent Phone</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="786-339-7660"
                                  className="h-12"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="listing_agent_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Agent Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="agent@example.com"
                                  className="h-12"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="listing_agent_license"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>License Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="3445807"
                                  className="h-12 font-mono"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-6 border-t">
              <div className="space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCreateTestListing}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Test Listing...
                      </>
                    ) : (
                      "Create Test Listing"
                    )}
                  </Button>
                )}
              </div>
              <div className="space-x-4">
                {currentTab !== "basic" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    Previous
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : currentTab === "media" ? (
                    "Create Listing"
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
