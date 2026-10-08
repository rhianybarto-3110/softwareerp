import React, { useState } from 'react';
import { Partner } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface PartnersModuleProps {
  partners: Partner[];
  onRefresh: () => void;
}

export const PartnersModule: React.FC<PartnersModuleProps> = ({
  partners,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'client' | 'supplier'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    type: 'client' | 'supplier' | 'both';
    name: string;
    tradeName: string;
    document: string;
    stateRegistration: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    status: 'active' | 'inactive';
    notes: string;
  }>({
    code: '',
    type: 'client',
    name: '',
    tradeName: '',
    document: '',
    stateRegistration: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'SP',
    status: 'active',
    notes: ''
  });

  const handleOpenCreate = () => {
    setEditingPartner(null);
    setFormData({
      code: `${activeTab === 'supplier' ? 'FOR' : 'CLI'}-${Math.floor(100 + Math.random() * 900)}`,
      type: activeTab === 'supplier' ? 'supplier' : 'client',
      name: '',
      tradeName: '',
      document: '',
      stateRegistration: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: 'SP',
      status: 'active',
      notes: ''
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Partner) => {
    setEditingPartner(p);
    setFormData({
      code: p.code,
      type: p.type,
      name: p.name,
      tradeName: p.tradeName || '',
      document: p.document,
      stateRegistration: p.stateRegistration || '',
      email: p.email,
      phone: p.phone,
      address: p.address,
      city: p.city,
      state: p.state,
      status: p.status,
      notes: p.notes || ''
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.document) {
      setErrorMessage('Razão Social / Nome e CNPJ / CPF são campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingPartner) {
        await api.updatePartner(editingPartner.id, formData);
      } else {
        await api.createPartner(formData);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar parceiro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPartner) return;
    setIsDeleting(true);
    try {
      await api.deletePartner(deletingPartner.id);
      setDeletingPartner(null);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPartners = partners.filter((p) => {
    const matchesTab =
      activeTab === 'all' ||
      p.type === activeTab ||
      p.type === 'both';

    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.tradeName && p.tradeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.document.includes(searchTerm) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-800">
              Cadastro de Clientes e Fornecedores
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de contatos comerciais, identificação fiscal e parceiros industriais
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Novo Parceiro Comercial
        </button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({partners.length})
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'client'
                ? 'bg-white text-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clientes ({partners.filter((p) => p.type === 'client' || p.type === 'both').length})
          </button>
          <button
            onClick={() => setActiveTab('supplier')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'supplier'
                ? 'bg-white text-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fornecedores ({partners.filter((p) => p.type === 'supplier' || p.type === 'both').length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, CNPJ ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {partner.code}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    partner.type === 'client'
                      ? 'bg-blue-100 text-blue-800'
                      : partner.type === 'supplier'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {partner.type === 'client'
                    ? 'Cliente'
                    : partner.type === 'supplier'
                    ? 'Fornecedor'
                    : 'Cliente & Fornecedor'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-purple-600 transition-colors">
                  {partner.name}
                </h3>
                {partner.tradeName && (
                  <p className="text-xs text-slate-500 mt-0.5">{partner.tradeName}</p>
                )}
                <p className="text-xs font-mono text-slate-600 mt-1">
                  CNPJ/CPF: <strong>{partner.document}</strong>
                </p>
              </div>

              {/* Contacts */}
              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {partner.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{partner.phone}</span>
                  </div>
                )}
                {partner.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{partner.email}</span>
                  </div>
                )}
                {(partner.city || partner.state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {partner.city ? `${partner.city} - ` : ''}
                      {partner.state}
                    </span>
                  </div>
                )}
              </div>

              {partner.notes && (
                <p className="text-[11px] text-slate-500 italic bg-white p-1 rounded">
                  "{partner.notes}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  partner.status === 'active'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-500 bg-slate-100'
                }`}
              >
                {partner.status === 'active' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Ativo
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-slate-400" /> Inativo
                  </>
                )}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(partner)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                  title="Editar parceiro"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingPartner(partner)}
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

      {/* MODAL: CRIAR / EDITAR PARCEIRO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPartner ? `Editar Parceiro - ${editingPartner.code}` : 'Novo Parceiro Comercial'}
        subtitle="Cadastre clientes ou fornecedores com dados fiscais e de contato"
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
                Tipo de Parceiro *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="client">Cliente</option>
                <option value="supplier">Fornecedor</option>
                <option value="both">Ambos (Cliente & Fornecedor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código de Referência
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Razão Social / Nome Completo *
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CNPJ ou CPF *
              </label>
              <input
                type="text"
                required
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                placeholder="00.000.000/0000-00"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail Comercial
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@empresa.com.br"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, bairro..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estado (UF)</label>
              <input
                type="text"
                maxLength={2}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Comerciais</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Condições de pagamento acordadas, prazos médios de entrega..."
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
              {isSubmitting ? 'Salvando...' : editingPartner ? 'Atualizar Dados' : 'Cadastrar Parceiro'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDialog
        isOpen={Boolean(deletingPartner)}
        onClose={() => setDeletingPartner(null)}
        onConfirm={handleDelete}
        title="Excluir Parceiro Comercial"
        message={`Deseja excluir o cadastro de "${deletingPartner?.name}"?`}
        confirmText="Sim, Excluir"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
