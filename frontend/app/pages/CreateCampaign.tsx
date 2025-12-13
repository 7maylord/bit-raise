import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
import { ArrowLeft, ArrowRight, Check, Rocket } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

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

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleSubmit = () => {
    toast.success("Campaign created successfully! (Demo mode)");
    navigate("/");
  };

  return (
    <>
      <Helmet>
        <title>Create Campaign - BitRaise</title>
        <meta name="description" content="Launch your crowdfunding campaign on BitRaise." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Create Your Campaign
              </h1>
              <p className="text-muted-foreground">
                Launch your project on the most secure blockchain
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <Progress value={progress} className="h-2 mb-4" />
              <div className="flex justify-between">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center ${
                      step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                        step.id < currentStep
                          ? "bg-primary text-primary-foreground"
                          : step.id === currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <span className="text-xs hidden sm:block">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter your campaign title"
                      value={formData.title}
                      onChange={(e) => updateFormData("title", e.target.value)}
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground">{formData.title.length}/100 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => updateFormData("category", value)}
                    >
                      <SelectTrigger>
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
              )}

              {/* Step 2: Description */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">Tell Your Story</h2>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      placeholder="A brief summary of your project (displayed in campaign cards)"
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      maxLength={200}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">{formData.description.length}/200 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullDescription">Full Description</Label>
                    <Textarea
                      id="fullDescription"
                      placeholder="Describe your project in detail. What are you building? Why does it matter?"
                      value={formData.fullDescription}
                      onChange={(e) => updateFormData("fullDescription", e.target.value)}
                      maxLength={2000}
                      rows={8}
                    />
                    <p className="text-xs text-muted-foreground">{formData.fullDescription.length}/2000 characters</p>
                  </div>
                </div>
              )}

              {/* Step 3: Funding */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">Funding Details</h2>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">Funding Goal (STX)</Label>
                    <Input
                      id="goal"
                      type="number"
                      placeholder="e.g., 50000"
                      value={formData.goal}
                      onChange={(e) => updateFormData("goal", e.target.value)}
                      min={1}
                    />
                    <p className="text-xs text-muted-foreground">Set a realistic goal for your project</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Campaign Duration</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => updateFormData("duration", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
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
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">Review Your Campaign</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Title</p>
                      <p className="font-medium text-foreground">{formData.title}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Category</p>
                      <p className="font-medium text-foreground">{formData.category}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Short Description</p>
                      <p className="text-foreground">{formData.description}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Funding Goal</p>
                      <p className="font-medium text-foreground">{Number(formData.goal).toLocaleString()} STX</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Duration</p>
                      <p className="font-medium text-foreground">{formData.duration} days</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
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
                  <Button onClick={handleSubmit}>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch Campaign
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CreateCampaign;
