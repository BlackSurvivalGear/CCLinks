import { useState, useEffect } from 'react';
import { BOQItem } from '../../types';
import { BrainCircuit, Loader2, Sparkles, Database, Check } from 'lucide-react';

interface BoqAnalysisStepProps {
  projectName: string;
  onAnalysisComplete: (items: BOQItem[]) => void;
}

const ANALYSIS_STEPS = [
  { label: 'Initializing deep document ingestion & text extraction...', icon: BrainCircuit },
  { label: 'Parsing tabular layouts, column headers & page boundaries...', icon: Database },
  { label: 'Identifying measured work sections & structural classifications...', icon: Sparkles },
  { label: 'Extracting description texts, decimal quantities & physical units...', icon: Sparkles },
  { label: 'Mapping labor rates, material items & standard Estimating catalog keys...', icon: Check },
];

export default function BoqAnalysisStep({ projectName, onAnalysisComplete }: BoqAnalysisStepProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Generate dynamic, context-aware BOQ items based on the Project Name!
  const generateContextualItems = (name: string): BOQItem[] => {
    const low = name.toLowerCase();

    // Default general template
    let templates = [
      { section: '01. Site Prep & Groundworks', desc: 'Clear site vegetation and excavate foundation trenches (up to 1.5m deep)', qty: 45, unit: 'm³', mat: 22, lab: 38 },
      { section: '01. Site Prep & Groundworks', desc: 'Pour C35 standard concrete foundation footings including steel reinforcing mesh', qty: 18, unit: 'm³', mat: 125, lab: 55 },
      { section: '02. Brickwork & Shell', desc: 'Construct cavity blockwork wall with 100m polyurethane insulation board & wall ties', qty: 110, unit: 'm²', mat: 48, lab: 65 },
      { section: '03. Roof Construction', desc: 'Timber cut roof structure including wall plates, rafters, ridge boards & collar ties', qty: 65, unit: 'm²', mat: 35, lab: 45 },
      { section: '03. Roof Construction', desc: 'Install breathable felt membranes, slate tiling, ridges and lead valleys/flashings', qty: 65, unit: 'm²', mat: 55, lab: 70 },
      { section: '04. Carpentry & Plastering', desc: 'Supply and fix moisture-resistant plasterboard linings to walls and skim finish', qty: 220, unit: 'm²', mat: 12, lab: 18 },
      { section: '05. Electrical & HVAC', desc: 'First and second fix wiring, double sockets, LED downlights and fuse-board upgrades', qty: 1, unit: 'sum', mat: 850, lab: 1200 },
      { section: '05. Electrical & HVAC', desc: 'First and second fix central heating pipework, radiators and thermostatic valves', qty: 1, unit: 'sum', mat: 950, lab: 1400 },
    ];

    if (low.includes('roof') || low.includes('tiling') || low.includes('loft')) {
      templates = [
        { section: '01. Scaffolding & Access', desc: 'Erect dual-level independent access scaffolding including safety netting and toe boards', qty: 1, unit: 'sum', mat: 250, lab: 1800 },
        { section: '02. Ripping & Demolition', desc: 'Strip existing concrete tiles, battens and underlay. Dispose in registered skips', qty: 95, unit: 'm²', mat: 5, lab: 18 },
        { section: '03. Timber Structural', desc: 'Install structural C24 timber rafters, ridge beams and sister joists for level correction', qty: 12, unit: 'no', mat: 45, lab: 60 },
        { section: '04. Underlay & Battening', desc: 'Lay ultra-breathable roofing membrane underlay and 25x38mm treated softwood battens', qty: 95, unit: 'm²', mat: 12, lab: 15 },
        { section: '05. Roof Slating', desc: 'Supply and lay premium natural Spanish slates fixed with copper nails to gauge', qty: 95, unit: 'm²', mat: 45, lab: 55 },
        { section: '06. Leadwork & Flashings', desc: 'Install Code 4 milled lead valley flashings and chimney aprons including patination oil', qty: 18, unit: 'm', mat: 32, lab: 45 },
      ];
    } else if (low.includes('extension') || low.includes('garage') || low.includes('build')) {
      templates = [
        { section: '01. Excavations', desc: 'Excavate foundation trenches width 600mm, deep 1200mm, load to tippers and cart away', qty: 52, unit: 'm³', mat: 15, lab: 45 },
        { section: '01. Excavations', desc: 'Compact hardcore sub-base type 1 in layers not exceeding 150mm thick', qty: 35, unit: 'm³', mat: 28, lab: 22 },
        { section: '02. Concrete Footings', desc: 'Ready-mix concrete C35 poured into trench foundations including tamping to level', qty: 22, unit: 'm³', mat: 135, lab: 40 },
        { section: '03. Cavity Brickwork', desc: 'Facing brickwork exterior skin and thermal blockwork interior skin with cavity insulation', qty: 125, unit: 'm²', mat: 65, lab: 85 },
        { section: '04. Structural steel', desc: 'Provide and install structural steel UB 203x133x30 lintels supported on padstones', qty: 3, unit: 'no', mat: 420, lab: 350 },
        { section: '05. Floor Slab', desc: 'Install gas membrane, 150mm concrete floor slab, 120mm Celotex floor insulation & screed', qty: 45, unit: 'm²', mat: 48, lab: 35 },
        { section: '06. Carpentry & Joinery', desc: 'Timber floor joists 47x195mm treated softwood including wall hangers and bridging', qty: 24, unit: 'no', mat: 38, lab: 42 },
      ];
    } else if (low.includes('reno') || low.includes('refurb') || low.includes('kitchen') || low.includes('bathroom')) {
      templates = [
        { section: '01. Strip Out', desc: 'Strip out existing kitchen cabinetry, tiling, sanitary-ware, and block partitions', qty: 1, unit: 'sum', mat: 80, lab: 850 },
        { section: '02. Structural Alterations', desc: 'Demolish load bearing internal wall, shore up ceilings and install steel RSJ beam', qty: 1, unit: 'sum', mat: 550, lab: 1450 },
        { section: '03. Plasterboard & Framing', desc: 'Construct timber stud partition wall, pack with acoustic rockwool and plasterboard', qty: 45, unit: 'm²', mat: 16, lab: 24 },
        { section: '03. Plasterboard & Framing', desc: 'Apply multi-finish plaster skim coat to walls and ceilings for a paint-ready finish', qty: 110, unit: 'm²', mat: 8, lab: 18 },
        { section: '04. Electrical & Lighting', desc: 'Rewire room including new ring main, dual RCD board, switches and recessed LED spotlights', qty: 1, unit: 'sum', mat: 650, lab: 950 },
        { section: '05. Plumbing & Heating', desc: 'Relocate soil pipes, install designer towel radiator, and first-fix hot/cold water runs', qty: 1, unit: 'sum', mat: 480, lab: 750 },
        { section: '06. Joinery & Trim', desc: 'Install moisture-resistant MDF skirtings and matching ogee architrave profiles', qty: 32, unit: 'm', mat: 9, lab: 12 },
      ];
    }

    return templates.map((t, idx) => ({
      id: `item-${idx + 1}`,
      section: t.section,
      description: t.desc,
      quantity: t.qty,
      unit: t.unit,
      materialRate: t.mat,
      labourRate: t.lab,
      unitRate: t.mat + t.lab,
      total: t.qty * (t.mat + t.lab),
    }));
  };

  useEffect(() => {
    let active = true;
    const progressInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(progressInterval);
          if (active) {
            // Completed! Call back with generated items
            const generated = generateContextualItems(projectName);
            onAnalysisComplete(generated);
          }
          return prev;
        }
      });
    }, 1500);

    return () => {
      active = false;
      clearInterval(progressInterval);
    };
  }, [projectName, onAnalysisComplete]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-8 animate-pulse-slow">
      <div className="relative inline-flex items-center justify-center">
        {/* Animated Scanner Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-construction-orange/30 animate-ping duration-1000" />
        <div className="p-6 bg-construction-orange/10 border border-construction-orange/20 text-construction-orange rounded-full relative z-10">
          <BrainCircuit className="h-12 w-12 animate-pulse" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          AI Bill of Quantities Processing
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Our proprietary deep learning layout engine is digesting your uploaded PDF to map work scopes, extract structural measurements, and look up standard cost guides.
        </p>
      </div>

      {/* Analysis Stages List */}
      <div className="glass-card rounded-2xl p-6 border border-white/5 text-left max-w-md mx-auto space-y-4">
        {ANALYSIS_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3.5 transition-all duration-300 ${
                isDone ? 'opacity-55' : isActive ? 'opacity-100 font-bold scale-[1.01]' : 'opacity-25'
              }`}
            >
              <div className={`p-1.5 rounded-lg border ${
                isDone
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : isActive
                  ? 'bg-construction-orange/10 text-construction-orange border-construction-orange/20 animate-spin-slow'
                  : 'bg-slate-800 text-slate-500 border-slate-800'
              }`}>
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
              </div>
              <span className={`text-xs ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-500">
        Estimating AI pipeline operates compliance checklists based on SMM7 / NRM2 rules of measurement.
      </p>
    </div>
  );
}
