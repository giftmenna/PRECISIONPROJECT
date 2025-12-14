"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gem, CreditCard } from "lucide-react";

export default function BuyGemsButton() {
  const [showModal, setShowModal] = useState(false);

  const handleBuyGems = () => {
    // For now, just show a simple alert
    alert("Gem purchase feature coming soon! This will integrate with Paystack for secure payments.");
  };

  return (
    <>
      <Button 
        onClick={handleBuyGems}
        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
      >
        <Gem className="h-4 w-4 mr-2" />
        Buy Gems
      </Button>
    </>
  );
} 