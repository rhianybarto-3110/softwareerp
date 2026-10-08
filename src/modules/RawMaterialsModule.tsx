import React, { useState } from 'react';
import { RawMaterial, Partner } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  MapPin,
  ArrowUpDown
} from 'lucide-react';

interface RawMaterialsModuleProps {
  rawMaterials: RawMaterial[];
  suppliers: Partner[];
  onRefresh: () => void;
}

export const RawMaterialsModule: React.FC<RawMaterialsModuleProps> = ({
  rawMaterials,
  suppliers,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RawMaterial | null>(null);
  const [deletingItem, setDeletingItem] = useState<RawMaterial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Stock Adjust Modal State
  const [adjustingItem, setAdjustingItem] = useState<RawMaterial | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    category: string;
    unit: string;
    currentStock: number;
    minStock: number;
    unitCost: number;
    supplierId: string;
    location: string;
    notes: string;
  }>({
    code: '',
    name: '',
    category: 'Geral',
    unit: 'KG',
    currentStock: 0,
    minStock: 0,
    unitCost: 0,
    supplierId: '',
    location: '',
    notes: ''
  });

  const categories = Array.from(new Set(rawMaterials.map((r) => r.category))).filter(Boolean);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      code: `MP-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Geral',
      unit: 'KG',
      currentStock: 0,
      minStock: 10,
      unitCost: 0,
      supplierId: suppliers[0]?.id || '',
      location: 'Almoxarifado Geral',
      notes: ''
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RawMaterial) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      currentStock: item.currentStock,
      minStock: item.minStock,
      unitCost: item.unitCost,
      supplierId: item.supplierId || '',
      location: item.location || '',
      notes: item.notes || ''
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.unit) {
      setErrorMessage('Código, nome e unidade são campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const sup = suppliers.find((s) => s.id === formData.supplierId);
    const payload = {
      ...formData,
      supplierName: sup ? sup.name : undefined
    };

    try {
      if (editingItem) {
        await api.updateRawMaterial(editingItem.id, payload);
      } else {
        await api.createRawMaterial(payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar matéria-prima');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await api.deleteRawMaterial(deletingItem.id);
      setDeletingItem(null);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick stock adjustment handler
  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || adjustQty <= 0) return;

    setIsAdjusting(true);
    const diff = adjustType === 'add' ? adjustQty : -adjustQty;
    const newStock = Math.max(0, Number((adjustingItem.currentStock + diff).toFixed(2)));

    try {
      await api.updateRawMaterial(adjustingItem.id, {
        currentStock: newStock
      });
      setAdjustingItem(null);
      setAdjustQty(0);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao ajustar estoque: ' + err.message);
    } finally {
      setIsAdjusting(false);
    }
  };

  // Filtering
  const filteredMaterials = rawMaterials.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    let matchesStock = true;
    if (stockStatusFilter === 'critical') {
      matchesStock = item.currentStock <= item.minStock;
    } else if (stockStatusFilter === 'normal') {
      matchesStock = item.currentStock > item.minStock;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-800">
              Cadastro de Matéria-Prima & Insumos
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de almoxarifado, controle de níveis mínimos de reposição e custos unitários
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Nova Matéria-Prima
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código, insumo ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500 shrink-0"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500 shrink-0"
          >
            <option value="all">Todos os Níveis de Estoque</option>
            <option value="critical">Abaixo do Mínimo (Crítico)</option>
            <option value="normal">Estoque Normal</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3.5">Código</th>
                <th className="p-3.5">Descrição do Insumo</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5 text-right">Estoque Atual</th>
                <th className="p-3.5 text-right">Estoque Mínimo</th>
                <th className="p-3.5 text-right">Custo Unitário</th>
                <th className="p-3.5">Status Almoxarifado</th>
                <th className="p-3.5">Localização / Fornecedor</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Nenhuma matéria-prima encontrada com os filtros informados.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((item) => {
                  const isCritical = item.currentStock <= item.minStock;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {item.code}
                      </td>
                      <td className="p-3.5">
                        <strong className="text-slate-900 block">{item.name}</strong>
                        {item.notes && (
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {item.notes}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <span
                          className={`font-extrabold text-sm ${
                            isCritical ? 'text-amber-600' : 'text-slate-900'
                          }`}
                        >
                          {item.currentStock.toLocaleString('pt-BR')} {item.unit}
                        </span>
                      </td>
                      <td className="p-3.5 text-right text-slate-600">
                        {item.minStock.toLocaleString('pt-BR')} {item.unit}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-slate-800">
                        R$ {item.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            Reposição Urgente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {item.location || 'Sem localização'}
                          </span>
                        </div>
                        {item.supplierName && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                            Fornec: {item.supplierName}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setAdjustingItem(item);
                              setAdjustQty(1);
                              setAdjustType('add');
                            }}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Ajuste rápido de estoque (Inventário/Entrada/Saída)"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
                            title="Editar matéria-prima"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
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

      {/* MODAL: CRIAR / EDITAR MATÉRIA-PRIMA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Editar Matéria-Prima - ${editingItem.code}` : 'Cadastrar Nova Matéria-Prima'}
        subtitle="Informe os dados de almoxarifado, custo e parâmetros de estoque mínimo"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código Insumo *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição do Insumo *
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unidade de Medida *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="KG">KG - Quilograma</option>
                <option value="M">M - Metro</option>
                <option value="M2">M² - Metro Quadrado</option>
                <option value="UN">UN - Unidade</option>
                <option value="L">L - Litro</option>
                <option value="CX">CX - Caixa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custo Unitário (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estoque Atual
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estoque Mínimo (Alerta)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fornecedor Preferencial
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione um fornecedor</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Localização no Almoxarifado
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Almoxarifado A - Prateleira 4B"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações Adicionais
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Especificações do insumo, tolerâncias, fornecedor alternativo..."
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
              {isSubmitting ? 'Salvando...' : editingItem ? 'Atualizar Insumo' : 'Cadastrar Matéria-Prima'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: AJUSTE RÁPIDO DE ESTOQUE (INVENTÁRIO) */}
      <Modal
        isOpen={Boolean(adjustingItem)}
        onClose={() => setAdjustingItem(null)}
        title={`Movimentação de Estoque: ${adjustingItem?.name}`}
        subtitle={`Código: ${adjustingItem?.code} • Estoque Atual: ${adjustingItem?.currentStock} ${adjustingItem?.unit}`}
        maxWidth="md"
      >
        {adjustingItem && (
          <form onSubmit={handleStockAdjustment} className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdjustType('add')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  adjustType === 'add'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                + Entrada de Estoque
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('subtract')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  adjustType === 'subtract'
                    ? 'bg-rose-50 border-rose-500 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                - Saída / Ajuste
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade a {adjustType === 'add' ? 'Adicionar' : 'Retirar'} ({adjustingItem.unit}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={adjustQty}
                onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold text-center"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex justify-between">
              <span>Novo estoque projetado:</span>
              <strong className="text-slate-900 font-bold">
                {(
                  adjustType === 'add'
                    ? adjustingItem.currentStock + adjustQty
                    : Math.max(0, adjustingItem.currentStock - adjustQty)
                ).toFixed(2)}{' '}
                {adjustingItem.unit}
              </strong>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isAdjusting || adjustQty <= 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
              >
                {isAdjusting ? 'Salvando...' : 'Confirmar Ajuste'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Excluir Matéria-Prima"
        message={`Deseja excluir o insumo "${deletingItem?.name}" (${deletingItem?.code})?`}
        confirmText="Sim, Excluir"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
