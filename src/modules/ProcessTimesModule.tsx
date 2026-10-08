import React, { useState } from 'react';
import { ProcessStep, Product, WorkCenter } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  Layers,
  Gauge,
  FileText
} from 'lucide-react';

interface ProcessTimesModuleProps {
  processSteps: ProcessStep[];
  products: Product[];
  capacities: WorkCenter[];
  onRefresh: () => void;
}

export const ProcessTimesModule: React.FC<ProcessTimesModuleProps> = ({
  processSteps,
  products,
  capacities,
  onRefresh
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
  const [deletingStep, setDeletingStep] = useState<ProcessStep | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    productId: string;
    stepOrder: number;
    name: string;
    workCenterId: string;
    setupTimeMinutes: number;
    operationTimeMinutes: number;
    description: string;
  }>({
    productId: selectedProductId || products[0]?.id || '',
    stepOrder: 1,
    name: '',
    workCenterId: capacities[0]?.id || '',
    setupTimeMinutes: 10,
    operationTimeMinutes: 30,
    description: ''
  });

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const stepsForSelected = processSteps
    .filter((s) => s.productId === selectedProductId)
    .sort((a, b) => a.stepOrder - b.stepOrder);

  const totalCycleMinutes = stepsForSelected.reduce(
    (sum, s) => sum + s.operationTimeMinutes,
    0
  );
  const totalSetupMinutes = stepsForSelected.reduce(
    (sum, s) => sum + s.setupTimeMinutes,
    0
  );

  const handleOpenCreate = () => {
    setEditingStep(null);
    setFormData({
      productId: selectedProductId,
      stepOrder: stepsForSelected.length + 1,
      name: '',
      workCenterId: capacities[0]?.id || '',
      setupTimeMinutes: 10,
      operationTimeMinutes: 30,
      description: ''
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (step: ProcessStep) => {
    setEditingStep(step);
    setFormData({
      productId: step.productId,
      stepOrder: step.stepOrder,
      name: step.name,
      workCenterId: step.workCenterId,
      setupTimeMinutes: step.setupTimeMinutes,
      operationTimeMinutes: step.operationTimeMinutes,
      description: step.description
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.workCenterId) {
      setErrorMessage('Nome da etapa e posto de trabalho são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingStep) {
        await api.updateProcessStep(editingStep.id, formData);
      } else {
        await api.createProcessStep(formData);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar etapa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStep) return;
    setIsDeleting(true);
    try {
      await api.deleteProcessStep(deletingStep.id);
      setDeletingStep(null);
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
            <Clock className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-800">
              Tempo de Processo & Roteiro de Fabricação
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Definição de tempos padrão de operação, setup e balanceamento de postos por produto
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={!selectedProductId}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Adicionar Etapa ao Roteiro
        </button>
      </div>

      {/* Product Selector Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Layers className="w-5 h-5 text-purple-600 shrink-0" />
          <div className="w-full sm:w-auto">
            <label className="block text-[11px] font-bold uppercase text-slate-400">
              Selecione o Produto para visualizar o roteiro:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mt-1 px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 w-full sm:w-96 text-slate-800"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedProduct && (
          <div className="flex items-center gap-4 text-xs bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Tempo Operação</span>
              <strong className="text-slate-900 font-extrabold text-sm">{totalCycleMinutes} min</strong>
            </div>
            <div className="border-l border-slate-300 pl-4">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Tempo Setup</span>
              <strong className="text-slate-900 font-extrabold text-sm">{totalSetupMinutes} min</strong>
            </div>
            <div className="border-l border-slate-300 pl-4">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Ciclo</span>
              <strong className="text-purple-600 font-extrabold text-sm">
                {((totalCycleMinutes + totalSetupMinutes) / 60).toFixed(1)} horas
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Steps List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-800">
            Sequência Operacional: {selectedProduct?.name} ({selectedProduct?.code})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {stepsForSelected.length} etapas cadastradas
          </span>
        </div>

        {stepsForSelected.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Nenhuma etapa de processo cadastrada para este produto.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-2 text-xs font-semibold text-purple-600 hover:underline"
            >
              + Cadastrar primeira etapa de fabricação
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {stepsForSelected.map((step, idx) => (
              <div
                key={step.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {step.stepOrder}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
                      {step.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded">
                        Posto: {step.workCenterName}
                      </span>
                    </div>
                    {step.description && (
                      <p className="text-xs text-slate-600 mt-2 bg-white p-2 rounded border border-slate-100 leading-relaxed">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Tempos de Fabricação
                    </span>
                    <div className="text-xs text-slate-700">
                      Setup: <strong>{step.setupTimeMinutes} min</strong> • Operação:{' '}
                      <strong className="text-purple-700">{step.operationTimeMinutes} min/un</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(step)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      title="Editar etapa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingStep(step)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Excluir etapa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: CRIAR / EDITAR ETAPA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStep ? `Editar Etapa #${editingStep.stepOrder}` : 'Nova Etapa de Processo'}
        subtitle={`Produto: ${selectedProduct?.name}`}
        maxWidth="xl"
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
                Sequência / Ordem *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.stepOrder}
                onChange={(e) => setFormData({ ...formData, stepOrder: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Posto de Trabalho Vinculado *
              </label>
              <select
                required
                value={formData.workCenterId}
                onChange={(e) => setFormData({ ...formData, workCenterId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {capacities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da Operação / Etapa *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Corte a Laser, Solda TIG, Pintura Eletrostática, Teste Elétrico"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tempo de Setup / Preparação (Minutos)
              </label>
              <input
                type="number"
                min="0"
                value={formData.setupTimeMinutes}
                onChange={(e) => setFormData({ ...formData, setupTimeMinutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tempo de Operação Unitário (Minutos / Unidade) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.operationTimeMinutes}
                onChange={(e) => setFormData({ ...formData, operationTimeMinutes: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instruções Operacionais e Parâmetros Técnicos
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Ajustar corrente em 120A, verificar esquadrejamento com goniômetro digital, usar luva anti-calor..."
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
              {isSubmitting ? 'Salvando...' : editingStep ? 'Atualizar Etapa' : 'Cadastrar Etapa'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDialog
        isOpen={Boolean(deletingStep)}
        onClose={() => setDeletingStep(null)}
        onConfirm={handleDelete}
        title="Excluir Etapa de Fabricação"
        message={`Deseja excluir a etapa "${deletingStep?.name}"?`}
        confirmText="Sim, Excluir"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
