import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, Zap, Heart, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  campaignId: string;
}

const presetAmounts = [10, 25, 50, 100, 250, 500];

const DonationModal = ({ isOpen, onClose, campaignTitle }: DonationModalProps) => {
  const [amount, setAmount] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const { toast } = useToast();

  const handlePresetClick = (preset: number) => {
    setSelectedPreset(preset);
    setAmount(preset.toString());
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setSelectedPreset(null);
  };

  const handleDonate = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Wallet connection required",
      description: "Please connect your Stacks wallet to complete the donation.",
    });
    
    // In a real implementation, this would trigger wallet connection and transaction
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Heart className="w-5 h-5 text-primary" />
            Back this Project
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Support "{campaignTitle}" with STX
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Preset Amounts */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Select Amount (STX)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant={selectedPreset === preset ? "default" : "outline"}
                  className="h-12"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset} STX
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Or enter custom amount
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pr-16 h-12 text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                STX
              </span>
            </div>
          </div>

          {/* Reward Tiers Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Gift className="w-4 h-4 text-primary" />
              Backer Rewards
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 10+ STX: Early access to platform</li>
              <li>• 50+ STX: Exclusive NFT badge</li>
              <li>• 250+ STX: Governance voting rights</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleDonate}>
              <Wallet className="w-4 h-4 mr-2" />
              Donate {amount ? `${amount} STX` : ""}
            </Button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Zap className="w-3 h-3" />
            Secured by Bitcoin through Stacks
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationModal;
