"use client";

import { useEffect, useMemo, useState } from "react";

import * as SodCuration from "@/lib/sod-curation";
import type { SodCurationFilter } from "@/lib/sod-curation";
import type { SodActivity, SodRisk, SodRiskMappings } from "@/types";

/**
 * Composition root for the SoD curation screen: fetches risks/activities/
 * mappings from /api/sod-risks, persists a risk's activity list on save,
 * and wires the pure selectors in src/lib/sod-curation.ts. Callers should
 * only ever need this hook.
 */
export function useSodCuration() {
  const [risks, setRisks] = useState<SodRisk[]>([]);
  const [activities, setActivities] = useState<SodActivity[]>([]);
  const [mappings, setMappings] = useState<SodRiskMappings>({});
  const [loading, setLoading] = useState(true);

  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [draftActivityIds, setDraftActivityIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const [filterStatus, setFilterStatus] = useState<SodCurationFilter>("ALL");
  const [riskSearchQuery, setRiskSearchQuery] = useState("");
  const [activitySearchQuery, setActivitySearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sod-risks")
      .then((res) => res.json())
      .then((data: { risks: SodRisk[]; activities: SodActivity[]; mappings: SodRiskMappings }) => {
        if (cancelled) return;
        setRisks(data.risks);
        setActivities(data.activities);
        setMappings(data.mappings);
      })
      .catch((err) => console.error("Falha ao carregar riscos de SoD:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => SodCuration.selectStats(risks, mappings), [risks, mappings]);

  const filteredRisks = useMemo(
    () => SodCuration.selectFilteredRisks(risks, mappings, filterStatus, riskSearchQuery),
    [risks, mappings, filterStatus, riskSearchQuery]
  );

  const filteredActivities = useMemo(
    () => SodCuration.selectFilteredActivities(activities, activitySearchQuery),
    [activities, activitySearchQuery]
  );

  const selectedRisk = risks.find((r) => r.id === selectedRiskId) ?? null;

  const impliedFunctionalityIds = useMemo(
    () => SodCuration.selectImpliedFunctionalityIds(draftActivityIds, activities),
    [draftActivityIds, activities]
  );

  const selectRisk = (riskId: string) => {
    setSelectedRiskId(riskId);
    setDraftActivityIds(mappings[riskId] ?? []);
    setActivitySearchQuery("");
  };

  const toggleDraftActivity = (activityId: number) => {
    setDraftActivityIds((prev) => SodCuration.toggleActivity(prev, activityId));
  };

  const saveMapping = async () => {
    if (!selectedRiskId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/sod-risks/${encodeURIComponent(selectedRiskId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityIds: draftActivityIds }),
      });
      if (!res.ok) {
        console.error("Falha ao salvar mapeamento:", await res.text());
        return;
      }
      setMappings((prev) => ({ ...prev, [selectedRiskId]: draftActivityIds }));
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    risks,
    activities,
    mappings,
    stats,
    filterStatus,
    setFilterStatus,
    riskSearchQuery,
    setRiskSearchQuery,
    filteredRisks,
    activitySearchQuery,
    setActivitySearchQuery,
    filteredActivities,
    selectedRisk,
    draftActivityIds,
    impliedFunctionalityIds,
    selectRisk,
    toggleDraftActivity,
    saving,
    saveMapping,
  };
}
