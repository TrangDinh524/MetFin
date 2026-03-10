import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { SevBadge } from "../../components/ui/SevBadge";
import { X, RotateCcw, Eye, EyeOff } from "lucide-react";
import { useFinanceStore } from "../../store/useFinanceStore";
import { COLORS } from "../../lib/utils";
import { getIcon } from "../../lib/iconMap";
import type { InsightSeverity } from "../../types";

export function InsightsSection() {
  const insightsData = useFinanceStore((s) => s.insights);
  const fetchInsights = useFinanceStore((s) => s.fetchInsights);
  const dismissedInsights = useFinanceStore((s) => s.dismissedInsights);
  const dismissInsight = useFinanceStore((s) => s.dismissInsight);
  const restoreInsight = useFinanceStore((s) => s.restoreInsight);
  const restoreAllInsights = useFinanceStore((s) => s.restoreAllInsights);

  const [showDismissed, setShowDismissed] = useState(false);

  useEffect(() => {
    if (!insightsData) fetchInsights();
  }, [insightsData, fetchInsights]);

  if (!insightsData) {
    return (
      <div className="flex items-center justify-center py-20 text-[#7a9fad]">
        Loading insights…
      </div>
    );
  }

  const insightsList = insightsData.insights;
  const visible = insightsList.filter((_, i) => !dismissedInsights.includes(i));
  const dismissed = insightsList
    .map((ins, i) => ({ ins, idx: i }))
    .filter(({ idx }) => dismissedInsights.includes(idx));

  const criticalCount = visible.filter((i) => i.sev === "critical").length;
  const warningCount = visible.filter((i) => i.sev === "warning").length;
  const tipCount = visible.filter((i) => i.sev === "tip").length;

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[#0d1117]">
            Insights & Actions
          </div>
          <div className="mt-0.5 text-[11px] text-[#7a9fad]">
            {criticalCount} critical · {warningCount} warnings · {tipCount} tips
            {dismissed.length > 0 && ` · ${dismissed.length} dismissed`}
          </div>
        </div>
        {dismissed.length > 0 && (
          <button
            type="button"
            onClick={() => setShowDismissed((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-[#cae7ee] bg-[#f0f8fa] px-3 py-1.5 text-[11px] font-medium text-[#3a5260] transition-colors hover:bg-[#e4f2f6]"
          >
            {showDismissed ? <EyeOff size={12} /> : <Eye size={12} />}
            {showDismissed
              ? "Hide Dismissed"
              : `Show Dismissed (${dismissed.length})`}
          </button>
        )}
      </div>

      {visible.map((ins) => {
        const idx = insightsList.indexOf(ins);
        return (
          <InsightCard
            key={idx}
            ins={ins}
            onAction={() => dismissInsight(idx)}
            actionIcon={<X size={12} />}
            actionLabel="Dismiss"
          />
        );
      })}

      {visible.length === 0 && !showDismissed && (
        <Card className="py-12 text-center">
          <div className="mb-1.5 text-[15px] font-semibold text-[#0d1117]">
            All clear!
          </div>
          <div className="text-[12px] text-[#3a5260]">
            No active insights. We&apos;ll notify you when something needs
            attention.
          </div>
        </Card>
      )}

      {showDismissed && dismissed.length > 0 && (
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold text-[#7a9fad]">
              Dismissed Insights
            </div>
            <button
              type="button"
              onClick={restoreAllInsights}
              className="flex items-center gap-1.5 rounded-lg border border-[#cae7ee] bg-[#f0f8fa] px-2.5 py-1 text-[11px] font-medium text-[#3a5260] transition-colors hover:bg-[#e4f2f6]"
            >
              <RotateCcw size={11} />
              Restore All
            </button>
          </div>
          {dismissed.map(({ ins, idx }) => (
            <InsightCard
              key={idx}
              ins={ins}
              dismissed
              onAction={() => restoreInsight(idx)}
              actionIcon={<RotateCcw size={12} />}
              actionLabel="Restore"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InsightCard({
  ins,
  dismissed,
  onAction,
  actionIcon,
  actionLabel,
}: {
  ins: {
    sev: InsightSeverity;
    icon: string;
    title: string;
    desc: string;
    action: string;
    color: string;
  };
  dismissed?: boolean;
  onAction: () => void;
  actionIcon: React.ReactNode;
  actionLabel: string;
}) {
  const Icon = getIcon(ins.icon);

  return (
    <div
      className={`flex gap-3 rounded-r-[14px] border border-[#cae7ee] border-l-4 p-4 shadow-[0_1px_3px_rgba(85,178,201,0.05)] transition-opacity ${dismissed ? "opacity-50" : ""}`}
      style={{ borderLeftColor: ins.color, background: COLORS.card }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border"
        style={{
          background: `${ins.color}12`,
          borderColor: `${ins.color}20`,
        }}
      >
        <Icon size={16} style={{ color: ins.color }} />
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#0d1117]">
            {ins.title}
          </span>
          <SevBadge sev={ins.sev} />
        </div>
        <div className="text-[12px] leading-relaxed text-[#3a5260]">
          {ins.desc}
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1.5">
        {!dismissed && (
          <button
            type="button"
            className="rounded-lg border px-3 py-1.5 text-[12px] font-semibold"
            style={{
              background: `${ins.color}12`,
              color: ins.color,
              borderColor: `${ins.color}30`,
            }}
          >
            {ins.action}
          </button>
        )}
        <button
          type="button"
          onClick={onAction}
          className="flex items-center rounded-lg border border-[#cae7ee] bg-transparent p-1.5 text-[#7a9fad] transition-colors hover:bg-[#f0f8fa]"
          aria-label={actionLabel}
          title={actionLabel}
        >
          {actionIcon}
        </button>
      </div>
    </div>
  );
}
