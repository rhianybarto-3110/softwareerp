import React, { useState } from 'react';
import {
  ProductionOrder,
  CompanyConfig,
  DashboardStats,
  Product,
  RawMaterial
} from '../types';
import {
  FileBarChart,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Gauge,
  ShieldCheck,
  TrendingUp,
  Boxes,
  Calendar,
  Filter
} from 'lucide-react';

interface ReportsModuleProps {
  productionOrders: ProductionOrder[];
  products: Product[];
  rawMaterials: RawMaterial[];
  config: CompanyConfig;
  stats: DashboardStats | null;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  productionOrders,
  products,
  rawMaterials,
  config,
  stats
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'quarter'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const completedOps = productionOrders.filter((o) => o.status === 'completed');

  const filteredOrders = productionOrders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    return true;
  });

  const totalProducedUnits = completedOps.reduce(
    (sum, o) => sum + (o.producedQuantity || o.quantity),
    0
  );
  const totalScrapUnits = completedOps.reduce(
    (sum, o) => sum + (o.scrapQuantity || 0),
    0
  );
  const totalProductionHours = completedOps.reduce(
    (sum, o) => sum + (o.estimatedCycleTimeHours || 0),
    0
  );

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = [
      'Numero_OP',
      'Codigo_Produto',
      'Nome_Produto',
      'Cliente',
      'Qtd_Planejada',
      'Qtd_Produzida',
      'Refugo',
      'Status',
      'Data_Inicio',
      'Data_Conclusao',
      'Horas_Ciclo',
      'Responsavel_Tecnico',
      'Registro_Profissional'
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.productCode}"`,
      `"${o.productName.replace(/"/g, '""')}"`,
      `"${(o.clientName || 'Estoque').replace(/"/g, '""')}"`,
      o.quantity,
      o.producedQuantity || 0,
      o.scrapQuantity || 0,
      `"${o.status}"`,
      `"${o.startDate || ''}"`,
      `"${o.actualEndDate || o.completedAt || ''}"`,
      o.estimatedCycleTimeHours || 0,
      `"${(o.technicalResponsible || config.technicalResponsible).replace(/"/g, '""')}"`,
      `"${(o.technicalRegistration || config.technicalRegistration).replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `relatorio_producao_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-800">
              Relatórios de Acompanhamento da Produção
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Análise consolidada de desempenho fabril, rastreabilidade e laudo assinado pelo Responsável Técnico
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-purple-600" />
            Exportar Dados (CSV / Excel)
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório Oficial
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS (Hidden when printing) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Filtrar por Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="all">Todas as Ordens ({productionOrders.length})</option>
            <option value="completed">Concluídas / Baixadas ({completedOps.length})</option>
            <option value="in_progress">Em Andamento</option>
            <option value="planned">Planejadas</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Mostrando <strong>{filteredOrders.length}</strong> ordens de produção
        </div>
      </div>

      {/* REPORT CONTENT WRAPPER (Printable Document) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Formal Report Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black uppercase tracking-tight text-slate-900">
                {config.companyName}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              CNPJ: {config.cnpj} • {config.city}/{config.state}
            </p>
            <p className="text-xs font-bold text-purple-900 mt-1 uppercase">
              Relatório Gerencial de Produção & Laudo Operacional
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              Data de Emissão do Relatório
            </span>
            <span className="font-mono text-xs font-bold text-slate-800">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
              NexusERP Sistema Auditado
            </span>
          </div>
        </div>

        {/* Executive Summary Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Total Concluído
            </span>
            <span className="text-2xl font-black text-slate-900">
              {totalProducedUnits} un
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
              {completedOps.length} OPs finalizadas
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Tempo Total Usinado
            </span>
            <span className="text-2xl font-black text-slate-900">
              {totalProductionHours.toFixed(1)} h
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Horas úteis dedicadas
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Índice de Refugo
            </span>
            <span className="text-2xl font-black text-slate-900">
              {totalScrapUnits} un
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Perdas registradas
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Eficiência Média
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {stats?.productionTotals.occupancyRatePercent || 88}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Aproveitamento de capacidade
            </span>
          </div>
        </div>

        {/* Detailed Table of Orders */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            Rastreabilidade e Histórico de Ordens de Produção
          </h3>
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-700">
                  <th className="p-2.5">OP</th>
                  <th className="p-2.5">Produto Fabricado</th>
                  <th className="p-2.5">Cliente / Destino</th>
                  <th className="p-2.5 text-center">Programado</th>
                  <th className="p-2.5 text-center">Produzido</th>
                  <th className="p-2.5 text-center">Refugo</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Conclusão</th>
                  <th className="p-2.5">Resp. Técnico Baixa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-slate-400">
                      Nenhuma ordem de produção encontrada para os filtros.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        {o.orderNumber}
                      </td>
                      <td className="p-2.5">
                        <strong className="text-slate-900 block">{o.productName}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {o.productCode}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-700">
                        {o.clientName || 'Estoque Interno'}
                      </td>
                      <td className="p-2.5 text-center font-semibold">
                        {o.quantity} un
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-900">
                        {o.producedQuantity || 0} un
                      </td>
                      <td className="p-2.5 text-center text-slate-600">
                        {o.scrapQuantity || 0} un
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            o.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'in_progress'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {o.status === 'completed'
                            ? 'Concluída'
                            : o.status === 'in_progress'
                            ? 'Em Andamento'
                            : o.status === 'paused'
                            ? 'Pausada'
                            : 'Planejada'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600 font-mono">
                        {o.actualEndDate
                          ? new Date(o.actualEndDate).toLocaleDateString('pt-BR')
                          : o.expectedEndDate
                          ? new Date(o.expectedEndDate).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="p-2.5 text-slate-700 truncate max-w-[140px]">
                        {o.completedBy || o.technicalResponsible || config.technicalResponsible}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESPONSABILIDADE TÉCNICA FORMAL COM ASSINATURA */}
        <div className="pt-8 border-t-2 border-slate-900 mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 uppercase">Declaração de Conformidade:</p>
            <p className="text-[11px] leading-relaxed">
              Certifico que todos os processos de fabricação, fichas técnicas e consumos de matérias-primas descritos neste relatório foram executados sob as normas industriais vigentes e com total rastreabilidade no sistema ERP.
            </p>
          </div>

          <div className="text-center pt-8 border-t border-slate-900">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              <p className="font-extrabold text-slate-900 text-sm">
                {config.technicalResponsible}
              </p>
            </div>
            <p className="text-xs font-semibold text-slate-700">{config.technicalRole}</p>
            <p className="text-xs font-mono text-slate-600">
              Registro: <strong>{config.technicalRegistration}</strong>
            </p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
              Responsável Técnico Titular
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
