import React, { useState } from 'react';
import { Product, RawMaterial, BomItem } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  Boxes,
  PlusCircle,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

interface ProductsModuleProps {
  products: Product[];
  rawMaterials: RawMaterial[];
  onRefresh: () => void;
}

export const ProductsModule: React.FC<ProductsModuleProps> = ({
  products,
  rawMaterials,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductView, setSelectedProductView] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    category: string;
    unit: string;
    salePrice: number;
    currentStock: number;
    minStock: number;
    technicalSpecs: string;
    processTimeMinutes: number;
    bom: BomItem[];
  }>({
    code: '',
    name: '',
    category: 'Geral',
    unit: 'UN',
    salePrice: 0,
    currentStock: 0,
    minStock: 0,
    technicalSpecs: '',
    processTimeMinutes: 60,
    bom: []
  });

  // State to add a BOM item inside modal
  const [selectedRawMaterialId, setSelectedRawMaterialId] = useState<string>('');
  const [bomItemQuantity, setBomItemQuantity] = useState<number>(1);

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      code: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Geral',
      unit: 'UN',
      salePrice: 0,
      currentStock: 0,
      minStock: 0,
      technicalSpecs: '',
      processTimeMinutes: 60,
      bom: []
    });
    setSelectedRawMaterialId(rawMaterials[0]?.id || '');
    setBomItemQuantity(1);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      name: p.name,
      category: p.category,
      unit: p.unit,
      salePrice: p.salePrice,
      currentStock: p.currentStock,
      minStock: p.minStock,
      technicalSpecs: p.technicalSpecs,
      processTimeMinutes: p.processTimeMinutes,
      bom: [...p.bom]
    });
    setSelectedRawMaterialId(rawMaterials[0]?.id || '');
    setBomItemQuantity(1);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Add BOM item to list
  const handleAddBomItem = () => {
    if (!selectedRawMaterialId || bomItemQuantity <= 0) return;
    const rm = rawMaterials.find((r) => r.id === selectedRawMaterialId);
    if (!rm) return;

    // Check if already in BOM
    const existingIndex = formData.bom.findIndex((b) => b.rawMaterialId === rm.id);
    if (existingIndex !== -1) {
      const updatedBom = [...formData.bom];
      updatedBom[existingIndex].quantityPerUnit += bomItemQuantity;
      updatedBom[existingIndex].totalCost = Number(
        (updatedBom[existingIndex].quantityPerUnit * rm.unitCost).toFixed(2)
      );
      setFormData({ ...formData, bom: updatedBom });
    } else {
      const total = Number((bomItemQuantity * rm.unitCost).toFixed(2));
      const newItem: BomItem = {
        rawMaterialId: rm.id,
        rawMaterialCode: rm.code,
        rawMaterialName: rm.name,
        quantityPerUnit: bomItemQuantity,
        unit: rm.unit,
        unitCost: rm.unitCost,
        totalCost: total
      };
      setFormData({ ...formData, bom: [...formData.bom, newItem] });
    }
    setBomItemQuantity(1);
  };

  const handleRemoveBomItem = (index: number) => {
    const updated = formData.bom.filter((_, i) => i !== index);
    setFormData({ ...formData, bom: updated });
  };

  // Computed total BOM cost in form
  const computedBomCost = formData.bom.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  const estimatedMargin =
    formData.salePrice > 0
      ? Math.round(((formData.salePrice - computedBomCost) / formData.salePrice) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setErrorMessage('Código e nome do produto são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          ...formData,
          estimatedCost: Number(computedBomCost.toFixed(2))
        });
      } else {
        await api.createProduct({
          ...formData,
          estimatedCost: Number(computedBomCost.toFixed(2)),
          active: true
        });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await api.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-800">
              Ficha Técnica do Produto (BOM)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de especificações técnicas, composição de matérias-primas e custos de fabricação
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Novo Produto / Ficha Técnica
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Categoria:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          const margin =
            product.salePrice > 0
              ? Math.round(((product.salePrice - product.estimatedCost) / product.salePrice) * 100)
              : 0;

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {product.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    {product.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {product.technicalSpecs || 'Sem especificações técnicas registradas.'}
                  </p>
                </div>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Preço de Venda:</span>
                    <strong className="text-slate-900 font-bold">
                      R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Custo de Insumos:</span>
                    <strong className="text-slate-700">
                      R$ {product.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Margem Est.:</span>
                    <span
                      className={`font-semibold ${
                        margin > 40 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {margin}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tempo Ciclo:</span>
                    <span className="text-slate-700 font-medium">
                      {product.processTimeMinutes} min / un
                    </span>
                  </div>
                </div>

                {/* Estoque atual */}
                <div className="flex items-center justify-between text-xs px-1 text-slate-600">
                  <span>Estoque de Acabados:</span>
                  <span className="font-bold text-slate-900">
                    {product.currentStock} {product.unit} (Mín: {product.minStock})
                  </span>
                </div>

                {/* Composição Resumo */}
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <Boxes className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong>{product.bom?.length || 0}</strong> matérias-primas na lista BOM
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProductView(product)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Ver Ficha Completa
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                    title="Editar Ficha Técnica"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingProduct(product)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Excluir Produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CRIAR / EDITAR FICHA TÉCNICA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Editar Ficha Técnica - ${editingProduct.code}` : 'Nova Ficha Técnica de Produto'}
        subtitle="Cadastre as especificações do produto e vincule a composição de matérias-primas (BOM)"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Dados Gerais do Produto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código / SKU *
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
                Nome do Produto *
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unidade</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="UN">UN - Unidade</option>
                <option value="CJ">CJ - Conjunto</option>
                <option value="KIT">KIT - Kit</option>
                <option value="PC">PC - Peça</option>
                <option value="M">M - Metro</option>
                <option value="KG">KG - Quilograma</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estoque Atual de Acabados
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estoque Mínimo de Acabados
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tempo de Ciclo Estimado (Minutos)
              </label>
              <input
                type="number"
                min="1"
                value={formData.processTimeMinutes}
                onChange={(e) => setFormData({ ...formData, processTimeMinutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Especificações Técnicas e Instruções de Fabricação
              </label>
              <textarea
                rows={3}
                value={formData.technicalSpecs}
                onChange={(e) => setFormData({ ...formData, technicalSpecs: e.target.value })}
                placeholder="Descreva detalhes de montagem, tolerâncias dimensionais, ensaios elétricos, pintura e normas aplicáveis..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* LISTA DE MATERIAIS / BOM COMPOSITION */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Composição da Lista de Materiais (BOM por Unidade)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Adicione as matérias-primas e insumos consumidos para fabricar 1 unidade
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Custo Total de Insumos:
                </span>
                <span className="font-extrabold text-sm text-purple-700">
                  R$ {computedBomCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Inclusor de Matéria-Prima no BOM */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-200">
              <select
                value={selectedRawMaterialId}
                onChange={(e) => setSelectedRawMaterialId(e.target.value)}
                className="w-full sm:flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
              >
                {rawMaterials.map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    {rm.code} - {rm.name} (R$ {rm.unitCost.toFixed(2)} / {rm.unit})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Qtd / un"
                  value={bomItemQuantity}
                  onChange={(e) => setBomItemQuantity(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-right font-semibold"
                />
                <button
                  type="button"
                  onClick={handleAddBomItem}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Adicionar Insumo
                </button>
              </div>
            </div>

            {/* Tabela de Insumos adicionados */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-bold text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2">Código</th>
                    <th className="p-2">Insumo</th>
                    <th className="p-2 text-right">Qtd / un</th>
                    <th className="p-2 text-right">Custo Un.</th>
                    <th className="p-2 text-right">Subtotal</th>
                    <th className="p-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {formData.bom.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">
                        Nenhum insumo incluído ainda. Selecione acima para adicionar à ficha técnica.
                      </td>
                    </tr>
                  ) : (
                    formData.bom.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-medium text-slate-700">
                          {item.rawMaterialCode}
                        </td>
                        <td className="p-2 font-medium text-slate-800">{item.rawMaterialName}</td>
                        <td className="p-2 text-right font-semibold">
                          {item.quantityPerUnit} {item.unit}
                        </td>
                        <td className="p-2 text-right text-slate-600">
                          R$ {item.unitCost.toFixed(2)}
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          R$ {item.totalCost.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveBomItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Margem bruta estimada:{' '}
              <strong className={estimatedMargin > 40 ? 'text-emerald-600' : 'text-slate-700'}>
                {estimatedMargin}%
              </strong>
            </div>

            <div className="flex items-center gap-2">
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
                {isSubmitting ? 'Salvando...' : editingProduct ? 'Atualizar Ficha Técnica' : 'Cadastrar Ficha Técnica'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL: VISUALIZAR FICHA COMPLETA */}
      {selectedProductView && (
        <Modal
          isOpen={Boolean(selectedProductView)}
          onClose={() => setSelectedProductView(null)}
          title={`Ficha Técnica Oficial: ${selectedProductView.name}`}
          subtitle={`Código SKU: ${selectedProductView.code} • Categoria: ${selectedProductView.category}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Preço de Venda</span>
                <strong className="text-base text-slate-900 font-extrabold">
                  R$ {selectedProductView.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Custo BOM</span>
                <strong className="text-base text-purple-700 font-extrabold">
                  R$ {selectedProductView.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Estoque Atual</span>
                <strong className="text-base text-slate-900 font-extrabold">
                  {selectedProductView.currentStock} {selectedProductView.unit}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Tempo de Ciclo</span>
                <strong className="text-base text-slate-900 font-extrabold">
                  {selectedProductView.processTimeMinutes} min
                </strong>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                Especificações Técnicas
              </h4>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                {selectedProductView.technicalSpecs || 'Nenhuma especificação informada.'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                Lista de Matérias-Primas Necessárias (BOM)
              </h4>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Código</th>
                    <th className="p-2">Nome do Insumo</th>
                    <th className="p-2 text-right">Qtd / Peça</th>
                    <th className="p-2 text-right">Custo Unitário</th>
                    <th className="p-2 text-right">Custo Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedProductView.bom?.map((b, i) => (
                    <tr key={i}>
                      <td className="p-2 font-mono font-medium">{b.rawMaterialCode}</td>
                      <td className="p-2 font-semibold text-slate-800">{b.rawMaterialName}</td>
                      <td className="p-2 text-right font-bold">{b.quantityPerUnit} {b.unit}</td>
                      <td className="p-2 text-right">R$ {b.unitCost.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold text-slate-900">R$ {b.totalCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedProductView(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
        title="Excluir Produto"
        message={`Deseja excluir a ficha técnica do produto "${deletingProduct?.name}"?`}
        confirmText="Sim, Excluir"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
