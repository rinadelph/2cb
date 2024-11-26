import { Layout } from "@/components/Layout";
import { SettingsLayout } from "@/components/Settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, Package, Shield, Star, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const plans = [
  {
    name: "Free",
    description: "For individual agents getting started",
    price: "$0",
    features: [
      "Up to 5 active listings",
      "Basic analytics",
      "Email support",
      "Standard commission tracking"
    ],
    current: true
  },
  {
    name: "Pro",
    description: "For professional agents and small teams",
    price: "$29",
    features: [
      "Unlimited active listings",
      "Advanced analytics",
      "Priority support",
      "Enhanced commission tracking",
      "Team collaboration tools",
      "Custom branding"
    ],
    current: false
  }
];

export default function BillingSettings() {
  return (
    <Layout>
      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Billing & Subscription</h3>
            <p className="text-sm text-muted-foreground">
              Manage your subscription and payment methods.
            </p>
          </div>

          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Current Plan
              </CardTitle>
              <CardDescription>
                Your current subscription plan and usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Free Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    Basic features for getting started
                  </p>
                </div>
                <Badge variant="secondary">Current Plan</Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Plan Usage</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>3 of 5 listings used</p>
                  <p>Basic analytics enabled</p>
                  <p>Email support available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.name === "Pro" ? "border-primary" : undefined}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {plan.name === "Pro" && (
                      <Badge className="bg-primary">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : "default"}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Manage your payment methods and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No payment methods</AlertTitle>
                <AlertDescription>
                  Add a payment method to upgrade to a paid plan.
                </AlertDescription>
              </Alert>
              <Button variant="outline">Add Payment Method</Button>
            </CardContent>
          </Card>
        </div>
      </SettingsLayout>
    </Layout>
  );
} 