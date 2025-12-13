import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Link2, Check } from "lucide-react";
import { toast } from "sonner";

interface SocialShareProps {
  title: string;
  url?: string;
}

const SocialShare = ({ title, url }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(shareLinks.twitter, "_blank", "width=550,height=420")}
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(shareLinks.facebook, "_blank", "width=550,height=420")}
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4 text-[hsl(var(--success))]" /> : <Link2 className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default SocialShare;
