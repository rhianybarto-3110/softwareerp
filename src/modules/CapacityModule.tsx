import React, { useState } from 'react';
import { WorkCenter, ProductionOrder } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Gauge,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  Activity,
  Wrench
} from 'lucide-react';

interface CapacityModuleProps {
  capacities: WorkCenter[];
  productionOrders: ProductionOrder[];
  onRefresh: () => void;
}

export const CapacityModule: React.FC<CapacityModuleProps> = ({
  capacities,
  productionOrders,
  onRefresh
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState<WorkCenter | null>(null);
  const [deletingCapacity, setDeletingCapacity] = useState<WorkCenter | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    department: string;
    dailyHours: number;
    operatorCount: number;
    nominalCapacityUnitsPerDay: number;
    efficiencyRate: number;
    status: 'active' | 'maintenance' | 'idle';
    notes: string;
  }>({
    code: '',
    name: '',
    department: 'Usinagem & Fabricação',
    dailyHours: 8,
    operatorCount: 2,
    nominalCapacityUnitsPerDay: 20,
    efficiencyRate: 85,
    status: 'active',
    notes: ''
  });

  // Calculate factory aggregate metrics
  const activePostos = capacities.filter((c) => c.status === 'active');
  const totalDailyAvailableHours = activePostos.reduce(
    (sum, c) => sum + c.dailyHours * c.operatorCount,
    0
  );
  const totalActiveOperators = activePostos.reduce((sum, c) => sum + c.operatorCount, 0);

  // Active production hours in backlog
  const activeOrders = productionOrders.filter(
    (o) => o.status === 'in_progress' || o.status === 'planned'
  );
  const totalBacklogHours = activeOrders.reduce(
    (sum, o) => sum + (o.estimatedCycleTimeHours || 0),
    0
  );

  const daysToClearBacklog =
    totalDailyAvailableHours > 0
      ? (totalBacklogHours / totalDailyAvailableHours).toFixed(1)
      : '0';

  const handleOpenCreate = () => {
    setEditingCapacity(null);
    setFormData({
      code: `PST-0${capacities.length + 1}`,
      name: '',
      department: 'Montagem & Usinagem',
      dailyHours: 8,
      operatorCount: 2,
      nominalCapacityUnitsPerDay: 20,
      efficiencyRate: 85,
      status: 'active',
      notes: ''
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: WorkCenter) => {
    setEditingCapacity(c);
    setFormData({
      code: c.code,
      name: c.name,
      department: c.department,
      dailyHours: c.dailyHours,
      operatorCount: c.operatorCount,
      nominalCapacityUnitsPerDay: c.nominalCapacityUnitsPerDay,
      efficiencyRate: c.efficiencyRate,
      status: c.status,
      notes: c.notes || ''
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setErrorMessage('Código e nome do posto são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingCapacity) {
        await api.updateCapacity(editingCapacity.id, formData);
      } else {
        await api.createCapacity(formData);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar capacidade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCapacity) return;
    setIsDeleting(true);
    try {
      await api.deleteCapacity(deletingCapacity.id);
      setDeletingCapacity(null);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-800">
              Capacidade Produtiva & Postos de Trabalho
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo de carga de máquina, operadores disponíveis e horas úteis de fabricação
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Novo Posto / Linha de Produção
        </button>
      </div>

      {/* Aggregate Indicators Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Capacidade Total Diária
            </span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalDailyAvailableHours} horas
            </span>
            <span className="text-xs text-slate-500">/ dia fabril</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Soma de horas operacionais com operadores ativos
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Operadores Alocados
            </span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalActiveOperators} profissionais
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Distribuídos em {activePostos.length} postos ativos
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Carga Pendente (Backlog)
            </span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalBacklogHours} horas
            </span>
            <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
              ~{daysToClearBacklog} dias úteis
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {activeOrders.length} ordens de produção em carteira
          </p>
        </div>
      </div>

      {/* Grid of Work Centers / Capacities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {capacities.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {item.code}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{item.name}</h3>
                <span className="text-xs text-slate-500">{item.department}</span>
              </div>

              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  item.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.status === 'maintenance'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {item.status === 'active'
                  ? 'Operacional'
                  : item.status === 'maintenance'
                  ? 'Manutenção'
                  : 'Ocioso'}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Jornada Diária</span>
                <strong className="text-slate-900">{item.dailyHours} horas</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Operadores</span>
                <strong className="text-slate-900">{item.operatorCount} pessoas</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Capacidade Nom.</span>
                <strong className="text-slate-900">{item.nominalCapacityUnitsPerDay} un/dia</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Eficiência OEE</span>
                <strong className="text-emerald-700">{item.efficiencyRate}%</strong>
              </div>
            </div>

            {item.notes && (
              <p className="text-xs text-slate-600 bg-slate-50/50 p-2 rounded">
                <strong>Equipamentos / Notas:</strong> {item.notes}
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Capacidade Disponível:{' '}
                <strong>{(item.dailyHours * item.operatorCount).toFixed(1)} h-homem/dia</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                  title="Editar posto"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingCapacity(item)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: CRIAR / EDITAR CAPACIDADE */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCapacity ? `Editar Posto de Trabalho - ${editingCapacity.code}` : 'Novo Posto de Trabalho / Linha'}
        subtitle="Defina o turno diário, número de operadores e taxa de eficiência estimada"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código do Posto *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Posto / Célula *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Departamento</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Operacional
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="active">Operacional (Ativo)</option>
                <option value="maintenance">Em Manutenção Preventiva / Corretiva</option>
                <option value="idle">Ocioso / Desativado Temporariamente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Horas Úteis por Turno Diário (Horas)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={formData.dailyHours}
                onChange={(e) => setFormData({ ...formData, dailyHours: parseFloat(e.target.value) || 8 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade de Operadores Alocados
              </label>
              <input
                type="number"
                min="1"
                value={formData.operatorCount}
                onChange={(e) => setFormData({ ...formData, operatorCount: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Capacidade Nominal (Unidades / Dia)
              </label>
              <input
                type="number"
                min="1"
                value={formData.nominalCapacityUnitsPerDay}
                onChange={(e) => setFormData({ ...formData, nominalCapacityUnitsPerDay: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Eficiência Operacional Estimada (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.efficiencyRate}
                onChange={(e) => setFormData({ ...formData, efficiencyRate: parseInt(e.target.value) || 85 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Máquinas e Especificações do Posto
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ex: Torno CNC Mazak, Dobradeira Hidráulica Newton, Gabaritos..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : editingCapacity ? 'Atualizar Posto' : 'Cadastrar Posto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDialog
        isOpen={Boolean(deletingCapacity)}
        onClose={() => setDeletingCapacity(null)}
        onConfirm={handleDelete}
        title="Excluir Posto de Trabalho"
        message={`Deseja excluir o posto de capacidade "${deletingCapacity?.name}"?`}
        confirmText="Sim, Excluir"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
