import React from 'react';
import { DashboardStats, ProductionOrder, CompanyConfig } from '../types';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  Boxes,
  PlusCircle,
  ArrowUpRight,
  UserCheck,
  PlayCircle,
  PauseCircle,
  Package
} from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats | null;
  productionOrders: ProductionOrder[];
  config: CompanyConfig | null;
  onNavigate: (tab: any) => void;
  onNewOrder: () => void;
  onSelectOp: (op: ProductionOrder) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  productionOrders,
  config,
  onNavigate,
  onNewOrder,
  onSelectOp
}) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  const activeOrders = productionOrders.filter(
    (o) => o.status === 'in_progress' || o.status === 'planned' || o.status === 'paused'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Technical Responsible and Quick Status */}
      <div className="bg-gradient-to-r from-[#170e28] via-[#24133f] to-[#170e28] rounded-2xl p-6 text-white shadow-xl shadow-purple-950/20 border border-purple-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/25 text-purple-200 border border-purple-400/30">
              PCP & Controle Operacional
            </span>
            <span className="text-xs text-purple-400/60">|</span>
            <span className="text-xs text-purple-200/80 font-mono">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
            Controle de Produção Fabril
          </h1>
          <div className="flex items-center gap-2 text-xs text-purple-200/90 pt-1">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Responsável Técnico Titular:{' '}
              <strong className="text-white font-semibold">
                {stats.technicalResponsible}
              </strong>{' '}
              ({stats.technicalRegistration})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('production-orders')}
            className="px-4 py-2 text-xs font-semibold bg-[#2e1950] hover:bg-[#3d216a] text-purple-200 rounded-xl border border-purple-700/60 transition-colors shadow-xs"
          >
            Ver Kanban de Produção
          </button>
          <button
            onClick={onNewOrder}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-600/40 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Nova OP
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ordens em Andamento */}
        <div
          onClick={() => onNavigate('production-orders')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Em Produção Ativa
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.productionOrders.inProgress}
            </span>
            <span className="text-xs text-slate-500">
              de {stats.productionOrders.total} ordens
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>{stats.productionOrders.planned} planejadas • {stats.productionOrders.paused} pausadas</span>
          </div>
        </div>

        {/* Card 2: Total Produzido */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Unidades Finalizadas
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.productionTotals.producedUnits}
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats.productionOrders.completed} OPs concluídas
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Todas baixadas com dedução de estoque
          </div>
        </div>

        {/* Card 3: Ocupação da Capacidade */}
        <div
          onClick={() => onNavigate('capacity')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ocupação da Fábrica
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.productionTotals.occupancyRatePercent}%
            </span>
            <span className="text-xs text-slate-500">
              {stats.productionTotals.activeLoadHours}h de carga
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.productionTotals.occupancyRatePercent > 90
                  ? 'bg-rose-500'
                  : stats.productionTotals.occupancyRatePercent > 70
                  ? 'bg-amber-500'
                  : 'bg-purple-600'
              }`}
              style={{ width: `${Math.min(100, stats.productionTotals.occupancyRatePercent)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Matérias-Primas Críticas */}
        <div
          onClick={() => onNavigate('raw-materials')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Estoque de Insumos
            </span>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                stats.rawMaterials.criticalCount > 0
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {stats.rawMaterials.criticalCount > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Boxes className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold ${
                stats.rawMaterials.criticalCount > 0 ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {stats.rawMaterials.criticalCount}
            </span>
            <span className="text-xs text-slate-500">
              insumos abaixo do mínimo
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {stats.rawMaterials.totalCount} matérias-primas cadastradas
          </div>
        </div>
      </div>

      {/* Main Grid: Active Production Orders & Raw Material Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Production Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Ordens de Produção em Andamento & Fila
              </h2>
              <p className="text-xs text-slate-500">
                Acompanhamento em tempo real das OPs ativas no chão de fábrica
              </p>
            </div>
            <button
              onClick={() => onNavigate('production-orders')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              Ver Todas <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma ordem de produção em andamento no momento.</p>
              <button
                onClick={onNewOrder}
                className="mt-3 text-xs font-semibold text-purple-600 hover:underline"
              >
                + Emitir primeira Ordem de Produção
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeOrders.slice(0, 5).map((op) => {
                const progressPct =
                  op.quantity > 0 ? Math.round((op.producedQuantity / op.quantity) * 100) : 0;
                const hasStockIssue = op.bomRequirements?.some((b) => !b.hasEnoughStock);

                return (
                  <div
                    key={op.id}
                    onClick={() => onSelectOp(op)}
                    className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-lg px-2 -mx-2 transition-colors cursor-pointer group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {op.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            op.status === 'in_progress'
                              ? 'bg-purple-100 text-purple-800'
                              : op.status === 'paused'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {op.status === 'in_progress'
                            ? 'Em Andamento'
                            : op.status === 'paused'
                            ? 'Pausada'
                            : 'Planejada'}
                        </span>
                        {hasStockIssue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Falta Insumo
                          </span>
                        )}
                        {op.clientName && (
                          <span className="text-xs text-slate-500">
                            Cliente: {op.clientName}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">
                        {op.productName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Qtd: <strong>{op.producedQuantity} / {op.quantity}</strong> un</span>
                        <span>•</span>
                        <span>Prazo: {op.expectedEndDate ? new Date(op.expectedEndDate).toLocaleDateString('pt-BR') : 'Sem prazo'}</span>
                        <span>•</span>
                        <span>Ciclo est.: {op.estimatedCycleTimeHours}h</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-44 text-right space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>Progresso</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            op.status === 'completed'
                              ? 'bg-emerald-500'
                              : op.status === 'paused'
                              ? 'bg-amber-500'
                              : 'bg-purple-600'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-purple-600 font-medium group-hover:underline">
                        Abrir detalhes & Baixa →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Insumos Críticos & Ações Rápidas */}
        <div className="space-y-6">
          {/* Critical Raw Materials Alert Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800">
                  Reposição de Matéria-Prima
                </h3>
              </div>
              <button
                onClick={() => onNavigate('raw-materials')}
                className="text-xs font-semibold text-purple-600 hover:underline"
              >
                Gerenciar
              </button>
            </div>

            {stats.rawMaterials.criticalCount === 0 ? (
              <div className="py-4 text-center text-xs text-emerald-600 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Nenhum insumo em nível crítico no momento.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.rawMaterials.criticalItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-[11px] text-amber-800">
                        Estoque atual: <strong>{item.currentStock} {item.unit}</strong> (Mínimo: {item.minStock})
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                      Crítico
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Atalhos Rápidos */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Atalhos Operacionais</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('products')}
                className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-purple-400 hover:text-purple-600 text-left font-medium transition-all shadow-xs"
              >
                <Package className="w-4 h-4 mb-1 text-slate-600" />
                Fichas Técnicas (BOM)
              </button>
              <button
                onClick={() => onNavigate('orders')}
                className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-purple-400 hover:text-purple-600 text-left font-medium transition-all shadow-xs"
              >
                <ClipboardList className="w-4 h-4 mb-1 text-slate-600" />
                Pedidos de Clientes
              </button>
              <button
                onClick={() => onNavigate('process-times')}
                className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-purple-400 hover:text-purple-600 text-left font-medium transition-all shadow-xs"
              >
                <Clock className="w-4 h-4 mb-1 text-slate-600" />
                Tempos de Processo
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-purple-400 hover:text-purple-600 text-left font-medium transition-all shadow-xs"
              >
                <Gauge className="w-4 h-4 mb-1 text-slate-600" />
                Relatórios Oficiais
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
