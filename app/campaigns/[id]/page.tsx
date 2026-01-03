"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { SingleCampaings, GetSingleInsights } from "../../api";


type CampaignStatus = "active" | "paused" | "completed" | string;

interface Campaign {
  id: string;
  name: string;
  brand_id: string;
  status: CampaignStatus;
  budget: number;
  daily_budget?: number;
  created_at: string;
}

interface CampaignInsights {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  conversion_rate: number;
  timestamp?: string;
}

interface InfoProps {
  label: string;
  value: string | number;
  bold?: boolean;
}

interface InsightCardProps {
  title: string;
  value: string | number;
}


const SingleCampaign = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [insights, setInsights] = useState<CampaignInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [live, setLive] = useState<boolean>(false);
  const [sseError, setSseError] = useState<boolean>(false);


  useEffect(() => {
    if (!id) return;

    const fetchInitialData = async (): Promise<void> => {
      try {
        const [campaignRes, insightRes] = await Promise.all([
          SingleCampaings(id),
          GetSingleInsights(id),
        ]);

        setCampaign(campaignRes?.campaign || null);
        setInsights(insightRes?.insights || null);
      } catch {
        setError("Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);


  useEffect(() => {
    if (!id) return;

    const streamUrl = `${process.env.NEXT_PUBLIC_SITE_NAME}/campaigns/${id}/insights/stream`;
    const eventSource = new EventSource(streamUrl);

    eventSource.onopen = () => {
      setLive(true);
      setSseError(false);
    };

    eventSource.onmessage = (event: MessageEvent<string>) => {
      const data: Partial<CampaignInsights> = JSON.parse(event.data);

      setInsights((prev) => {
        return {
          ...(prev ?? ({} as CampaignInsights)),
          ...data,
        };
      });

    };

    eventSource.onerror = () => {
      setLive(false);
      setSseError(true);

      setTimeout(() => setSseError(false), 3000);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setLive(false);
    };
  }, [id]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 border-4 border-blue-600 border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-5 rounded-lg flex flex-col items-center gap-4">
        <p className="text-sm font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="
            inline-flex items-center gap-2
            px-4 py-2
            rounded-md
            bg-red-600
            text-white
            text-sm font-semibold
            hover:bg-red-700
            transition
            active:scale-95
          "
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}


  if (!campaign) return null;


  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 relative">
      {sseError && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-3 rounded-lg shadow-lg">
            ⚠ Live updates disconnected
          </div>
        </div>
      )}

      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
      >
        All Campaigns
      </Link>

      <div className="max-w-5xl mx-auto space-y-8 mt-6">
        {/* HEADER */}
        <div className="bg-white border rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <p className="text-sm text-gray-500">Campaign ID: {campaign.id}</p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${campaign.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                  }`}
              >
                {campaign.status.toUpperCase()}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${live
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {live ? "LIVE" : "OFFLINE"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Info label="Brand ID" value={campaign.brand_id} />
            <Info
              label="Created At"
              value={new Date(campaign.created_at).toLocaleDateString()}
            />
            <Info label="Total Budget" value={`₹${campaign.budget}`} bold />
            <Info
              label="Daily Budget"
              value={`₹${campaign.daily_budget ?? "-"}`}
              bold
            />
          </div>
        </div>

        {/* INSIGHTS */}
        {insights && (
          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold">Live Campaign Insights</h2>
              <RefreshCcw
                className={`h-5 w-5 ${live ? "animate-spin text-emerald-600" : "text-gray-400"
                  }`}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <InsightCard title="Impressions" value={insights.impressions} />
              <InsightCard title="Clicks" value={insights.clicks} />
              <InsightCard title="Conversions" value={insights.conversions} />
              <InsightCard title="Spend" value={`₹${insights.spend}`} />
              <InsightCard title="CTR (%)" value={insights.ctr} />
              <InsightCard title="CPC (₹)" value={insights.cpc} />
              <InsightCard
                title="Conversion Rate (%)"
                value={insights.conversion_rate}
              />
              <InsightCard
                title="Last Updated"
                value={
                  insights.timestamp
                    ? new Date(insights.timestamp).toLocaleTimeString()
                    : "-"
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleCampaign;


const Info = ({ label, value, bold = false }: InfoProps) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className={bold ? "text-lg font-semibold" : "font-medium"}>{value}</p>
  </div>
);

const InsightCard = ({ title, value }: InsightCardProps) => (
  <div className="border rounded-lg p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-bold mt-1">{value ?? "-"}</p>
  </div>
);
