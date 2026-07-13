import { useState } from 'react';
import { BOQItem } from '../../types';
import { Plus, Trash2, Sliders, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

interface CostEditorStepProps {
  items: BOQItem[];
  onChange: (items: BOQItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CostEditorStep({ items, onChange, onNext, onBack }: CostEditorStepProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Group items by Section
  const sections: Record<string, BOQItem[]> = {};
  items.forEach(item => {
    const sec = item.section || 'Uncategorised';
    if (!sections[sec]) {
      sections[sec] = [];
    }
    sections[sec].push(item);
  });

  const handleCellChange = (id: string, field: keyof BOQItem, val: any) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: val };

        // Coerce types to float/number if they are numeric fields
        if (field === 'quantity') newItem.quantity = parseFloat(val) || 0;
        if (field === 'materialRate') newItem.materialRate = parseFloat(val) || 0;
        if (field === 'labourRate') newItem.labourRate = parseFloat(val) || 0;

        // Recalculate rates & totals
        newItem.unitRate = newItem.materialRate + newItem.labourRate;
        newItem.total = newItem.quantity * newItem.unitRate;

        return newItem;
      }
      return item;
    });
    onChange(updated);
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const handleAddNewItem = (sectionName: string) => {
    const newItem: BOQItem = {
      id: `manual-item-${Date.now()}`,
      section: sectionName,
      description: 'New Measured Work Item Description',
      quantity: 1,
      unit: 'm²',
      materialRate: 0,
      labourRate: 0,
      unitRate: 0,
      total: 0
    };
    onChange([...items, newItem]);
  };

  const handleAddNewSection = () => {
    const secName = prompt('Enter the name of the new Work Section (e.g. 06. Finishes):');
    if (!secName) return;

    const newItem: BOQItem = {
      id: `manual-item-${Date.now()}`,
      section: secName,
      description: 'Initial Work Item Description',
      quantity: 1,
      unit: 'sum',
      materialRate: 0,
      labourRate: 0,
      unitRate: 0,
      total: 0
    };
    onChange([...items, newItem]);
  };

  const toggleSection = (sectionName: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const calculateSectionTotal = (secItems: BOQItem[]) => {
    return secItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(val);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span className="text-construction-orange">Step 4:</span> BOQ Cost Sheet Editor
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Review and adjust estimated material rates & labor allowances. Calculations are updated instantly on change.
          </p>
        </div>

        <button
          onClick={handleAddNewSection}
          className="flex items-center gap-1.5 px-4 py-2 border border-construction-orange/30 text-construction-orange hover:bg-construction-orange/10 font-bold rounded-xl transition text-xs self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Add Work Section
        </button>
      </div>

      {/* Spreadsheet Card */}
      <div className="glass-card rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <HelpCircle className="h-10 w-10 text-slate-500 mx-auto" />
            <p className="font-bold">No line items in your BOQ spreadsheet.</p>
            <button
              onClick={handleAddNewSection}
              className="px-4 py-2 bg-construction-orange text-white rounded-lg text-xs font-semibold"
            >
              Add first item
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {Object.keys(sections).map((secName) => {
              const secItems = sections[secName];
              const isCollapsed = collapsedSections[secName];
              const secTotal = calculateSectionTotal(secItems);

              return (
                <div key={secName} className="space-y-0.5">
                  {/* Section Banner Header */}
                  <div className="bg-charcoal-800/50 px-4 py-3 flex items-center justify-between">
                    <button
                      onClick={() => toggleSection(secName)}
                      className="flex items-center gap-2 text-sm font-extrabold text-white hover:text-construction-orange transition"
                    >
                      {isCollapsed ? <ChevronRight className="h-4.5 w-4.5 text-slate-400" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-400" />}
                      <span>{secName}</span>
                      <span className="text-xs font-normal text-slate-400">({secItems.length} items)</span>
                    </button>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400 font-medium">Section Subtotal:</span>
                      <span className="text-sm font-bold text-slate-100">{formatCurrency(secTotal)}</span>
                      <button
                        onClick={() => handleAddNewItem(secName)}
                        className="p-1 bg-charcoal-700 hover:bg-charcoal-600 rounded text-construction-orange"
                        title="Add Item to this Section"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Section items Table */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-charcoal-900/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                            <th className="px-4 py-3 w-1/3">Item Description</th>
                            <th className="px-4 py-3 text-center w-20">Quantity</th>
                            <th className="px-4 py-3 text-center w-20">Unit</th>
                            <th className="px-4 py-3 text-right w-28">Material Cost (£)</th>
                            <th className="px-4 py-3 text-right w-28">Labour Rate (£)</th>
                            <th className="px-4 py-3 text-right w-28">Unit Rate (£)</th>
                            <th className="px-4 py-3 text-right w-32">Total Cost (£)</th>
                            <th className="px-4 py-3 text-center w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {secItems.map((item) => (
                            <tr key={item.id} className="hover:bg-charcoal-800/10 transition group">
                              {/* Description */}
                              <td className="p-2">
                                <textarea
                                  rows={1}
                                  value={item.description}
                                  onChange={(e) => handleCellChange(item.id, 'description', e.target.value)}
                                  className="w-full bg-transparent hover:bg-charcoal-800/30 focus:bg-charcoal-900 border border-transparent focus:border-construction-orange rounded p-1.5 text-slate-200 transition resize-y"
                                />
                              </td>
                              {/* Quantity */}
                              <td className="p-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.quantity}
                                  onChange={(e) => handleCellChange(item.id, 'quantity', e.target.value)}
                                  className="w-full text-center bg-transparent hover:bg-charcoal-800/30 focus:bg-charcoal-900 border border-transparent focus:border-construction-orange rounded p-1.5 text-slate-100 transition"
                                />
                              </td>
                              {/* Unit */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.unit}
                                  onChange={(e) => handleCellChange(item.id, 'unit', e.target.value)}
                                  className="w-full text-center bg-transparent hover:bg-charcoal-800/30 focus:bg-charcoal-900 border border-transparent focus:border-construction-orange rounded p-1.5 text-slate-300 transition uppercase"
                                />
                              </td>
                              {/* Material Rate */}
                              <td className="p-2">
                                <div className="relative">
                                  <span className="absolute left-1.5 top-2.5 text-slate-500 font-normal">£</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={item.materialRate}
                                    onChange={(e) => handleCellChange(item.id, 'materialRate', e.target.value)}
                                    className="w-full text-right bg-transparent hover:bg-charcoal-800/30 focus:bg-charcoal-900 border border-transparent focus:border-construction-orange rounded p-1.5 pl-5 text-slate-100 transition"
                                  />
                                </div>
                              </td>
                              {/* Labour Rate */}
                              <td className="p-2">
                                <div className="relative">
                                  <span className="absolute left-1.5 top-2.5 text-slate-500 font-normal">£</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={item.labourRate}
                                    onChange={(e) => handleCellChange(item.id, 'labourRate', e.target.value)}
                                    className="w-full text-right bg-transparent hover:bg-charcoal-800/30 focus:bg-charcoal-900 border border-transparent focus:border-construction-orange rounded p-1.5 pl-5 text-slate-100 transition"
                                  />
                                </div>
                              </td>
                              {/* Recalculated Unit Rate */}
                              <td className="px-4 py-3.5 text-right font-semibold text-slate-400 font-mono">
                                {formatCurrency(item.unitRate)}
                              </td>
                              {/* Recalculated Total */}
                              <td className="px-4 py-3.5 text-right font-bold text-slate-100 font-mono">
                                {formatCurrency(item.total)}
                              </td>
                              {/* Delete button */}
                              <td className="px-2 py-3 text-center">
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition opacity-0 group-hover:opacity-100"
                                  title="Delete Item"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Total Footer Banner */}
            <div className="bg-charcoal-900 px-6 py-5 flex justify-between items-center font-bold">
              <span className="text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Sliders className="h-4.5 w-4.5 text-construction-orange" />
                Aggregated Net Subtotal
              </span>
              <span className="text-xl text-white font-extrabold font-mono">
                {formatCurrency(calculateGrandTotal())}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Wizard controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-5 py-2.5 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={items.length === 0}
          className="px-6 py-3 bg-construction-orange text-white font-bold rounded-xl hover:bg-construction-orange-hover hover:scale-102 active:scale-98 transition shadow-lg shadow-construction-orange/15 disabled:opacity-50"
        >
          Save & Calculate Summary
        </button>
      </div>
    </div>
  );
}
