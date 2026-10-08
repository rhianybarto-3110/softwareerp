import React from 'react';
import { CompanyConfig } from '../types';
import {
  Factory,
  UserCheck,
  PlusCircle,
  Settings,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  config: CompanyConfig | null;
  onOpenSettings: () => void;
  onNewOrder: () => void;
  activeOpsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  onOpenSettings,
  onNewOrder,
  activeOpsCount
}) => {
  return (
    <header className="bg-[#150d24] text-white border-b border-purple-900/50 sticky top-0 z-30 shadow-lg shadow-purple-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700 flex items-center justify-center shadow-purple-600/40 shadow-md">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                NexusERP
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/25 text-purple-200 border border-purple-400/30">
                PCP & Indústria
              </span>
            </div>
            <p className="text-xs text-purple-200/70 font-normal leading-none hidden sm:block">
              {config?.tradingName || 'Gestão da Produção e Operações'}
            </p>
          </div>
        </div>

        {/* Center / Right Badges */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Technical Responsible Highlight Card */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#201438] hover:bg-[#2a1a4a] border border-purple-800/60 text-left transition-all group shadow-xs"
            title="Clique para editar o Responsável Técnico ou dados da empresa"
          >
            <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-400/50 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-purple-300/80 uppercase tracking-wider">
                  Resp. Técnico
                </span>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <p className="text-xs font-semibold text-purple-50 truncate max-w-[210px]">
                {config?.technicalResponsible || 'Engenheiro Responsável'}
              </p>
              <p className="text-[10px] text-purple-300 font-mono">
                {config?.technicalRegistration || 'CREA Ativo'}
              </p>
            </div>
          </button>

          {/* Quick Action: Nova OP */}
          <button
            onClick={onNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 rounded-lg shadow-sm shadow-purple-600/40 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Ordem de Produção</span>
            <span className="sm:hidden">Nova OP</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/50 transition-colors"
            title="Configurações do ERP & Empresa"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
