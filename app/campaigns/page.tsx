"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { AllCampaings, GetInsights } from "../api";


type CampaignStatus = "active" | "paused" | "completed" | string;

interface Campaign {
  id: string;
  name: string;
  brand_id: string;
  status: CampaignStatus;
  budget: number;
  daily_budget?: number;
  platforms: string[];
  created_at: string;
}

interface Insights {
  total_campaigns: number;
  active_campaigns: number;
  paused_campaigns: number;
  completed_campaigns: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_spend: number;
  avg_ctr: number;
  avg_cpc: number;
  avg_conversion_rate: number;
}

interface InsightCardProps {
  title: string;
  value: string | number;
}

interface PlatformConfig {
  [key: string]: {
    color: string;
    bgColor: string;
    label: string;
  };
}


const platformConfig: PlatformConfig = {
  meta: { color: "#1877F2", bgColor: "#E7F3FF", label: "Meta" },
  facebook: { color: "#1877F2", bgColor: "#E7F3FF", label: "Facebook" },
  google: { color: "#4285F4", bgColor: "#E8F0FE", label: "Google" },
  instagram: { color: "#E4405F", bgColor: "#FFE8EC", label: "Instagram" },
  linkedin: { color: "#0A66C2", bgColor: "#E7F3FF", label: "LinkedIn" },
  youtube: { color: "#FF0000", bgColor: "#FFE8E8", label: "YouTube" },
  twitter: { color: "#1DA1F2", bgColor: "#E8F5FD", label: "Twitter" },
};


const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");


  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [campaignRes, insightRes] = await Promise.all([
          AllCampaings(),
          GetInsights(),
        ]);

        setCampaigns(campaignRes?.campaigns || []);
        setInsights(insightRes?.insights || null);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const filteredAndSortedCampaigns = useMemo<Campaign[]>(() => {
    let filtered = campaigns.filter((campaign) => {
      const matchesSearch = campaign.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || campaign.status === statusFilter;

      const matchesPlatform =
        platformFilter === "all" ||
        campaign.platforms.includes(platformFilter);

      return matchesSearch && matchesStatus && matchesPlatform;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );
        case "budget-high":
          return b.budget - a.budget;
        case "budget-low":
          return a.budget - b.budget;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [campaigns, searchTerm, statusFilter, platformFilter, sortBy]);

  const getStatusStyle = (status: CampaignStatus): string => {
    switch (status) {
      case "active":
        return "text-green-700 bg-green-100";
      case "paused":
        return "text-yellow-700 bg-yellow-100";
      case "completed":
        return "text-red-700 bg-red-100";
      default:
        return "text-blue-700 bg-blue-100";
    }
  };

  const uniquePlatforms = useMemo<string[]>(() => {
    const set = new Set<string>();
    campaigns.forEach((c) => c.platforms.forEach((p) => set.add(p)));
    return Array.from(set);
  }, [campaigns]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600 gap-4">
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {insights && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <InsightCard title="Total Campaigns" value={insights.total_campaigns} />
            <InsightCard title="Active" value={insights.active_campaigns} />
            <InsightCard title="Paused" value={insights.paused_campaigns} />
            <InsightCard title="Completed" value={insights.completed_campaigns} />
            <InsightCard title="Impressions" value={insights.total_impressions.toLocaleString()} />
            <InsightCard title="Clicks" value={insights.total_clicks.toLocaleString()} />
            <InsightCard title="Conversions" value={insights.total_conversions.toLocaleString()} />
            <InsightCard title="Spend (₹)" value={`₹${insights.total_spend.toLocaleString()}`} />
            <InsightCard title="Avg CTR (%)" value={insights.avg_ctr} />
            <InsightCard title="Avg CPC (₹)" value={insights.avg_cpc} />
            <InsightCard title="Conversion Rate (%)" value={insights.avg_conversion_rate} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCampaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <div className="bg-white p-6 rounded-lg border hover:shadow-md transition">
                <h3 className="text-lg font-semibold mb-1">{campaign.name}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Brand ID: {campaign.brand_id}
                </p>

                <div className="flex justify-between text-sm mb-2 items-center">
                  <span>Status</span>
                  <span
                    className={`font-medium capitalize px-3 py-1 rounded-full text-xs ${getStatusStyle(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span>Total Budget</span>
                  <span className="font-semibold">₹{campaign.budget}</span>
                </div>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {campaign.platforms.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: platformConfig[p]?.bgColor,
                        color: platformConfig[p]?.color,
                      }}
                    >
                      {platformConfig[p]?.label || p}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;


const InsightCard = ({ title, value }: InsightCardProps) => (
  <div className="bg-white border rounded-lg p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);
