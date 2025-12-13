"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useStacks } from "@/hooks/use-stacks";
import { daysToBlocks } from "@/lib/stx-utils";

const CATEGORIES = [
  "DeFi",
  "NFT",
  "Gaming",
  "Infrastructure",
  "Social",
  "Education",
  "DAO",
  "Music",
  "Art",
  "Other",
];

const DURATIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
];

interface FormData {
  title: string;
  description: string;
  fullDescription: string;
  category: string;
  goal: string;
  duration: string;
}

const steps = [
  { id: 1, title: "Basic Info", description: "Title and category" },
  { id: 2, title: "Description", description: "Tell your story" },
  { id: 3, title: "Funding", description: "Goal and duration" },
  { id: 4, title: "Review", description: "Confirm details" },
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const { userData, createCampaign } = useStacks();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    fullDescription: "",
    category: "",
    goal: "",
    duration: "",
  });

  const progress = (currentStep / steps.length) * 100;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== "" && formData.category !== "";
      case 2:
        return formData.description.trim() !== "" && formData.fullDescription.trim() !== "";
      case 3:
        return formData.goal !== "" && Number(formData.goal) > 0 && formData.duration !== "";
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!userData) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);

    try {
      const durationInBlocks = daysToBlocks(Number(formData.duration));
      const metadataUri = `ipfs://${formData.category.toLowerCase()}-${Date.now()}`;

      await createCampaign(
        formData.title,
        formData.description,
        Number(formData.goal),
        durationInBlocks,
        metadataUri
      );

      toast.success("Campaign created successfully! Transaction submitted.");

      // Navigate to home after short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                placeholder="Enter a compelling title for your campaign"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData("category", value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                placeholder="A brief summary of your campaign (1-2 sentences)"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="bg-background/50 min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullDescription">Full Description *</Label>
              <Textarea
                id="fullDescription"
                placeholder="Tell the full story of your campaign. What are you building? Why should people support you?"
                value={formData.fullDescription}
                onChange={(e) => updateFormData("fullDescription", e.target.value)}
                className="bg-background/50 min-h-[200px]"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="goal">Funding Goal (STX) *</Label>
              <Input
                id="goal"
                type="number"
                placeholder="Enter funding goal in STX"
                value={formData.goal}
                onChange={(e) => updateFormData("goal", e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Campaign Duration *</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => updateFormData("duration", value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select campaign duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((dur) => (
                    <SelectItem key={dur.value} value={dur.value}>
                      {dur.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">Campaign Title</h3>
              <p className="text-muted-foreground">{formData.title}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">Category</h3>
              <p className="text-muted-foreground">{formData.category}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">Short Description</h3>
              <p className="text-muted-foreground">{formData.description}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">Full Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {formData.fullDescription}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">Funding Goal</h3>
              <p className="text-muted-foreground">{formData.goal} STX</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">Duration</h3>
              <p className="text-muted-foreground">{formData.duration} days</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Create Campaign</h1>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs">{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-lg mb-6">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {currentStep < steps.length ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Launch Campaign
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
