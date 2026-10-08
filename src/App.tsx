/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CompanyConfig,
  Product,
  RawMaterial,
  Partner,
  WorkCenter,
  ProcessStep,
  SalesOrder,
  ProductionOrder,
  DashboardStats
} from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { Dashboard } from './modules/Dashboard';
import { ProductionOrdersModule } from './modules/ProductionOrdersModule';
import { ProductsModule } from './modules/ProductsModule';
import { RawMaterialsModule } from './modules/RawMaterialsModule';
import { PartnersModule } from './modules/PartnersModule';
import { CapacityModule } from './modules/CapacityModule';
import { ProcessTimesModule } from './modules/ProcessTimesModule';
import { OrdersModule } from './modules/OrdersModule';
import { ReportsModule } from './modules/ReportsModule';
import { AlertCircle, RefreshCw, Factory } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core Data States
  const [config, setConfig] = useState<CompanyConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [capacities, setCapacities] = useState<WorkCenter[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Selected OP for detail view
  const [selectedOpFromDashboard, setSelectedOpFromDashboard] = useState<ProductionOrder | null>(null);

  // Load all data from persistent backend
  const loadData = useCallback(async () => {
    try {
      const [
        cfgData,
        prodData,
        rmData,
        partData,
        capData,
        stepsData,
        ordersData,
        opData,
        statsData
      ] = await Promise.all([
        api.getConfig(),
        api.getProducts(),
        api.getRawMaterials(),
        api.getPartners(),
        api.getCapacities(),
        api.getProcessSteps(),
        api.getOrders(),
        api.getProductionOrders(),
        api.getDashboardStats()
      ]);

      setConfig(cfgData);
      setProducts(prodData);
      setRawMaterials(rmData);
      setPartners(partData);
      setCapacities(capData);
      setProcessSteps(stepsData);
      setOrders(ordersData);
      setProductionOrders(opData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load ERP data:', err);
      setError(err.message || 'Falha ao conectar com o banco de dados do ERP.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeOpsCount = productionOrders.filter(
    (o) => o.status === 'in_progress' || o.status === 'planned' || o.status === 'paused'
  ).length;

  const criticalRawMaterialsCount = rawMaterials.filter(
    (r) => r.currentStock <= r.minStock
  ).length;

  const suppliers = partners.filter((p) => p.type === 'supplier' || p.type === 'both');
  const clients = partners.filter((p) => p.type === 'client' || p.type === 'both');

  const handleSelectOpFromDashboard = (op: ProductionOrder) => {
    setSelectedOpFromDashboard(op);
    setCurrentTab('production-orders');
  };

  const handleTriggerNewOp = () => {
    setCurrentTab('production-orders');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#130b21] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-600/40 mb-4 animate-bounce">
          <Factory className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
          NexusERP
        </h2>
        <p className="text-xs text-purple-300/80 mt-1">Carregando módulos industriais e banco de dados...</p>
        <div className="mt-4 animate-spin rounded-full h-6 w-6 border-2 border-purple-400 border-t-transparent" />
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="min-h-screen bg-[#130b21] flex flex-col items-center justify-center text-white p-4">
        <div className="max-w-md w-full bg-[#1e1336] border border-purple-900/60 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Erro de Inicialização</h2>
          <p className="text-xs text-purple-200/80 leading-relaxed">{error}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              loadData();
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 mx-auto shadow-md shadow-purple-600/30 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6fc] flex flex-col text-slate-800 font-sans antialiased">
      {/* Top Navigation */}
      <Navbar
        config={config}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewOrder={handleTriggerNewOp}
        activeOpsCount={activeOpsCount}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeOpsCount={activeOpsCount}
          criticalRawMaterialsCount={criticalRawMaterialsCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              productionOrders={productionOrders}
              config={config}
              onNavigate={setCurrentTab}
              onNewOrder={handleTriggerNewOp}
              onSelectOp={handleSelectOpFromDashboard}
            />
          )}

          {currentTab === 'production-orders' && (
            <ProductionOrdersModule
              productionOrders={productionOrders}
              products={products}
              salesOrders={orders}
              processSteps={processSteps}
              config={config!}
              onRefresh={loadData}
              initialSelectedOp={selectedOpFromDashboard}
              onClearInitialSelectedOp={() => setSelectedOpFromDashboard(null)}
            />
          )}

          {currentTab === 'products' && (
            <ProductsModule
              products={products}
              rawMaterials={rawMaterials}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'raw-materials' && (
            <RawMaterialsModule
              rawMaterials={rawMaterials}
              suppliers={suppliers}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'process-times' && (
            <ProcessTimesModule
              processSteps={processSteps}
              products={products}
              capacities={capacities}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'capacity' && (
            <CapacityModule
              capacities={capacities}
              productionOrders={productionOrders}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersModule
              orders={orders}
              products={products}
              clients={clients}
              onRefresh={loadData}
              onNavigateToOps={() => setCurrentTab('production-orders')}
            />
          )}

          {currentTab === 'partners' && (
            <PartnersModule
              partners={partners}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsModule
              productionOrders={productionOrders}
              products={products}
              rawMaterials={rawMaterials}
              config={config!}
              stats={stats}
            />
          )}
        </main>
      </div>

      {/* Company Settings and Technical Responsible Modal */}
      {config && (
        <CompanySettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={config}
          onConfigUpdated={(newConfig) => {
            setConfig(newConfig);
            loadData();
          }}
          onDatabaseReset={loadData}
        />
      )}
    </div>
  );
}
