import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  Boxes,
  Clock,
  Gauge,
  ShoppingCart,
  Users,
  FileBarChart,
  Settings
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'production-orders'
  | 'products'
  | 'raw-materials'
  | 'process-times'
  | 'capacity'
  | 'orders'
  | 'partners'
  | 'reports';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeOpsCount?: number;
  criticalRawMaterialsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeOpsCount = 0,
  criticalRawMaterialsCount = 0
}) => {
  const menuItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Painel Geral',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'production-orders',
      label: 'Ordens de Produção',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: activeOpsCount > 0 ? activeOpsCount : undefined,
      badgeColor: 'bg-purple-600 text-white'
    },
    {
      id: 'products',
      label: 'Ficha Técnica do Produto',
      icon: <Layers className="w-4 h-4" />
    },
    {
      id: 'raw-materials',
      label: 'Matéria-Prima & Insumos',
      icon: <Boxes className="w-4 h-4" />,
      badge: criticalRawMaterialsCount > 0 ? criticalRawMaterialsCount : undefined,
      badgeColor: 'bg-amber-600 text-white'
    },
    {
      id: 'process-times',
      label: 'Tempo de Processo',
      icon: <Clock className="w-4 h-4" />
    },
    {
      id: 'capacity',
      label: 'Capacidade Produtiva',
      icon: <Gauge className="w-4 h-4" />
    },
    {
      id: 'orders',
      label: 'Cadastro de Pedidos',
      icon: <ShoppingCart className="w-4 h-4" />
    },
    {
      id: 'partners',
      label: 'Clientes e Fornecedores',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'reports',
      label: 'Relatórios de Produção',
      icon: <FileBarChart className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-64 bg-[#130b21] text-purple-200/90 border-r border-purple-950/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <p className="text-[11px] font-bold text-purple-400/70 uppercase tracking-wider px-3 mb-2">
          Módulos de Gestão
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                    : 'text-purple-200/80 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={isActive ? 'text-white' : 'text-purple-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-purple-900 text-purple-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-purple-950/90 bg-[#0d0717] text-xs text-purple-300/70">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span>Banco de Dados:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Persistente
          </span>
        </div>
        <div className="text-[10px] text-purple-400/50">
          Operações salvas em tempo real
        </div>
      </div>
    </aside>
  );
};
