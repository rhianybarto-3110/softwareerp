import React, { useState } from 'react';
import { SalesOrder, Product, Partner, SalesOrderItem } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  ShoppingCart,
  Plus,
  Search,
  Edit2,
  Trash2,
  Zap,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  X,
  FileText
} from 'lucide-react';

interface OrdersModuleProps {
  orders: SalesOrder[];
  products: Product[];
  clients: Partner[];
  onRefresh: () => void;
  onNavigateToOps: () => void;
}

export const OrdersModule: React.FC<OrdersModuleProps> = ({
  orders,
  products,
  clients,
  onRefresh,
  onNavigateToOps
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<SalesOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingOp, setIsGeneratingOp] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    orderNumber: string;
    partnerId: string;
    orderDate: string;
    deliveryDate: string;
    items: SalesOrderItem[];
    notes: string;
  }>({
    orderNumber: '',
    partnerId: clients[0]?.id || '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    items: [],
    notes: ''
  });

  // Adding item inside order modal
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  const handleOpenCreate = () => {
    setEditingOrder(null);
    const initialProduct = products[0];
    const initialItems: SalesOrderItem[] = initialProduct
      ? [
          {
            productId: initialProduct.id,
            productCode: initialProduct.code,
            productName: initialProduct.name,
            quantity: 1,
            unitPrice: initialProduct.salePrice,
            totalPrice: initialProduct.salePrice
          }
        ]
      : [];

    setFormData({
      orderNumber: `PED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      partnerId: clients[0]?.id || '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      items: initialItems,
      notes: ''
    });
    setSelectedProductId(products[0]?.id || '');
    setItemQuantity(1);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (o: SalesOrder) => {
    setEditingOrder(o);
    setFormData({
      orderNumber: o.orderNumber,
      partnerId: o.partnerId,
      orderDate: o.orderDate,
      deliveryDate: o.deliveryDate,
      items: [...o.items],
      notes: o.notes || ''
    });
    setSelectedProductId(products[0]?.id || '');
    setItemQuantity(1);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleAddItemToOrder = () => {
    if (!selectedProductId || itemQuantity <= 0) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const existingIdx = formData.items.findIndex((it) => it.productId === prod.id);
    if (existingIdx !== -1) {
      const updated = [...formData.items];
      updated[existingIdx].quantity += itemQuantity;
      updated[existingIdx].totalPrice = Number(
        (updated[existingIdx].quantity * updated[existingIdx].unitPrice).toFixed(2)
      );
      setFormData({ ...formData, items: updated });
    } else {
      const newItem: SalesOrderItem = {
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        quantity: itemQuantity,
        unitPrice: prod.salePrice,
        totalPrice: Number((itemQuantity * prod.salePrice).toFixed(2))
      };
      setFormData({ ...formData, items: [...formData.items, newItem] });
    }
    setItemQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  const computedOrderTotal = formData.items.reduce(
    (sum, it) => sum + (it.totalPrice || it.quantity * it.unitPrice),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partnerId || formData.items.length === 0) {
      setErrorMessage('Selecione um cliente e inclua pelo menos um produto no pedido.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingOrder) {
        await api.updateOrder(editingOrder.id, {
          ...formData,
          totalAmount: computedOrderTotal
        });
      } else {
        await api.createOrder({
          ...formData,
          totalAmount: computedOrderTotal
        });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate OP directly from Order
  const handleGenerateOp = async (orderId: string) => {
    setIsGeneratingOp(orderId);
    try {
      await api.generateOpFromOrder(orderId);
      onRefresh();
      onNavigateToOps();
    } catch (err: any) {
      alert('Erro ao gerar OP: ' + err.message);
    } finally {
      setIsGeneratingOp(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      await api.deleteOrder(deletingOrder.id);
      setDeletingOrder(null);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-800">
              Cadastro de Pedidos de Venda
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de pedidos comerciais de clientes e emissão direta de Ordens de Produção (OP)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Novo Pedido de Venda
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por número do pedido ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente (Aguardando OP)</option>
            <option value="in_production">Em Produção</option>
            <option value="completed">Concluído</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrders.map((order) => {
          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {order.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'in_production'
                        ? 'bg-purple-100 text-purple-800'
                        : order.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status === 'in_production'
                      ? 'Em Produção'
                      : order.status === 'completed'
                      ? 'Concluído'
                      : 'Pendente de OP'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {order.clientName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Doc: {order.clientDocument}
                  </p>
                </div>

                {/* Items in order */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Itens do Pedido ({order.items?.length || 0}):
                  </span>
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700">
                      <span className="truncate max-w-[160px]">
                        {it.quantity}x {it.productName}
                      </span>
                      <strong className="text-slate-900 font-mono">
                        R$ {it.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500">
                    Entrega:{' '}
                    <strong>
                      {new Date(order.deliveryDate).toLocaleDateString('pt-BR')}
                    </strong>
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Total:</span>
                    <strong className="text-purple-700 text-sm font-extrabold">
                      R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>

                {order.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-white p-1 rounded">
                    "{order.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {order.status === 'pending' ? (
                  <button
                    onClick={() => handleGenerateOp(order.id)}
                    disabled={isGeneratingOp === order.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {isGeneratingOp === order.id ? 'Gerando...' : 'Gerar OP'}
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    OP vinculada
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(order)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                    title="Editar pedido"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingOrder(order)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CRIAR / EDITAR PEDIDO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrder ? `Editar Pedido - ${editingOrder.orderNumber}` : 'Novo Pedido de Cliente'}
        subtitle="Adicione os produtos encomendados e defina o prazo de entrega prometido"
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
                Número do Pedido *
              </label>
              <input
                type="text"
                required
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente Solicitante *
              </label>
              <select
                required
                value={formData.partnerId}
                onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.document})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data do Pedido
              </label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Prevista de Entrega *
              </label>
              <input
                type="date"
                required
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
          </div>

          {/* Adição de Produtos no Pedido */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Produtos do Pedido
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full sm:flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} (R$ {p.salePrice.toFixed(2)})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddItemToOrder}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0"
                >
                  Adicionar Item
                </button>
              </div>
            </div>

            {/* Itens adicionados */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qtd</th>
                    <th className="p-2 text-right">Preço Un.</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium text-slate-800">{it.productName}</td>
                      <td className="p-2 text-center font-bold">{it.quantity} un</td>
                      <td className="p-2 text-right">R$ {it.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold text-slate-900">
                        R$ {it.totalPrice.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 uppercase font-bold mr-2">Total do Pedido:</span>
              <strong className="text-base text-indigo-700 font-extrabold">
                R$ {computedOrderTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Comerciais e de Entrega
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Instruções de descarga, transportadora solicitada, faturamento..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
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
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : editingOrder ? 'Atualizar Pedido' : 'Salvar Pedido'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDialog
        isOpen={Boolean(deletingOrder)}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleDelete}
        title="Excluir Pedido"
        message={`Deseja excluir o pedido ${deletingOrder?.orderNumber}?`}
        confirmText="Sim, Excluir"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
