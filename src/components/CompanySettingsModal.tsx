import React, { useState, useEffect } from 'react';
import { CompanyConfig } from '../types';
import { Modal } from './Modal';
import { api } from '../services/api';
import { CheckCircle2, Building2, UserCheck, Phone, Mail, MapPin, RefreshCw } from 'lucide-react';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CompanyConfig;
  onConfigUpdated: (newConfig: CompanyConfig) => void;
  onDatabaseReset: () => void;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
  onDatabaseReset
}) => {
  const [formData, setFormData] = useState<CompanyConfig>(config);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(config);
  }, [config, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateConfig(formData);
      onConfigUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Tem certeza que deseja restaurar o banco de dados com os dados de demonstração originais? Isso redefinirá cadastros e ordens.')) {
      setResetting(true);
      try {
        await api.resetDatabase();
        onDatabaseReset();
        onClose();
      } catch (err: any) {
        alert('Erro ao resetar: ' + err.message);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações da Empresa e Responsabilidade Técnica"
      subtitle="Defina os dados oficiais da empresa e o Responsável Técnico emitente de laudos, OPs e relatórios"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Bloco 1: Responsável Técnico Oficial */}
        <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-5 h-5 text-purple-700" />
            <h4 className="text-sm font-bold text-purple-900 uppercase tracking-wide">
              Responsável Técnico (Exibido em Documentos e Relatórios)
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo do Responsável Técnico *
              </label>
              <input
                type="text"
                required
                value={formData.technicalResponsible}
                onChange={(e) => setFormData({ ...formData, technicalResponsible: e.target.value })}
                placeholder="Ex: Eng. Carlos Eduardo Martins"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registro Profissional (CREA / CRQ / CFT) *
              </label>
              <input
                type="text"
                required
                value={formData.technicalRegistration}
                onChange={(e) => setFormData({ ...formData, technicalRegistration: e.target.value })}
                placeholder="Ex: CREA-SP 506.892/D"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargo / Função Técnica
              </label>
              <input
                type="text"
                value={formData.technicalRole}
                onChange={(e) => setFormData({ ...formData, technicalRole: e.target.value })}
                placeholder="Ex: Engenheiro de Produção & Resp. Técnico"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Dados da Empresa */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-600" />
            <h4 className="text-sm font-bold text-slate-800">Dados Cadastrais da Empresa</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Razão Social *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={formData.tradingName}
                onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ</label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Comercial</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 0000-0000"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Operacional</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="engenharia@empresa.com.br"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço Fabril</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, Número, Bairro"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
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
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                maxLength={2}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Ações do Rodapé */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting || saving}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
            title="Restaura os dados de exemplo caso queira reiniciar as demonstrações"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            Restaurar Dados de Exemplo
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Salvo!
                </>
              ) : saving ? (
                'Salvando...'
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
