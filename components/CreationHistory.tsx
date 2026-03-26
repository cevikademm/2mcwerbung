/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { DocumentIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon, ClipboardDocumentIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, TrashIcon } from '@heroicons/react/24/outline';

export interface Creation {
  id: string;
  name: string;
  html: string;
  originalImage?: string; 
  timestamp: Date;
  metadata?: {
      invoice_no?: string;
      date?: string;
      supplier?: string;
      amount?: string;
      currency?: string;
      description?: string;
      tax_id?: string;
      iban?: string;
      tax_amount?: string;
      transaction_type?: string; // 'GELİR' | 'GİDER'
  }
}

interface CreationHistoryProps {
  history: Creation[];
  onSelect?: (creation: Creation) => void;
  onDelete?: (id: string) => void;
  displayMode?: 'invoice' | 'tax';
  viewOnly?: boolean;
}

export const CreationHistory: React.FC<CreationHistoryProps> = ({ history, onSelect, onDelete, displayMode = 'invoice', viewOnly = false }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Duplicate Invoice Logic
  // Identify IDs of invoices that are duplicates (chronologically subsequent)
  const duplicateIds = useMemo(() => {
      const seen = new Set<string>();
      const duplicates = new Set<string>();
      
      // Sort a copy by timestamp ascending (Oldest first)
      // We assume the oldest one is the "Original" / "Correct" one
      const sortedHistory = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      sortedHistory.forEach(item => {
          const no = item.metadata?.invoice_no;
          // Only check if invoice number exists and is reasonably long to avoid false positives on empty/short strings
          if (no && no.length > 2) { 
              if (seen.has(no)) {
                  // If we have seen this number before (in an older record), this current record is a duplicate
                  duplicates.add(item.id);
              } else {
                  seen.add(no);
              }
          }
      });
      return duplicates;
  }, [history]);

  if (history.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 md:h-64 text-center p-6 bg-[#0a0a0c] border border-zinc-800/60 rounded-xl">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-zinc-900/50 flex items-center justify-center">
                <DocumentIcon className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-zinc-400 font-medium mb-1">Görüntülenecek veri yok</h3>
            <p className="text-sm text-zinc-600 max-w-xs">
                Bu alanda gösterilecek herhangi bir kayıt bulunamadı.
            </p>
        </div>
      );
  }

  return (
    <div className="w-full bg-[#0a0a0c] border border-zinc-800/60 rounded-xl overflow-hidden">
      {!viewOnly && (
        <div className="px-4 md:px-6 py-4 border-b border-zinc-800/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-400">{displayMode === 'tax' ? 'KDV Listesi' : 'Son İşlemler'}</h3>
            <span className="text-xs text-zinc-600">{history.length} Kayıt</span>
        </div>
      )}
      
      <div className="w-full">
        {/* Desktop Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-900/30 border-b border-zinc-800/60 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <div className="col-span-2">Tarih</div>
            <div className="col-span-3">Fatura No</div>
            <div className="col-span-3">Açıklama</div>
            <div className="col-span-2 text-right">{displayMode === 'tax' ? 'KDV Tutarı' : 'Tutar'}</div>
            <div className="col-span-1 text-center">Tür</div>
            <div className="col-span-1"></div>
        </div>

        {/* Table/Card Body */}
        <div className="divide-y divide-zinc-800/40">
            {history.map((item) => {
                const isIncome = item.metadata?.transaction_type === 'GELİR';
                const typeLabel = item.metadata?.transaction_type || 'GİDER';
                const isDuplicate = duplicateIds.has(item.id);
                
                // Determine which amount to display based on mode
                const displayAmount = displayMode === 'tax' 
                    ? (item.metadata?.tax_amount || "0.00") 
                    : (item.metadata?.amount || "0.00");

                return (
                <div key={item.id} className="group transition-colors hover:bg-zinc-900/20">
                    
                    {/* Desktop View (Grid) */}
                    <div 
                        className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center"
                    >
                        <div className="col-span-2 text-sm text-zinc-300 cursor-pointer" onClick={() => toggleExpand(item.id)}>
                            {item.metadata?.date || item.timestamp.toLocaleDateString()}
                        </div>
                        <div className="col-span-3 text-sm font-mono text-zinc-400 flex items-center gap-2 cursor-pointer" onClick={() => toggleExpand(item.id)}>
                             <DocumentIcon className="w-4 h-4 text-blue-500/50" />
                            {item.metadata?.invoice_no || "Belge-" + item.id.substring(0,4)}
                        </div>
                        <div className="col-span-3 cursor-pointer" onClick={() => toggleExpand(item.id)}>
                            <div className="text-sm text-white font-medium truncate">{item.metadata?.supplier || "Tedarikçi"}</div>
                            <div className="text-xs text-zinc-500 truncate">{item.metadata?.description || item.name}</div>
                        </div>
                        <div className="col-span-2 text-right text-sm font-mono font-bold cursor-pointer" onClick={() => toggleExpand(item.id)}>
                            {isDuplicate && displayMode !== 'tax' ? (
                                <span className="text-red-500 text-xs font-bold animate-pulse px-2 py-1 bg-red-900/20 rounded border border-red-900/50">MÜKERRER FATURA</span>
                            ) : (
                                <span className="text-zinc-200">{displayAmount} {item.metadata?.currency || "₺"}</span>
                            )}
                        </div>
                        <div className="col-span-1 flex justify-center cursor-pointer" onClick={() => toggleExpand(item.id)}>
                             <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${isIncome ? 'bg-green-900/30 text-green-400 border-green-800/50' : 'bg-red-900/30 text-red-400 border-red-800/50'}`}>
                                 {isIncome ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
                                 {typeLabel}
                             </span>
                        </div>
                        <div className="col-span-1 flex justify-end items-center gap-3">
                            {!viewOnly && onDelete && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                    className="p-1.5 rounded hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors"
                                    title="Faturayı Sil"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => toggleExpand(item.id)}>
                                {expandedId === item.id ? (
                                    <ChevronUpIcon className="w-4 h-4 text-zinc-500" />
                                ) : (
                                    <ChevronDownIcon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile View (Card) */}
                    <div 
                        onClick={() => toggleExpand(item.id)}
                        className="flex md:hidden flex-col p-4 space-y-3 cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-2 overflow-hidden">
                                <div className="p-1.5 bg-zinc-900 rounded-lg shrink-0">
                                    <DocumentIcon className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="text-sm text-white font-medium truncate">{item.metadata?.supplier || "Tedarikçi"}</div>
                                    <div className="text-xs text-zinc-500 truncate">{item.metadata?.invoice_no || "Belge NO"}</div>
                                </div>
                             </div>
                             <div className="text-right shrink-0">
                                {isDuplicate && displayMode !== 'tax' ? (
                                     <div className="text-[10px] text-red-500 font-bold mb-1 bg-red-900/20 px-1 rounded border border-red-900/50">MÜKERRER</div>
                                ) : (
                                    <div className="text-sm font-bold text-white font-mono">
                                        {displayAmount} {item.metadata?.currency || "₺"}
                                    </div>
                                )}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border inline-block mt-1 ${isIncome ? 'bg-green-900/30 text-green-400 border-green-800/50' : 'bg-red-900/30 text-red-400 border-red-800/50'}`}>
                                    {typeLabel}
                                </span>
                             </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-600 border-t border-zinc-800/50 pt-2">
                             <span>{item.metadata?.date || item.timestamp.toLocaleDateString()}</span>
                             <div className="flex items-center gap-3">
                                {!viewOnly && onDelete && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                        className="text-red-500 hover:text-red-400"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <div className="flex items-center gap-1">
                                    {expandedId === item.id ? "Gizle" : "Detay"} 
                                    {expandedId === item.id ? <ChevronUpIcon className="w-3 h-3"/> : <ChevronDownIcon className="w-3 h-3"/>}
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Expanded Detail View (Responsive Accordion) */}
                    {expandedId === item.id && (
                        <div className="px-4 md:px-6 pb-6 pt-2 bg-zinc-900/30 animate-fadeIn border-t border-zinc-800/30">
                             
                             {/* Detailed Data Grid */}
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-[#050505] rounded-lg border border-zinc-800/60 shadow-inner">
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Vergi No / TCKN</span>
                                    <span className="text-sm text-zinc-300 font-mono tracking-tight">{item.metadata?.tax_id || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">IBAN</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-zinc-300 font-mono text-[11px] truncate w-full" title={item.metadata?.iban}>
                                            {item.metadata?.iban || "-"}
                                        </span>
                                        {item.metadata?.iban && <ClipboardDocumentIcon className="w-3 h-3 text-zinc-600 hover:text-white cursor-pointer shrink-0" />}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Toplam KDV</span>
                                    <span className="text-sm text-zinc-300 font-mono">{item.metadata?.tax_amount || "0.00"} {item.metadata?.currency}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">İşlem Türü</span>
                                    <span className={`text-sm font-bold font-mono ${isIncome ? 'text-green-400' : 'text-red-400'}`}>{typeLabel}</span>
                                </div>
                             </div>

                             {/* Visual Preview */}
                             <div className="border border-zinc-800 rounded-lg overflow-hidden shadow-2xl relative group/preview">
                                <div className="bg-[#121214] px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 font-mono">DİJİTAL GÖRÜNÜM</span>
                                    <div className="flex gap-4">
                                        {item.originalImage && (
                                            <a href={item.originalImage} download={`fatura_${item.id}.png`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                                                <EyeIcon className="w-3 h-3" />
                                                <span className="hidden sm:inline">Orijinalini İndir</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {/* Use iframe to sandbox the HTML view */}
                                <iframe
                                    srcDoc={item.html}
                                    className="w-full h-[400px] md:h-[500px] bg-[#09090b]"
                                    title="Invoice Detail"
                                    sandbox="allow-scripts"
                                />
                             </div>
                        </div>
                    )}
                </div>
            );
            })}
        </div>
      </div>
    </div>
  );
};