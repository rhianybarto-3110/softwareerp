import fs from 'fs';
import path from 'path';

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

export interface DatabaseSchema {
  config: CompanyConfig;
  rawMaterials: RawMaterial[];
  products: Product[];
  partners: Partner[];
  capacities: WorkCenter[];
  processSteps: ProcessStep[];
  orders: SalesOrder[];
  productionOrders: ProductionOrder[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nexus_erp.json');

const INITIAL_DATA: DatabaseSchema = {
  config: {
    companyName: "Nexus Metalúrgica & Manufatura Ltda.",
    tradingName: "Nexus Indústria",
    cnpj: "18.345.921/0001-80",
    technicalResponsible: "Eng. Carlos Eduardo Martins",
    technicalRole: "Engenheiro de Produção & Resp. Técnico",
    technicalRegistration: "CREA-SP 506.892/D",
    phone: "(11) 4589-3200",
    email: "engenharia@nexusindustria.com.br",
    address: "Av. das Indústrias, 1500 - Distrito Industrial",
    city: "Campinas",
    state: "SP"
  },
  rawMaterials: [
    {
      id: "rm-1",
      code: "MP-ACO-001",
      name: "Chapa de Aço Carbono SAE 1020 3mm",
      category: "Metais",
      unit: "KG",
      currentStock: 480.0,
      minStock: 150.0,
      unitCost: 14.80,
      supplierId: "part-5",
      supplierName: "Gerdau Distribuidora Aços",
      location: "Almoxarifado A - Racks 04",
      notes: "Dimensões padrão 1200x3000mm",
      createdAt: "2026-03-01T08:00:00.000Z",
      updatedAt: "2026-03-01T08:00:00.000Z"
    },
    {
      id: "rm-2",
      code: "MP-ALU-002",
      name: "Perfil Estrutural de Alumínio 40x40",
      category: "Metais",
      unit: "M",
      currentStock: 160.0,
      minStock: 50.0,
      unitCost: 38.50,
      supplierId: "part-6",
      supplierName: "Alumínios Brasil S/A",
      location: "Almoxarifado A - Tubuladora",
      notes: "Barras de 6 metros",
      createdAt: "2026-03-01T08:00:00.000Z",
      updatedAt: "2026-03-01T08:00:00.000Z"
    },
    {
      id: "rm-3",
      code: "MP-ELE-003",
      name: "Sensor Óptico Industrial 24V PNP",
      category: "Elétricos",
      unit: "UN",
      currentStock: 22.0,
      minStock: 25.0, // Alerta: estoque baixo!
      unitCost: 89.90,
      supplierId: "part-7",
      supplierName: "Automação Tech Componentes",
      location: "Almoxarifado Eletrônico - Gaveta 12",
      notes: "Alcance ajustável até 300mm",
      createdAt: "2026-03-01T08:00:00.000Z",
      updatedAt: "2026-03-01T08:00:00.000Z"
    },
    {
      id: "rm-4",
      code: "MP-ELE-004",
      name: "Cabo Flexível 2,5mm² 750V Preto",
      category: "Elétricos",
      unit: "M",
      currentStock: 520.0,
      minStock: 200.0,
      unitCost: 3.20,
      supplierId: "part-7",
      supplierName: "Automação Tech Componentes",
      location: "Almoxarifado Eletrônico - Carretéis",
      notes: "Rolo com certificação Inmetro",
      createdAt: "2026-03-01T08:00:00.000Z",
      updatedAt: "2026-03-01T08:00:00.000Z"
    },
    {
      id: "rm-5",
      code: "MP-FIX-005",
      name: "Parafuso Sextavado M8x30 Inox 304 com Porca",
      category: "Fixadores",
      unit: "UN",
      currentStock: 850.0,
      minStock: 300.0,
      unitCost: 1.15,
      supplierId: "part-6",
      supplierName: "Alumínios Brasil S/A",
      location: "Almoxarifado Geral - Gaveta 44",
      notes: "Acompanha arruela de pressão",
      createdAt: "2026-03-01T08:00:00.000Z",
      updatedAt: "2026-03-01T08:00:00.000Z"
    },
    {
      id: "rm-6",
      code: "MP-PNT-006",
      name: "Tinta Eletrostática a Pó Cinza RAL 7035",
      category: "Químicos / Pintura",
      unit: "KG",
      currentStock: 45.0,
      minStock: 20.0,
      unitCost: 32.00,
      supplierId: "part-5",
      supplierName: "Gerdau Distribuidora Aços",
      location: "Cabine de Pintura - Depósito",
      notes: "Cura térmica a 200°C por 15 min",
      createdAt: "2026-03-01T08:00:00.000Z",
      updatedAt: "2026-03-01T08:00:00.000Z"
    }
  ],
  products: [
    {
      id: "prod-1",
      code: "PRD-PAI-01",
      name: "Painel de Comando e Automação Industrial",
      category: "Quadros Elétricos",
      unit: "UN",
      salePrice: 2850.00,
      estimatedCost: 1045.50,
      currentStock: 4,
      minStock: 2,
      technicalSpecs: "Caixa metálica 600x500x250mm, pintura eletrostática cinza RAL 7035, grau de proteção IP65. Contém trilho DIN, canaletas anti-chama, barramentos de cobre e bornes para sensores 24V.",
      bom: [
        {
          rawMaterialId: "rm-1",
          rawMaterialCode: "MP-ACO-001",
          rawMaterialName: "Chapa de Aço Carbono SAE 1020 3mm",
          quantityPerUnit: 18.0,
          unit: "KG",
          unitCost: 14.80,
          totalCost: 266.40
        },
        {
          rawMaterialId: "rm-3",
          rawMaterialCode: "MP-ELE-003",
          rawMaterialName: "Sensor Óptico Industrial 24V PNP",
          quantityPerUnit: 2.0,
          unit: "UN",
          unitCost: 89.90,
          totalCost: 179.80
        },
        {
          rawMaterialId: "rm-4",
          rawMaterialCode: "MP-ELE-004",
          rawMaterialName: "Cabo Flexível 2,5mm² 750V Preto",
          quantityPerUnit: 25.0,
          unit: "M",
          unitCost: 3.20,
          totalCost: 80.00
        },
        {
          rawMaterialId: "rm-5",
          rawMaterialCode: "MP-FIX-005",
          rawMaterialName: "Parafuso Sextavado M8x30 Inox 304 com Porca",
          quantityPerUnit: 16.0,
          unit: "UN",
          unitCost: 1.15,
          totalCost: 18.40
        },
        {
          rawMaterialId: "rm-6",
          rawMaterialCode: "MP-PNT-006",
          rawMaterialName: "Tinta Eletrostática a Pó Cinza RAL 7035",
          quantityPerUnit: 2.5,
          unit: "KG",
          unitCost: 32.00,
          totalCost: 80.00
        }
      ],
      processTimeMinutes: 240, // 4 horas
      active: true,
      createdAt: "2026-03-01T09:00:00.000Z",
      updatedAt: "2026-03-01T09:00:00.000Z"
    },
    {
      id: "prod-2",
      code: "PRD-EST-02",
      name: "Bancada Ergonômica de Montagem com Perfil Alumínio",
      category: "Mobiliário Industrial",
      unit: "UN",
      salePrice: 1950.00,
      estimatedCost: 710.00,
      currentStock: 2,
      minStock: 2,
      technicalSpecs: "Estrutura de 1500x800x900mm em perfil de alumínio 40x40mm. Tampo reforçado, sapatas niveladoras anti-vibração e suporte para luminária LED articulada.",
      bom: [
        {
          rawMaterialId: "rm-2",
          rawMaterialCode: "MP-ALU-002",
          rawMaterialName: "Perfil Estrutural de Alumínio 40x40",
          quantityPerUnit: 12.0,
          unit: "M",
          unitCost: 38.50,
          totalCost: 462.00
        },
        {
          rawMaterialId: "rm-5",
          rawMaterialCode: "MP-FIX-005",
          rawMaterialName: "Parafuso Sextavado M8x30 Inox 304 com Porca",
          quantityPerUnit: 32.0,
          unit: "UN",
          unitCost: 1.15,
          totalCost: 36.80
        }
      ],
      processTimeMinutes: 150, // 2h 30m
      active: true,
      createdAt: "2026-03-01T09:00:00.000Z",
      updatedAt: "2026-03-01T09:00:00.000Z"
    },
    {
      id: "prod-3",
      code: "PRD-CAR-03",
      name: "Carrinho Industrial de Transporte de Cargas 350kg",
      category: "Movimentação Interna",
      unit: "UN",
      salePrice: 1280.00,
      estimatedCost: 485.00,
      currentStock: 5,
      minStock: 3,
      technicalSpecs: "Estrutura soldada em chapa de aço e cantoneiras. Rodízios reforçados de poliuretano com rolamentos blindados. Capacidade útil: 350 kg.",
      bom: [
        {
          rawMaterialId: "rm-1",
          rawMaterialCode: "MP-ACO-001",
          rawMaterialName: "Chapa de Aço Carbono SAE 1020 3mm",
          quantityPerUnit: 22.0,
          unit: "KG",
          unitCost: 14.80,
          totalCost: 325.60
        },
        {
          rawMaterialId: "rm-5",
          rawMaterialCode: "MP-FIX-005",
          rawMaterialName: "Parafuso Sextavado M8x30 Inox 304 com Porca",
          quantityPerUnit: 12.0,
          unit: "UN",
          unitCost: 1.15,
          totalCost: 13.80
        },
        {
          rawMaterialId: "rm-6",
          rawMaterialCode: "MP-PNT-006",
          rawMaterialName: "Tinta Eletrostática a Pó Cinza RAL 7035",
          quantityPerUnit: 1.8,
          unit: "KG",
          unitCost: 32.00,
          totalCost: 57.60
        }
      ],
      processTimeMinutes: 180, // 3h
      active: true,
      createdAt: "2026-03-01T09:00:00.000Z",
      updatedAt: "2026-03-01T09:00:00.000Z"
    }
  ],
  partners: [
    {
      id: "part-1",
      code: "CLI-001",
      type: "client",
      name: "Agroindústria Sol Nascente S.A.",
      tradeName: "Sol Nascente Alimentos",
      document: "04.598.112/0001-44",
      stateRegistration: "254.891.002.110",
      email: "compras@solnascente.com.br",
      phone: "(19) 3881-9920",
      address: "Rodovia SP-340, Km 118",
      city: "Mogi Mirim",
      state: "SP",
      status: "active",
      notes: "Cliente preferencial - faturamento 28 dias",
      createdAt: "2026-02-15T10:00:00.000Z",
      updatedAt: "2026-02-15T10:00:00.000Z"
    },
    {
      id: "part-2",
      code: "CLI-002",
      type: "client",
      name: "Logística Moderna Armazéns Gerais Ltda.",
      tradeName: "LogMod Armazéns",
      document: "12.784.665/0002-19",
      stateRegistration: "109.432.551.008",
      email: "operacoes@logmod.com.br",
      phone: "(11) 3320-8400",
      address: "Rua Presidente Wilson, 450",
      city: "Jundiaí",
      state: "SP",
      status: "active",
      notes: "Exige certificado de conformidade da pintura",
      createdAt: "2026-02-16T11:00:00.000Z",
      updatedAt: "2026-02-16T11:00:00.000Z"
    },
    {
      id: "part-3",
      code: "CLI-003",
      type: "client",
      name: "Metalprint Embalagens Técnicas Ltda.",
      tradeName: "Metalprint Indústria",
      document: "21.908.432/0001-07",
      stateRegistration: "338.992.100.222",
      email: "suprimentos@metalprint.com.br",
      phone: "(19) 3465-1200",
      address: "Av. Industrial, 880",
      city: "Americana",
      state: "SP",
      status: "active",
      notes: "Pedidos recorrentes de bancadas",
      createdAt: "2026-02-20T09:30:00.000Z",
      updatedAt: "2026-02-20T09:30:00.000Z"
    },
    {
      id: "part-5",
      code: "FOR-001",
      type: "supplier",
      name: "Gerdau Distribuidora Aços S.A.",
      tradeName: "Gerdau Aços",
      document: "33.611.500/0001-19",
      stateRegistration: "114.772.991.003",
      email: "vendas.sp@gerdau.com.br",
      phone: "(11) 3003-8000",
      address: "Av. Nações Unidas, 8501",
      city: "São Paulo",
      state: "SP",
      status: "active",
      notes: "Fornecedor principal de chapas e barras de aço",
      createdAt: "2026-02-01T08:00:00.000Z",
      updatedAt: "2026-02-01T08:00:00.000Z"
    },
    {
      id: "part-6",
      code: "FOR-002",
      type: "supplier",
      name: "Alumínios Brasil Indústria e Comércio Ltda.",
      tradeName: "Alumínios Brasil",
      document: "09.432.190/0001-66",
      stateRegistration: "551.982.004.119",
      email: "contato@aluminiosbrasil.com.br",
      phone: "(19) 3212-7000",
      address: "Rua dos Metalúrgicos, 320",
      city: "Campinas",
      state: "SP",
      status: "active",
      notes: "Perfis de alumínio estrutural modular",
      createdAt: "2026-02-05T08:30:00.000Z",
      updatedAt: "2026-02-05T08:30:00.000Z"
    },
    {
      id: "part-7",
      code: "FOR-003",
      type: "supplier",
      name: "Automação Tech Componentes Eletrônicos Ltda.",
      tradeName: "Automação Tech",
      document: "17.892.401/0001-83",
      stateRegistration: "662.339.400.100",
      email: "pedidos@automacaotech.com.br",
      phone: "(11) 4022-9010",
      address: "Rua Santa Ifigênia, 120 - 4º andar",
      city: "São Paulo",
      state: "SP",
      status: "active",
      notes: "Sensores, relés, cabos e barramentos",
      createdAt: "2026-02-10T14:00:00.000Z",
      updatedAt: "2026-02-10T14:00:00.000Z"
    }
  ],
  capacities: [
    {
      id: "wc-1",
      code: "POSTO-01",
      name: "Corte e Conformação Mecânica",
      department: "Caldeiraria & Corte",
      dailyHours: 8.5,
      operatorCount: 3,
      nominalCapacityUnitsPerDay: 45,
      efficiencyRate: 90,
      status: "active",
      notes: "Guilhotina CNC 3000mm e Dobradeira Hidráulica 100T",
      createdAt: "2026-02-01T08:00:00.000Z",
      updatedAt: "2026-02-01T08:00:00.000Z"
    },
    {
      id: "wc-2",
      code: "POSTO-02",
      name: "Solda Estrutural (MIG/MAG & TIG)",
      department: "Soldagem",
      dailyHours: 8.5,
      operatorCount: 2,
      nominalCapacityUnitsPerDay: 20,
      efficiencyRate: 85,
      status: "active",
      notes: "2 cabines de solda com exaustão localizada",
      createdAt: "2026-02-01T08:00:00.000Z",
      updatedAt: "2026-02-01T08:00:00.000Z"
    },
    {
      id: "wc-3",
      code: "POSTO-03",
      name: "Pintura Eletrostática & Cura Térmica",
      department: "Tratamento de Superfície",
      dailyHours: 8.0,
      operatorCount: 2,
      nominalCapacityUnitsPerDay: 30,
      efficiencyRate: 92,
      status: "active",
      notes: "Estufa a gás 220°C com transportador aéreo manual",
      createdAt: "2026-02-01T08:00:00.000Z",
      updatedAt: "2026-02-01T08:00:00.000Z"
    },
    {
      id: "wc-4",
      code: "POSTO-04",
      name: "Montagem Eletromecânica & Testes Finais",
      department: "Montagem Final",
      dailyHours: 8.5,
      operatorCount: 4,
      nominalCapacityUnitsPerDay: 15,
      efficiencyRate: 88,
      status: "active",
      notes: "Bancadas com fonte regulada 24VCC e testador de isolamento",
      createdAt: "2026-02-01T08:00:00.000Z",
      updatedAt: "2026-02-01T08:00:00.000Z"
    }
  ],
  processSteps: [
    {
      id: "step-1",
      productId: "prod-1",
      productCode: "PRD-PAI-01",
      productName: "Painel de Comando e Automação Industrial",
      stepOrder: 1,
      name: "Corte e Furação da Chapa do Gabinete",
      workCenterId: "wc-1",
      workCenterName: "Corte e Conformação Mecânica",
      setupTimeMinutes: 20,
      operationTimeMinutes: 40,
      description: "Cortar chapa conforme desenho DXF-6050. Puncionar furos para botoeiras e prensa-cabos.",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z"
    },
    {
      id: "step-2",
      productId: "prod-1",
      productCode: "PRD-PAI-01",
      productName: "Painel de Comando e Automação Industrial",
      stepOrder: 2,
      name: "Dobra e Solda dos Cantos da Caixa",
      workCenterId: "wc-2",
      workCenterName: "Solda Estrutural (MIG/MAG & TIG)",
      setupTimeMinutes: 15,
      operationTimeMinutes: 45,
      description: "Executar 4 dobras em 90°. Ponteamento e solda TIG estanque nos cantos superiores.",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z"
    },
    {
      id: "step-3",
      productId: "prod-1",
      productCode: "PRD-PAI-01",
      productName: "Painel de Comando e Automação Industrial",
      stepOrder: 3,
      name: "Fosfatização e Pintura Eletrostática RAL 7035",
      workCenterId: "wc-3",
      workCenterName: "Pintura Eletrostática & Cura Térmica",
      setupTimeMinutes: 25,
      operationTimeMinutes: 50,
      description: "Desengraxe químico, aplicação de pó eletrostático e cura em estufa a 200°C por 15 minutos.",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z"
    },
    {
      id: "step-4",
      productId: "prod-1",
      productCode: "PRD-PAI-01",
      productName: "Painel de Comando e Automação Industrial",
      stepOrder: 4,
      name: "Montagem Elétrica, Chicotes e Teste de Continuidade",
      workCenterId: "wc-4",
      workCenterName: "Montagem Eletromecânica & Testes Finais",
      setupTimeMinutes: 15,
      operationTimeMinutes: 85,
      description: "Fixação da placa de montagem, canaletas, bornes, sensores e teste com simulador 24V.",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z"
    },
    {
      id: "step-5",
      productId: "prod-2",
      productCode: "PRD-EST-02",
      productName: "Bancada Ergonômica de Montagem com Perfil Alumínio",
      stepOrder: 1,
      name: "Corte dos Perfis de Alumínio no Esquadro",
      workCenterId: "wc-1",
      workCenterName: "Corte e Conformação Mecânica",
      setupTimeMinutes: 10,
      operationTimeMinutes: 40,
      description: "Corte com serra de fita para alumínio com ângulo preciso de 90° e rebarbação com lima.",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z"
    },
    {
      id: "step-6",
      productId: "prod-2",
      productCode: "PRD-EST-02",
      productName: "Bancada Ergonômica de Montagem com Perfil Alumínio",
      stepOrder: 2,
      name: "Montagem Estrutural, Esquadrejamento e Sapatas",
      workCenterId: "wc-4",
      workCenterName: "Montagem Eletromecânica & Testes Finais",
      setupTimeMinutes: 15,
      operationTimeMinutes: 95,
      description: "União com cantoneiras de travamento, torque de 25 Nm nos parafusos M8 e teste de nivelamento.",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z"
    },
    {
      id: "step-7",
      productId: "prod-3",
      productCode: "PRD-CAR-03",
      productName: "Carrinho Industrial de Transporte de Cargas 350kg",
      stepOrder: 1,
      name: "Corte e Conformação da Chapa Base",
      workCenterId: "wc-1",
      workCenterName: "Corte e Conformação Mecânica",
      setupTimeMinutes: 15,
      operationTimeMinutes: 45,
      description: "Corte de chapa 3mm 1000x700mm e dobra de abas de contenção.",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z"
    },
    {
      id: "step-8",
      productId: "prod-3",
      productCode: "PRD-CAR-03",
      productName: "Carrinho Industrial de Transporte de Cargas 350kg",
      stepOrder: 2,
      name: "Solda da Estrutura e Pintura",
      workCenterId: "wc-2",
      workCenterName: "Solda Estrutural (MIG/MAG & TIG)",
      setupTimeMinutes: 20,
      operationTimeMinutes: 75,
      description: "Soldagem MIG contínua e acabamento para envio à cabine de pintura.",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z"
    }
  ],
  orders: [
    {
      id: "ord-1",
      orderNumber: "PED-2026-0101",
      partnerId: "part-1",
      clientName: "Agroindústria Sol Nascente S.A.",
      clientDocument: "04.598.112/0001-44",
      orderDate: "2026-03-02",
      deliveryDate: "2026-03-25",
      items: [
        {
          productId: "prod-1",
          productCode: "PRD-PAI-01",
          productName: "Painel de Comando e Automação Industrial",
          quantity: 2,
          unitPrice: 2850.00,
          totalPrice: 5700.00
        }
      ],
      totalAmount: 5700.00,
      status: "in_production",
      productionOrderId: "op-1",
      notes: "Linha de envase de sucos - Urgência moderada",
      createdAt: "2026-03-02T10:00:00.000Z",
      updatedAt: "2026-03-02T10:30:00.000Z"
    },
    {
      id: "ord-2",
      orderNumber: "PED-2026-0102",
      partnerId: "part-2",
      clientName: "Logística Moderna Armazéns Gerais Ltda.",
      clientDocument: "12.784.665/0002-19",
      orderDate: "2026-03-04",
      deliveryDate: "2026-03-28",
      items: [
        {
          productId: "prod-3",
          productCode: "PRD-CAR-03",
          productName: "Carrinho Industrial de Transporte de Cargas 350kg",
          quantity: 4,
          unitPrice: 1280.00,
          totalPrice: 5120.00
        }
      ],
      totalAmount: 5120.00,
      status: "pending",
      notes: "Entregar no galpão 4 em Jundiaí",
      createdAt: "2026-03-04T14:15:00.000Z",
      updatedAt: "2026-03-04T14:15:00.000Z"
    },
    {
      id: "ord-3",
      orderNumber: "PED-2026-0098",
      partnerId: "part-3",
      clientName: "Metalprint Embalagens Técnicas Ltda.",
      clientDocument: "21.908.432/0001-07",
      orderDate: "2026-02-22",
      deliveryDate: "2026-03-10",
      items: [
        {
          productId: "prod-2",
          productCode: "PRD-EST-02",
          productName: "Bancada Ergonômica de Montagem com Perfil Alumínio",
          quantity: 2,
          unitPrice: 1950.00,
          totalPrice: 3900.00
        }
      ],
      totalAmount: 3900.00,
      status: "completed",
      productionOrderId: "op-4",
      notes: "Pedido concluído e faturado",
      createdAt: "2026-02-22T09:00:00.000Z",
      updatedAt: "2026-03-06T16:00:00.000Z"
    }
  ],
  productionOrders: [
    {
      id: "op-1",
      orderNumber: "OP-2026-001",
      productId: "prod-1",
      productCode: "PRD-PAI-01",
      productName: "Painel de Comando e Automação Industrial",
      salesOrderId: "ord-1",
      salesOrderNumber: "PED-2026-0101",
      clientName: "Agroindústria Sol Nascente S.A.",
      quantity: 2,
      producedQuantity: 1,
      scrapQuantity: 0,
      status: "in_progress",
      priority: "high",
      startDate: "2026-03-03",
      expectedEndDate: "2026-03-15",
      technicalResponsible: "Eng. Carlos Eduardo Martins",
      technicalRole: "Engenheiro de Produção & Resp. Técnico",
      technicalRegistration: "CREA-SP 506.892/D",
      notes: "Painel para ambiente úmido. Caprichar na vedação da borracha IP65.",
      estimatedCycleTimeHours: 8.0,
      bomRequirements: [
        {
          rawMaterialId: "rm-1",
          rawMaterialCode: "MP-ACO-001",
          rawMaterialName: "Chapa de Aço Carbono SAE 1020 3mm",
          requiredQuantity: 36.0,
          currentStock: 480.0,
          unit: "KG",
          hasEnoughStock: true
        },
        {
          rawMaterialId: "rm-3",
          rawMaterialCode: "MP-ELE-003",
          rawMaterialName: "Sensor Óptico Industrial 24V PNP",
          requiredQuantity: 4.0,
          currentStock: 22.0,
          unit: "UN",
          hasEnoughStock: true
        },
        {
          rawMaterialId: "rm-4",
          rawMaterialCode: "MP-ELE-004",
          rawMaterialName: "Cabo Flexível 2,5mm² 750V Preto",
          requiredQuantity: 50.0,
          currentStock: 520.0,
          unit: "M",
          hasEnoughStock: true
        },
        {
          rawMaterialId: "rm-5",
          rawMaterialCode: "MP-FIX-005",
          rawMaterialName: "Parafuso Sextavado M8x30 Inox 304 com Porca",
          requiredQuantity: 32.0,
          currentStock: 850.0,
          unit: "UN",
          hasEnoughStock: true
        },
        {
          rawMaterialId: "rm-6",
          rawMaterialCode: "MP-PNT-006",
          rawMaterialName: "Tinta Eletrostática a Pó Cinza RAL 7035",
          requiredQuantity: 5.0,
          currentStock: 45.0,
          unit: "KG",
          hasEnoughStock: true
        }
      ],
      createdAt: "2026-03-02T10:30:00.000Z",
      updatedAt: "2026-03-04T11:00:00.000Z"
    },
    {
      id: "op-2",
      orderNumber: "OP-2026-002",
      productId: "prod-2",
      productCode: "PRD-EST-02",
      productName: "Bancada Ergonômica de Montagem com Perfil Alumínio",
      quantity: 3,
      producedQuantity: 0,
      scrapQuantity: 0,
      status: "planned",
      priority: "normal",
      startDate: "2026-03-10",
      expectedEndDate: "2026-03-18",
      technicalResponsible: "Eng. Carlos Eduardo Martins",
      technicalRole: "Engenheiro de Produção & Resp. Técnico",
      technicalRegistration: "CREA-SP 506.892/D",
      notes: "Produção para estoque de segurança de bancadas",
      estimatedCycleTimeHours: 7.5,
      bomRequirements: [
        {
          rawMaterialId: "rm-2",
          rawMaterialCode: "MP-ALU-002",
          rawMaterialName: "Perfil Estrutural de Alumínio 40x40",
          requiredQuantity: 36.0,
          currentStock: 160.0,
          unit: "M",
          hasEnoughStock: true
        },
        {
          rawMaterialId: "rm-5",
          rawMaterialCode: "MP-FIX-005",
          rawMaterialName: "Parafuso Sextavado M8x30 Inox 304 com Porca",
          requiredQuantity: 96.0,
          currentStock: 850.0,
          unit: "UN",
          hasEnoughStock: true
        }
      ],
      createdAt: "2026-03-04T09:00:00.000Z",
      updatedAt: "2026-03-04T09:00:00.000Z"
    },
    {
      id: "op-3",
      orderNumber: "OP-2026-003",
      productId: "prod-3",
      productCode: "PRD-CAR-03",
      productName: "Carrinho Industrial de Transporte de Cargas 350kg",
      quantity: 5,
      producedQuantity: 2,
      scrapQuantity: 0,
      status: "paused",
      priority: "normal",
      startDate: "2026-03-01",
      expectedEndDate: "2026-03-12",
      technicalResponsible: "Eng. Carlos Eduardo Martins",
      technicalRole: "Engenheiro de Produção & Resp. Técnico",
      technicalRegistration: "CREA-SP 506.892/D",
      notes: "Pausado temporariamente para manutenção preventiva da prensa de dobra",
      estimatedCycleTimeHours: 15.0,
      bomRequirements: [
        {
          rawMaterialId: "rm-1",
          rawMaterialCode: "MP-ACO-001",
          rawMaterialName: "Chapa de Aço Carbono SAE 1020 3mm",
          requiredQuantity: 110.0,
          currentStock: 480.0,
          unit: "KG",
          hasEnoughStock: true
        },
        {
          rawMaterialId: "rm-5",
          rawMaterialCode: "MP-FIX-005",
          rawMaterialName: "Parafuso Sextavado M8x30 Inox 304 com Porca",
          requiredQuantity: 60.0,
          currentStock: 850.0,
          unit: "UN",
          hasEnoughStock: true
        },
        {
          rawMaterialId: "rm-6",
          rawMaterialCode: "MP-PNT-006",
          rawMaterialName: "Tinta Eletrostática a Pó Cinza RAL 7035",
          requiredQuantity: 9.0,
          currentStock: 45.0,
          unit: "KG",
          hasEnoughStock: true
        }
      ],
      createdAt: "2026-03-01T14:00:00.000Z",
      updatedAt: "2026-03-05T15:30:00.000Z"
    },
    {
      id: "op-4",
      orderNumber: "OP-2026-000",
      productId: "prod-2",
      productCode: "PRD-EST-02",
      productName: "Bancada Ergonômica de Montagem com Perfil Alumínio",
      salesOrderId: "ord-3",
      salesOrderNumber: "PED-2026-0098",
      clientName: "Metalprint Embalagens Técnicas Ltda.",
      quantity: 2,
      producedQuantity: 2,
      scrapQuantity: 0,
      status: "completed",
      priority: "high",
      startDate: "2026-02-23",
      expectedEndDate: "2026-03-05",
      actualEndDate: "2026-03-04",
      technicalResponsible: "Eng. Carlos Eduardo Martins",
      technicalRole: "Engenheiro de Produção & Resp. Técnico",
      technicalRegistration: "CREA-SP 506.892/D",
      notes: "Baixa realizada com sucesso. Insumos baixados e produtos liberados para expedição.",
      estimatedCycleTimeHours: 5.0,
      bomRequirements: [
        {
          rawMaterialId: "rm-2",
          rawMaterialCode: "MP-ALU-002",
          rawMaterialName: "Perfil Estrutural de Alumínio 40x40",
          requiredQuantity: 24.0,
          currentStock: 160.0,
          unit: "M",
          hasEnoughStock: true
        },
        {
          rawMaterialId: "rm-5",
          rawMaterialCode: "MP-FIX-005",
          rawMaterialName: "Parafuso Sextavado M8x30 Inox 304 com Porca",
          requiredQuantity: 64.0,
          currentStock: 850.0,
          unit: "UN",
          hasEnoughStock: true
        }
      ],
      completedAt: "2026-03-04T16:30:00.000Z",
      completedBy: "Eng. Carlos Eduardo Martins (CREA-SP 506.892/D)",
      createdAt: "2026-02-23T08:00:00.000Z",
      updatedAt: "2026-03-04T16:30:00.000Z"
    }
  ]
};

export class Database {
  private static instance: Database;
  private data: DatabaseSchema;

  private constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent) as DatabaseSchema;
        // Merge with initial keys if missing
        return {
          config: parsed.config || INITIAL_DATA.config,
          rawMaterials: parsed.rawMaterials || INITIAL_DATA.rawMaterials,
          products: parsed.products || INITIAL_DATA.products,
          partners: parsed.partners || INITIAL_DATA.partners,
          capacities: parsed.capacities || INITIAL_DATA.capacities,
          processSteps: parsed.processSteps || INITIAL_DATA.processSteps,
          orders: parsed.orders || INITIAL_DATA.orders,
          productionOrders: parsed.productionOrders || INITIAL_DATA.productionOrders
        };
      }
    } catch (err) {
      console.error('Error reading database file, resetting to initial seed:', err);
    }

    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      this.ensureDataDir();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save database:', err);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // --- Reset to initial seed ---
  public resetToInitialSeed(): DatabaseSchema {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.persist();
    return this.data;
  }

  // --- Company Config & Technical Responsible ---
  public getConfig(): CompanyConfig {
    return { ...this.data.config };
  }

  public updateConfig(updates: Partial<CompanyConfig>): CompanyConfig {
    this.data.config = { ...this.data.config, ...updates };
    this.persist();
    return this.data.config;
  }

  // --- Raw Materials ---
  public getRawMaterials(): RawMaterial[] {
    return [...this.data.rawMaterials];
  }

  public getRawMaterialById(id: string): RawMaterial | undefined {
    return this.data.rawMaterials.find(item => item.id === id);
  }

  public createRawMaterial(item: Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>): RawMaterial {
    const now = new Date().toISOString();
    const newItem: RawMaterial = {
      ...item,
      id: `rm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.rawMaterials.push(newItem);
    this.persist();
    return newItem;
  }

  public updateRawMaterial(id: string, updates: Partial<RawMaterial>): RawMaterial | null {
    const index = this.data.rawMaterials.findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data.rawMaterials[index] = {
      ...this.data.rawMaterials[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.rawMaterials[index];
  }

  public deleteRawMaterial(id: string): boolean {
    const initialLen = this.data.rawMaterials.length;
    this.data.rawMaterials = this.data.rawMaterials.filter(item => item.id !== id);
    if (this.data.rawMaterials.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Products (Ficha Técnica) ---
  public getProducts(): Product[] {
    return [...this.data.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(item => item.id === id);
  }

  public createProduct(item: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const now = new Date().toISOString();
    const newItem: Product = {
      ...item,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.products.push(newItem);
    this.persist();
    return newItem;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data.products[index] = {
      ...this.data.products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.products[index];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(item => item.id !== id);
    if (this.data.products.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Partners (Clientes & Fornecedores) ---
  public getPartners(): Partner[] {
    return [...this.data.partners];
  }

  public getPartnerById(id: string): Partner | undefined {
    return this.data.partners.find(item => item.id === id);
  }

  public createPartner(item: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>): Partner {
    const now = new Date().toISOString();
    const newItem: Partner = {
      ...item,
      id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.partners.push(newItem);
    this.persist();
    return newItem;
  }

  public updatePartner(id: string, updates: Partial<Partner>): Partner | null {
    const index = this.data.partners.findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data.partners[index] = {
      ...this.data.partners[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.partners[index];
  }

  public deletePartner(id: string): boolean {
    const initialLen = this.data.partners.length;
    this.data.partners = this.data.partners.filter(item => item.id !== id);
    if (this.data.partners.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Capacities (Capacidade Produtiva / Postos) ---
  public getCapacities(): WorkCenter[] {
    return [...this.data.capacities];
  }

  public getCapacityById(id: string): WorkCenter | undefined {
    return this.data.capacities.find(item => item.id === id);
  }

  public createCapacity(item: Omit<WorkCenter, 'id' | 'createdAt' | 'updatedAt'>): WorkCenter {
    const now = new Date().toISOString();
    const newItem: WorkCenter = {
      ...item,
      id: `wc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.capacities.push(newItem);
    this.persist();
    return newItem;
  }

  public updateCapacity(id: string, updates: Partial<WorkCenter>): WorkCenter | null {
    const index = this.data.capacities.findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data.capacities[index] = {
      ...this.data.capacities[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.capacities[index];
  }

  public deleteCapacity(id: string): boolean {
    const initialLen = this.data.capacities.length;
    this.data.capacities = this.data.capacities.filter(item => item.id !== id);
    if (this.data.capacities.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Process Steps (Tempo de Processo) ---
  public getProcessSteps(productId?: string): ProcessStep[] {
    if (productId) {
      return this.data.processSteps
        .filter(step => step.productId === productId)
        .sort((a, b) => a.stepOrder - b.stepOrder);
    }
    return [...this.data.processSteps].sort((a, b) => a.stepOrder - b.stepOrder);
  }

  public createProcessStep(item: Omit<ProcessStep, 'id' | 'createdAt' | 'updatedAt'>): ProcessStep {
    const now = new Date().toISOString();
    const newItem: ProcessStep = {
      ...item,
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.processSteps.push(newItem);
    this.persist();
    return newItem;
  }

  public updateProcessStep(id: string, updates: Partial<ProcessStep>): ProcessStep | null {
    const index = this.data.processSteps.findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data.processSteps[index] = {
      ...this.data.processSteps[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.processSteps[index];
  }

  public deleteProcessStep(id: string): boolean {
    const initialLen = this.data.processSteps.length;
    this.data.processSteps = this.data.processSteps.filter(item => item.id !== id);
    if (this.data.processSteps.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Sales Orders (Pedidos) ---
  public getOrders(): SalesOrder[] {
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): SalesOrder | undefined {
    return this.data.orders.find(item => item.id === id);
  }

  public createOrder(item: Omit<SalesOrder, 'id' | 'createdAt' | 'updatedAt'>): SalesOrder {
    const now = new Date().toISOString();
    const newItem: SalesOrder = {
      ...item,
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.orders.push(newItem);
    this.persist();
    return newItem;
  }

  public updateOrder(id: string, updates: Partial<SalesOrder>): SalesOrder | null {
    const index = this.data.orders.findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data.orders[index] = {
      ...this.data.orders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.orders[index];
  }

  public deleteOrder(id: string): boolean {
    const initialLen = this.data.orders.length;
    this.data.orders = this.data.orders.filter(item => item.id !== id);
    if (this.data.orders.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Production Orders (Ordens de Produção) ---
  public getProductionOrders(): ProductionOrder[] {
    return [...this.data.productionOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getProductionOrderById(id: string): ProductionOrder | undefined {
    return this.data.productionOrders.find(item => item.id === id);
  }

  public createProductionOrder(
    item: Omit<ProductionOrder, 'id' | 'createdAt' | 'updatedAt' | 'bomRequirements' | 'estimatedCycleTimeHours'>
  ): ProductionOrder {
    const now = new Date().toISOString();
    const product = this.getProductById(item.productId);

    // Calculate BOM requirements and check current stock
    const bomRequirements: ProductionOrderBomCheck[] = (product?.bom || []).map(b => {
      const rm = this.getRawMaterialById(b.rawMaterialId);
      const reqQty = Number((b.quantityPerUnit * item.quantity).toFixed(2));
      const current = rm ? rm.currentStock : 0;
      return {
        rawMaterialId: b.rawMaterialId,
        rawMaterialCode: b.rawMaterialCode,
        rawMaterialName: b.rawMaterialName,
        requiredQuantity: reqQty,
        currentStock: current,
        unit: b.unit,
        hasEnoughStock: current >= reqQty
      };
    });

    const cycleMinutes = product ? product.processTimeMinutes * item.quantity : 0;
    const cycleHours = Number((cycleMinutes / 60).toFixed(1));

    const newItem: ProductionOrder = {
      ...item,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      bomRequirements,
      estimatedCycleTimeHours: cycleHours,
      createdAt: now,
      updatedAt: now
    };

    this.data.productionOrders.push(newItem);

    // If linked to sales order, update sales order status
    if (item.salesOrderId) {
      this.updateOrder(item.salesOrderId, {
        status: 'in_production',
        productionOrderId: newItem.id
      });
    }

    this.persist();
    return newItem;
  }

  public updateProductionOrder(id: string, updates: Partial<ProductionOrder>): ProductionOrder | null {
    const index = this.data.productionOrders.findIndex(item => item.id === id);
    if (index === -1) return null;

    // Recalculate BOM requirements if quantity changed
    let bomRequirements = this.data.productionOrders[index].bomRequirements;
    if (updates.quantity && updates.quantity !== this.data.productionOrders[index].quantity) {
      const product = this.getProductById(this.data.productionOrders[index].productId);
      if (product) {
        bomRequirements = (product.bom || []).map(b => {
          const rm = this.getRawMaterialById(b.rawMaterialId);
          const reqQty = Number((b.quantityPerUnit * updates.quantity!).toFixed(2));
          const current = rm ? rm.currentStock : 0;
          return {
            rawMaterialId: b.rawMaterialId,
            rawMaterialCode: b.rawMaterialCode,
            rawMaterialName: b.rawMaterialName,
            requiredQuantity: reqQty,
            currentStock: current,
            unit: b.unit,
            hasEnoughStock: current >= reqQty
          };
        });
      }
    }

    this.data.productionOrders[index] = {
      ...this.data.productionOrders[index],
      ...updates,
      ...(updates.quantity ? { bomRequirements } : {}),
      updatedAt: new Date().toISOString()
    };

    this.persist();
    return this.data.productionOrders[index];
  }

  // --- Baixa de Ordem de Produção (Conclusão & Deduzir Estoque de Insumos) ---
  public completeProductionOrder(
    id: string,
    params: {
      producedQuantity: number;
      scrapQuantity?: number;
      completedBy?: string;
      notes?: string;
    }
  ): { success: boolean; productionOrder?: ProductionOrder; message?: string } {
    const op = this.getProductionOrderById(id);
    if (!op) {
      return { success: false, message: 'Ordem de produção não encontrada' };
    }

    if (op.status === 'completed') {
      return { success: false, message: 'Esta ordem de produção já foi baixada' };
    }

    const now = new Date().toISOString();
    const config = this.getConfig();
    const producedQty = params.producedQuantity > 0 ? params.producedQuantity : op.quantity;
    const scrapQty = params.scrapQuantity || 0;
    const completedBy = params.completedBy || `${config.technicalResponsible} (${config.technicalRegistration})`;

    // 1. Deduct raw materials based on BOM requirements
    const product = this.getProductById(op.productId);
    if (product && product.bom) {
      for (const item of product.bom) {
        const required = Number((item.quantityPerUnit * producedQty).toFixed(2));
        const rmIndex = this.data.rawMaterials.findIndex(r => r.id === item.rawMaterialId);
        if (rmIndex !== -1) {
          const newStock = Math.max(0, Number((this.data.rawMaterials[rmIndex].currentStock - required).toFixed(2)));
          this.data.rawMaterials[rmIndex].currentStock = newStock;
          this.data.rawMaterials[rmIndex].updatedAt = now;
        }
      }
    }

    // 2. Increase finished product stock
    if (product) {
      const prodIndex = this.data.products.findIndex(p => p.id === op.productId);
      if (prodIndex !== -1) {
        this.data.products[prodIndex].currentStock += producedQty;
        this.data.products[prodIndex].updatedAt = now;
      }
    }

    // 3. Mark OP as completed
    const updatedOp = this.updateProductionOrder(id, {
      status: 'completed',
      producedQuantity: producedQty,
      scrapQuantity: scrapQty,
      actualEndDate: new Date().toISOString().split('T')[0],
      completedAt: now,
      completedBy: completedBy,
      notes: params.notes ? `${op.notes ? op.notes + ' | ' : ''}${params.notes}` : op.notes
    });

    // 4. Update sales order if linked
    if (op.salesOrderId) {
      this.updateOrder(op.salesOrderId, {
        status: 'completed'
      });
    }

    this.persist();
    return { success: true, productionOrder: updatedOp || undefined };
  }

  public deleteProductionOrder(id: string): boolean {
    const initialLen = this.data.productionOrders.length;
    this.data.productionOrders = this.data.productionOrders.filter(item => item.id !== id);
    if (this.data.productionOrders.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Dashboard & Relatórios (Cálculo de Estatísticas em Tempo Real) ---
  public getDashboardStats() {
    const ops = this.data.productionOrders;
    const totalOps = ops.length;
    const inProgressOps = ops.filter(o => o.status === 'in_progress').length;
    const plannedOps = ops.filter(o => o.status === 'planned').length;
    const pausedOps = ops.filter(o => o.status === 'paused').length;
    const completedOps = ops.filter(o => o.status === 'completed').length;

    const totalProducedUnits = ops
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.producedQuantity || o.quantity), 0);

    // Raw materials with low stock
    const criticalRawMaterials = this.data.rawMaterials.filter(
      rm => rm.currentStock <= rm.minStock
    );

    // Total factory capacity (hours/day)
    const totalDailyCapacityHours = this.data.capacities
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + c.dailyHours * c.operatorCount, 0);

    // Active production load in hours
    const activeLoadHours = ops
      .filter(o => o.status === 'in_progress' || o.status === 'planned')
      .reduce((sum, o) => sum + (o.estimatedCycleTimeHours || 0), 0);

    // Occupancy rate estimate (over standard 5-day work week or daily capacity)
    const weeklyAvailableHours = totalDailyCapacityHours * 5;
    const occupancyRate = weeklyAvailableHours > 0
      ? Math.min(100, Math.round((activeLoadHours / weeklyAvailableHours) * 100))
      : 0;

    // Sales metrics
    const orders = this.data.orders;
    const totalOrdersAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'in_production').length;

    return {
      productionOrders: {
        total: totalOps,
        planned: plannedOps,
        inProgress: inProgressOps,
        paused: pausedOps,
        completed: completedOps
      },
      productionTotals: {
        producedUnits: totalProducedUnits,
        activeLoadHours: Number(activeLoadHours.toFixed(1)),
        totalDailyCapacityHours: Number(totalDailyCapacityHours.toFixed(1)),
        occupancyRatePercent: occupancyRate
      },
      rawMaterials: {
        totalCount: this.data.rawMaterials.length,
        criticalCount: criticalRawMaterials.length,
        criticalItems: criticalRawMaterials
      },
      products: {
        totalCount: this.data.products.length
      },
      orders: {
        totalCount: orders.length,
        pendingCount: pendingOrders,
        totalAmount: totalOrdersAmount
      },
      technicalResponsible: this.data.config.technicalResponsible,
      technicalRegistration: this.data.config.technicalRegistration,
      technicalRole: this.data.config.technicalRole
    };
  }
}
