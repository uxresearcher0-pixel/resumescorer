import { create } from "zustand";
import type { Resume, JobDescription } from "@/types/resume";
import type { Report } from "@/types/report";

interface AnalysisStore {
  // Active flow state
  selectedResume: Resume | null;
  selectedJD: JobDescription | null;
  activeReportId: string | null;
  activeReport: Report | null;

  // Analysis progress
  currentStep: number;
  isAnalyzing: boolean;

  // Actions
  setSelectedResume: (resume: Resume | null) => void;
  setSelectedJD: (jd: JobDescription | null) => void;
  setActiveReportId: (id: string | null) => void;
  setActiveReport: (report: Report | null) => void;
  setCurrentStep: (step: number) => void;
  setIsAnalyzing: (v: boolean) => void;
  resetFlow: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  selectedResume: null,
  selectedJD: null,
  activeReportId: null,
  activeReport: null,
  currentStep: 0,
  isAnalyzing: false,

  setSelectedResume: (resume) => set({ selectedResume: resume }),
  setSelectedJD: (jd) => set({ selectedJD: jd }),
  setActiveReportId: (id) => set({ activeReportId: id }),
  setActiveReport: (report) => set({ activeReport: report }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),
  resetFlow: () =>
    set({
      selectedResume: null,
      selectedJD: null,
      activeReportId: null,
      activeReport: null,
      currentStep: 0,
      isAnalyzing: false,
    }),
}));
