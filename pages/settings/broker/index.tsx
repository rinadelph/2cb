import { Layout } from "@/components/Layout";
import { SettingsLayout } from "@/components/Settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Loader2, Building2, Mail, Phone, User, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function BrokerSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Broker information updated",
        description: "Your broker details have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update broker information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Broker Information</h3>
            <p className="text-sm text-muted-foreground">
              Manage your broker and license information.
            </p>
          </div>

          {/* Broker Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Broker Details
              </CardTitle>
              <CardDescription>
                Your broker and company information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="broker-name">Broker Name</Label>
                  <Input id="broker-name" placeholder="Reid Advisors, LLC" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number</Label>
                  <Input id="license" placeholder="BK3445807" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="office-address">Office Address</Label>
                  <Input id="office-address" placeholder="123 Business Ave" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="office-phone">Office Phone</Label>
                  <Input id="office-phone" placeholder="(305) 555-0123" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Agent Information
              </CardTitle>
              <CardDescription>
                Your personal agent details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Full Name</Label>
                  <Input id="agent-name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-license">Agent License</Label>
                  <Input id="agent-license" placeholder="SL3445807" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-phone">Phone</Label>
                  <Input id="agent-phone" placeholder="(305) 555-0123" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-email">Email</Label>
                  <Input id="agent-email" type="email" placeholder="john@example.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Additional Information
              </CardTitle>
              <CardDescription>
                Other relevant broker and licensing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Share your experience and expertise..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties</Label>
                <Input
                  id="specialties"
                  placeholder="e.g., Luxury Homes, Commercial, Investment Properties"
                />
              </div>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </SettingsLayout>
    </Layout>
  );
} 