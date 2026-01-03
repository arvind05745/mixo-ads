"use client";

import { ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const onNavigateToCampaigns = () => {
    router.push("/campaigns");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center text-white">
        <div className="mb-8">
          <Zap className="h-20 w-20 mx-auto mb-6 animate-pulse" />
        </div>

        <h1 className="text-5xl lg:text-6xl font-bold mb-4">
          Campaign Manager
        </h1>

        <p className="text-xl lg:text-2xl text-blue-100 mb-8">
          Manage and monitor your marketing campaigns all in one place
        </p>

        <button
          onClick={onNavigateToCampaigns}
          className="inline-flex items-center gap-3 bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
        >
          View Campaigns
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
