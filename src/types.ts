export interface CompanyConfig {
  companyName: string;
  tradingName: string;
  cnpj: string;
  technicalResponsible: string;
  technicalRole: string;
  technicalRegistration: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  supplierId?: string;
  supplierName?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BomItem {
  rawMaterialId: string;
  rawMaterialName: string;
  rawMaterialCode: string;
  quantityPerUnit: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  salePrice: number;
  estimatedCost: number;
  currentStock: number;
  minStock: number;
  technicalSpecs: string;
  bom: BomItem[];
  processTimeMinutes: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  id: string;
  code: string;
  type: 'client' | 'supplier' | 'both';
  name: string;
  tradeName?: string;
  document: string;
  stateRegistration?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkCenter {
  id: string;
  code: string;
  name: string;
  department: string;
  dailyHours: number;
  operatorCount: number;
  nominalCapacityUnitsPerDay: number;
  efficiencyRate: number;
  status: 'active' | 'maintenance' | 'idle';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessStep {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  stepOrder: number;
  name: string;
  workCenterId: string;
  workCenterName: string;
  setupTimeMinutes: number;
  operationTimeMinutes: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  partnerId: string;
  clientName: string;
  clientDocument: string;
  orderDate: string;
  deliveryDate: string;
  items: SalesOrderItem[];
  totalAmount: number;
  status: 'pending' | 'in_production' | 'completed' | 'cancelled';
  productionOrderId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionOrderBomCheck {
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  requiredQuantity: number;
  currentStock: number;
  unit: string;
  hasEnoughStock: boolean;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productCode: string;
  productName: string;
  salesOrderId?: string;
  salesOrderNumber?: string;
  clientName?: string;
  quantity: number;
  producedQuantity: number;
  scrapQuantity: number;
  status: 'planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  startDate?: string;
  expectedEndDate: string;
  actualEndDate?: string;
  technicalResponsible: string;
  technicalRole: string;
  technicalRegistration: string;
  notes?: string;
  estimatedCycleTimeHours: number;
  bomRequirements: ProductionOrderBomCheck[];
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  productionOrders: {
    total: number;
    planned: number;
    inProgress: number;
    paused: number;
    completed: number;
  };
  productionTotals: {
    producedUnits: number;
    activeLoadHours: number;
    totalDailyCapacityHours: number;
    occupancyRatePercent: number;
  };
  rawMaterials: {
    totalCount: number;
    criticalCount: number;
    criticalItems: RawMaterial[];
  };
  products: {
    totalCount: number;
  };
  orders: {
    totalCount: number;
    pendingCount: number;
    totalAmount: number;
  };
  technicalResponsible: string;
  technicalRegistration: string;
  technicalRole: string;
}
