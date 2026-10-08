import {
  CompanyConfig,
  RawMaterial,
  Product,
  Partner,
  WorkCenter,
  ProcessStep,
  SalesOrder,
  ProductionOrder,
  DashboardStats
} from '../types';

const BASE_URL = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Erro HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Config & Technical Responsible
  getConfig: (): Promise<CompanyConfig> =>
    request<CompanyConfig>(`${BASE_URL}/config`),

  updateConfig: (data: Partial<CompanyConfig>): Promise<CompanyConfig> =>
    request<CompanyConfig>(`${BASE_URL}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  // Raw Materials
  getRawMaterials: (): Promise<RawMaterial[]> =>
    request<RawMaterial[]>(`${BASE_URL}/raw-materials`),

  createRawMaterial: (data: Partial<RawMaterial>): Promise<RawMaterial> =>
    request<RawMaterial>(`${BASE_URL}/raw-materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  updateRawMaterial: (id: string, data: Partial<RawMaterial>): Promise<RawMaterial> =>
    request<RawMaterial>(`${BASE_URL}/raw-materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  deleteRawMaterial: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`${BASE_URL}/raw-materials/${id}`, {
      method: 'DELETE'
    }),

  // Products
  getProducts: (): Promise<Product[]> =>
    request<Product[]>(`${BASE_URL}/products`),

  createProduct: (data: Partial<Product>): Promise<Product> =>
    request<Product>(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  updateProduct: (id: string, data: Partial<Product>): Promise<Product> =>
    request<Product>(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  deleteProduct: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`${BASE_URL}/products/${id}`, {
      method: 'DELETE'
    }),

  // Partners (Clients / Suppliers)
  getPartners: (type?: string): Promise<Partner[]> => {
    const url = type ? `${BASE_URL}/partners?type=${encodeURIComponent(type)}` : `${BASE_URL}/partners`;
    return request<Partner[]>(url);
  },

  createPartner: (data: Partial<Partner>): Promise<Partner> =>
    request<Partner>(`${BASE_URL}/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  updatePartner: (id: string, data: Partial<Partner>): Promise<Partner> =>
    request<Partner>(`${BASE_URL}/partners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  deletePartner: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`${BASE_URL}/partners/${id}`, {
      method: 'DELETE'
    }),

  // Capacities
  getCapacities: (): Promise<WorkCenter[]> =>
    request<WorkCenter[]>(`${BASE_URL}/capacities`),

  createCapacity: (data: Partial<WorkCenter>): Promise<WorkCenter> =>
    request<WorkCenter>(`${BASE_URL}/capacities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  updateCapacity: (id: string, data: Partial<WorkCenter>): Promise<WorkCenter> =>
    request<WorkCenter>(`${BASE_URL}/capacities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  deleteCapacity: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`${BASE_URL}/capacities/${id}`, {
      method: 'DELETE'
    }),

  // Process Steps
  getProcessSteps: (productId?: string): Promise<ProcessStep[]> => {
    const url = productId ? `${BASE_URL}/process-steps?productId=${encodeURIComponent(productId)}` : `${BASE_URL}/process-steps`;
    return request<ProcessStep[]>(url);
  },

  createProcessStep: (data: Partial<ProcessStep>): Promise<ProcessStep> =>
    request<ProcessStep>(`${BASE_URL}/process-steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  updateProcessStep: (id: string, data: Partial<ProcessStep>): Promise<ProcessStep> =>
    request<ProcessStep>(`${BASE_URL}/process-steps/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  deleteProcessStep: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`${BASE_URL}/process-steps/${id}`, {
      method: 'DELETE'
    }),

  // Sales Orders
  getOrders: (): Promise<SalesOrder[]> =>
    request<SalesOrder[]>(`${BASE_URL}/orders`),

  createOrder: (data: Partial<SalesOrder>): Promise<SalesOrder> =>
    request<SalesOrder>(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  updateOrder: (id: string, data: Partial<SalesOrder>): Promise<SalesOrder> =>
    request<SalesOrder>(`${BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  deleteOrder: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`${BASE_URL}/orders/${id}`, {
      method: 'DELETE'
    }),

  generateOpFromOrder: (id: string): Promise<ProductionOrder> =>
    request<ProductionOrder>(`${BASE_URL}/orders/${id}/generate-op`, {
      method: 'POST'
    }),

  // Production Orders
  getProductionOrders: (): Promise<ProductionOrder[]> =>
    request<ProductionOrder[]>(`${BASE_URL}/production-orders`),

  getProductionOrder: (id: string): Promise<ProductionOrder> =>
    request<ProductionOrder>(`${BASE_URL}/production-orders/${id}`),

  createProductionOrder: (data: Partial<ProductionOrder>): Promise<ProductionOrder> =>
    request<ProductionOrder>(`${BASE_URL}/production-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  updateProductionOrder: (id: string, data: Partial<ProductionOrder>): Promise<ProductionOrder> =>
    request<ProductionOrder>(`${BASE_URL}/production-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  updateProductionOrderStatus: (id: string, status: string): Promise<ProductionOrder> =>
    request<ProductionOrder>(`${BASE_URL}/production-orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }),

  completeProductionOrder: (
    id: string,
    params: { producedQuantity: number; scrapQuantity?: number; completedBy?: string; notes?: string }
  ): Promise<{ message: string; productionOrder: ProductionOrder }> =>
    request<{ message: string; productionOrder: ProductionOrder }>(`${BASE_URL}/production-orders/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }),

  deleteProductionOrder: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`${BASE_URL}/production-orders/${id}`, {
      method: 'DELETE'
    }),

  // Stats
  getDashboardStats: (): Promise<DashboardStats> =>
    request<DashboardStats>(`${BASE_URL}/dashboard/stats`),

  // Reset
  resetDatabase: (): Promise<{ message: string }> =>
    request<{ message: string }>(`${BASE_URL}/database/reset`, {
      method: 'POST'
    })
};
