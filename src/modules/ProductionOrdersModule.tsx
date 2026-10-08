import React, { useState } from 'react';
import {
  ProductionOrder,
  Product,
  SalesOrder,
  CompanyConfig,
  ProcessStep
} from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ProductionOrderPrintView } from './ProductionOrderPrintView';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Kanban,
  Table,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Edit2,
  Trash2,
  UserCheck,
  Calendar,
  Box,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ProductionOrdersModuleProps {
  productionOrders: ProductionOrder[];
  products: Product[];
  salesOrders: SalesOrder[];
  processSteps: ProcessStep[];
  config: CompanyConfig;
  onRefresh: () => void;
  initialSelectedOp?: ProductionOrder | null;
  onClearInitialSelectedOp?: () => void;
}

export const ProductionOrdersModule: React.FC<ProductionOrdersModuleProps> = ({
  productionOrders,
  products,
  salesOrders,
  processSteps,
  config,
  onRefresh,
  initialSelectedOp,
  onClearInitialSelectedOp
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [printingOrder, setPrintingOrder] = useState<ProductionOrder | null>(null);

  // Baixa da OP Modal
  const [completingOrder, setCompletingOrder] = useState<ProductionOrder | null>(null);
  const [producedQuantity, setProducedQuantity] = useState<number>(1);
  const [scrapQuantity, setScrapQuantity] = useState<number>(0);
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  // Delete State
  const [deletingOrder, setDeletingOrder] = useState<ProductionOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    productId: string;
    quantity: number;
    salesOrderId: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    startDate: string;
    expectedEndDate: string;
    notes: string;
    technicalResponsible: string;
    technicalRole: string;
    technicalRegistration: string;
  }>({
    productId: products[0]?.id || '',
    quantity: 1,
    salesOrderId: '',
    priority: 'normal',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    notes: '',
    technicalResponsible: config.technicalResponsible,
    technicalRole: config.technicalRole,
    technicalRegistration: config.technicalRegistration
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Handle opening form
  const handleOpenCreate = () => {
    setEditingOrder(null);
    setFormData({
      productId: products[0]?.id || '',
      quantity: 1,
      salesOrderId: '',
      priority: 'normal',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      notes: '',
      technicalResponsible: config.technicalResponsible,
      technicalRole: config.technicalRole,
      technicalRegistration: config.technicalRegistration
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (order: ProductionOrder) => {
    setEditingOrder(order);
    setFormData({
      productId: order.productId,
      quantity: order.quantity,
      salesOrderId: order.salesOrderId || '',
      priority: order.priority || 'normal',
      startDate: order.startDate || new Date().toISOString().split('T')[0],
      expectedEndDate: order.expectedEndDate,
      notes: order.notes || '',
      technicalResponsible: order.technicalResponsible || config.technicalResponsible,
      technicalRole: order.technicalRole || config.technicalRole,
      technicalRegistration: order.technicalRegistration || config.technicalRegistration
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || formData.quantity <= 0) {
      setFormError('Selecione um produto e informe uma quantidade válida.');
      return;
    }

    setIsSubmittingForm(true);
    setFormError(null);

    try {
      if (editingOrder) {
        await api.updateProductionOrder(editingOrder.id, {
          productId: formData.productId,
          quantity: formData.quantity,
          salesOrderId: formData.salesOrderId || undefined,
          priority: formData.priority,
          startDate: formData.startDate,
          expectedEndDate: formData.expectedEndDate,
          notes: formData.notes,
          technicalResponsible: formData.technicalResponsible,
          technicalRole: formData.technicalRole,
          technicalRegistration: formData.technicalRegistration
        });
      } else {
        await api.createProductionOrder({
          productId: formData.productId,
          quantity: formData.quantity,
          salesOrderId: formData.salesOrderId || undefined,
          priority: formData.priority,
          startDate: formData.startDate,
          expectedEndDate: formData.expectedEndDate,
          notes: formData.notes,
          technicalResponsible: formData.technicalResponsible,
          technicalRole: formData.technicalRole,
          technicalRegistration: formData.technicalRegistration
        });
      }
      setIsFormModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar ordem de produção');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Status transitions
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateProductionOrderStatus(orderId, newStatus);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  // Baixa / Conclusão
  const handleOpenCompleteModal = (order: ProductionOrder) => {
    setCompletingOrder(order);
    setProducedQuantity(order.quantity);
    setScrapQuantity(0);
    setCompletionNotes('');
  };

  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingOrder) return;

    setIsSubmittingCompletion(true);
    try {
      await api.completeProductionOrder(completingOrder.id, {
        producedQuantity: Number(producedQuantity),
        scrapQuantity: Number(scrapQuantity) || 0,
        notes: completionNotes,
        completedBy: `${config.technicalResponsible} (${config.technicalRegistration})`
      });
      setCompletingOrder(null);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao dar baixa na ordem: ' + err.message);
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      await api.deleteProductionOrder(deletingOrder.id);
      setDeletingOrder(null);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao excluir ordem: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered orders
  const filteredOrders = productionOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.clientName && order.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Kanban Columns
  const kanbanColumns: { id: ProductionOrder['status']; title: string; color: string; badgeBg: string }[] = [
    { id: 'planned', title: 'Planejadas', color: 'border-slate-300', badgeBg: 'bg-slate-100 text-slate-700' },
    { id: 'in_progress', title: 'Em Andamento', color: 'border-purple-400', badgeBg: 'bg-purple-100 text-purple-800' },
    { id: 'paused', title: 'Pausadas', color: 'border-amber-400', badgeBg: 'bg-amber-100 text-amber-800' },
    { id: 'completed', title: 'Concluídas / Baixadas', color: 'border-emerald-400', badgeBg: 'bg-emerald-100 text-emerald-800' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-800">
              Ordens de Produção (OP)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão, roteamento de chão de fábrica, acompanhamento de status e baixa técnica com controle de estoque
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Tabela
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Emitir Nova OP
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por OP, produto ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500 shrink-0"
          >
            <option value="all">Todos os Status ({productionOrders.length})</option>
            <option value="planned">Planejada</option>
            <option value="in_progress">Em Andamento</option>
            <option value="paused">Pausada</option>
            <option value="completed">Concluída (Baixada)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500 shrink-0"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const columnOrders = filteredOrders.filter((o) => o.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/90 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{col.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                      {columnOrders.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnOrders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg">
                      Nenhuma OP nesta etapa
                    </div>
                  ) : (
                    columnOrders.map((order) => {
                      const hasStockIssue = order.bomRequirements?.some((b) => !b.hasEnoughStock);
                      const progressPct =
                        order.quantity > 0
                          ? Math.round((order.producedQuantity / order.quantity) * 100)
                          : 0;

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-2.5"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              {order.orderNumber}
                            </span>
                            <div className="flex items-center gap-1">
                              {order.priority === 'urgent' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                                  Urgente
                                </span>
                              )}
                              {order.priority === 'high' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                  Alta
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Product Info */}
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">
                              {order.productName}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {order.productCode}
                            </p>
                          </div>

                          {/* Details & Dates */}
                          <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded">
                            <div className="flex justify-between">
                              <span>Qtd Programada:</span>
                              <strong>{order.quantity} un</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Qtd Apontada:</span>
                              <strong>{order.producedQuantity} un ({progressPct}%)</strong>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Prazo Final:</span>
                              <span>
                                {order.expectedEndDate
                                  ? new Date(order.expectedEndDate).toLocaleDateString('pt-BR')
                                  : '-'}
                              </span>
                            </div>
                            {order.clientName && (
                              <div className="flex justify-between text-purple-700 font-medium truncate">
                                <span>Cliente:</span>
                                <span className="truncate max-w-[120px]">{order.clientName}</span>
                              </div>
                            )}
                          </div>

                          {/* Raw Material Stock Check Badge */}
                          {order.status !== 'completed' && (
                            <div>
                              {hasStockIssue ? (
                                <div className="p-1.5 rounded bg-rose-50 border border-rose-200 text-[10px] text-rose-700 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                  <span>Falta estoque de matéria-prima!</span>
                                </div>
                              ) : (
                                <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 flex items-center gap-1">
                                  <Check className="w-3 h-3 shrink-0" />
                                  <span>Matéria-prima disponível</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Completed Details */}
                          {order.status === 'completed' && order.completedAt && (
                            <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 space-y-0.5">
                              <p className="font-semibold">
                                ✓ Baixa concluída em: {new Date(order.completedAt).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-slate-600 truncate">
                                Por: {order.completedBy || config.technicalResponsible}
                              </p>
                            </div>
                          )}

                          {/* Actions Footer */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              {/* Print Button */}
                              <button
                                onClick={() => setPrintingOrder(order)}
                                className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                title="Imprimir Ordem de Produção (Folha de Chão de Fábrica)"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              {/* Edit Button */}
                              {order.status !== 'completed' && (
                                <button
                                  onClick={() => handleOpenEdit(order)}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                  title="Editar OP"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {/* Delete Button */}
                              <button
                                onClick={() => setDeletingOrder(order)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Excluir OP"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Status Transition Quick Action Buttons */}
                            <div className="flex items-center gap-1">
                              {order.status === 'planned' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                                  className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold rounded shadow-xs transition-colors"
                                >
                                  <Play className="w-3 h-3" /> Iniciar
                                </button>
                              )}
                              {order.status === 'in_progress' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, 'paused')}
                                    className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                    title="Pausar Produção"
                                  >
                                    <Pause className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenCompleteModal(order)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded shadow-xs"
                                    title="Dar Baixa e Atualizar Estoque"
                                  >
                                    <CheckCircle2 className="w-3 h-3" /> Dar Baixa
                                  </button>
                                </>
                              )}
                              {order.status === 'paused' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                                  className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold rounded shadow-xs transition-colors"
                                >
                                  <Play className="w-3 h-3" /> Retomar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-3.5">Número OP</th>
                  <th className="p-3.5">Produto</th>
                  <th className="p-3.5">Quantidade</th>
                  <th className="p-3.5">Cliente / Pedido</th>
                  <th className="p-3.5">Prazo Entrega</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Resp. Técnico</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Nenhuma ordem de produção encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const progressPct =
                      order.quantity > 0
                        ? Math.round((order.producedQuantity / order.quantity) * 100)
                        : 0;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {order.orderNumber}
                        </td>
                        <td className="p-3.5">
                          <strong className="text-slate-900 block">{order.productName}</strong>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {order.productCode}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-900">
                            {order.producedQuantity} / {order.quantity} un
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            ({progressPct}%)
                          </span>
                        </td>
                        <td className="p-3.5">
                          {order.clientName ? (
                            <div>
                              <p className="font-medium text-slate-800">{order.clientName}</p>
                              <span className="text-[10px] text-slate-500">
                                {order.salesOrderNumber || 'Pedido vinculado'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Estoque Interno</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {order.expectedEndDate
                            ? new Date(order.expectedEndDate).toLocaleDateString('pt-BR')
                            : '-'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                              order.status === 'in_progress'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'paused'
                                ? 'bg-amber-100 text-amber-800'
                                : order.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.status === 'in_progress'
                              ? 'Em Andamento'
                              : order.status === 'paused'
                              ? 'Pausada'
                              : order.status === 'completed'
                              ? 'Concluída'
                              : 'Planejada'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 truncate max-w-[160px]">
                          {order.technicalResponsible || config.technicalResponsible}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPrintingOrder(order)}
                              className="p-1.5 text-slate-500 hover:text-purple-600 rounded"
                              title="Imprimir OP"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            {order.status === 'in_progress' && (
                              <button
                                onClick={() => handleOpenCompleteModal(order)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded flex items-center gap-1 shadow-xs"
                                title="Dar Baixa"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Baixa
                              </button>
                            )}
                            {order.status !== 'completed' && (
                              <button
                                onClick={() => handleOpenEdit(order)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setDeletingOrder(order)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR OU EDITAR ORDEM DE PRODUÇÃO */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingOrder ? `Editar Ordem de Produção - ${editingOrder.orderNumber}` : 'Emitir Nova Ordem de Produção'}
        subtitle="Vincule ao produto, defina a quantidade planejada e confira os requisitos de matéria-prima"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Produto a Fabricar (Ficha Técnica) *
              </label>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} (Estoque atual: {p.currentStock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade a Produzir *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridade da Ordem
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Início Prevista
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Término Prevista (Prazo) *
              </label>
              <input
                type="date"
                required
                value={formData.expectedEndDate}
                onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vincular a Pedido de Venda (Opcional)
              </label>
              <select
                value={formData.salesOrderId}
                onChange={(e) => setFormData({ ...formData, salesOrderId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Produção para Estoque (Sem pedido vinculado)</option>
                {salesOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.clientName} (Entrega: {new Date(o.deliveryDate).toLocaleDateString('pt-BR')})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Responsável Técnico Designado
              </label>
              <div className="p-2.5 bg-purple-50/60 rounded-lg border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">{formData.technicalResponsible}</span>
                  <span className="text-slate-600 block text-[11px]">
                    {formData.technicalRole} • {formData.technicalRegistration}
                  </span>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instruções / Observações de Fabricação
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ex: Utilizar gabarito de furação G-04. Atenção especial à pintura RAL 7035."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingForm}
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs disabled:opacity-50"
            >
              {isSubmittingForm ? 'Salvando...' : editingOrder ? 'Atualizar OP' : 'Emitir Ordem de Produção'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DAR BAIXA NA ORDEM DE PRODUÇÃO (CONCLUSÃO E BAIXA DE ESTOQUE) */}
      <Modal
        isOpen={Boolean(completingOrder)}
        onClose={() => setCompletingOrder(null)}
        title={`Dar Baixa na Ordem de Produção - ${completingOrder?.orderNumber}`}
        subtitle="A baixa confirmará as unidades finalizadas, debitará automaticamente os insumos do estoque e creditará o produto acabado."
        maxWidth="lg"
      >
        {completingOrder && (
          <form onSubmit={handleConfirmComplete} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
              <p className="font-semibold text-emerald-950">
                Produto: {completingOrder.productName} ({completingOrder.productCode})
              </p>
              <p className="text-[11px] text-emerald-800 mt-1">
                Quantidade programada na emissão: <strong>{completingOrder.quantity} unidades</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade Concluída com Sucesso *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={producedQuantity}
                  onChange={(e) => setProducedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Refugo / Peças Perdidas
                </label>
                <input
                  type="number"
                  min="0"
                  value={scrapQuantity}
                  onChange={(e) => setScrapQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Insumos a serem baixados automaticamente */}
            <div>
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Insumos que serão deduzidos do almoxarifado:
              </span>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {completingOrder.bomRequirements?.map((item, i) => (
                  <div key={i} className="p-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{item.rawMaterialName}</p>
                      <span className="text-[10px] text-slate-500">Estoque atual: {item.currentStock} {item.unit}</span>
                    </div>
                    <span className="font-bold text-rose-600">
                      - {(item.requiredQuantity * (producedQuantity / completingOrder.quantity)).toFixed(2)} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Responsável Técnico Pela Baixa
              </label>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>{config.technicalResponsible}</strong> • {config.technicalRegistration}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações de Encerramento (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Peças inspecionadas e liberadas sem não conformidades."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompletingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingCompletion}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmittingCompletion ? 'Confirmando Baixa...' : 'Confirmar Baixa e Atualizar Estoques'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL DE IMPRESSÃO DA ORDEM DE PRODUÇÃO */}
      {printingOrder && (
        <ProductionOrderPrintView
          order={printingOrder}
          product={products.find((p) => p.id === printingOrder.productId)}
          processSteps={processSteps}
          config={config}
          onClose={() => setPrintingOrder(null)}
        />
      )}

      {/* DIÁLOGO DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDialog
        isOpen={Boolean(deletingOrder)}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Ordem de Produção"
        message={`Tem certeza que deseja excluir a ordem de produção ${deletingOrder?.orderNumber}? Esta ação não pode ser desfeita.`}
        confirmText="Sim, Excluir"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
