import express, { Request, Response } from 'express';
import { Database } from './db.ts';

export function createApiRouter(): express.Router {
  const router = express.Router();
  const db = Database.getInstance();

  router.use(express.json());

  // --- Company & Technical Responsible ---
  router.get('/config', (req: Request, res: Response) => {
    try {
      const config = db.getConfig();
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/config', (req: Request, res: Response) => {
    try {
      const updated = db.updateConfig(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Raw Materials (Matéria Prima) ---
  router.get('/raw-materials', (req: Request, res: Response) => {
    try {
      const materials = db.getRawMaterials();
      res.json(materials);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/raw-materials', (req: Request, res: Response) => {
    try {
      const { code, name, category, unit, currentStock, minStock, unitCost, supplierId, supplierName, location, notes } = req.body;
      if (!code || !name || !unit) {
        return res.status(400).json({ error: 'Código, nome e unidade são obrigatórios' });
      }
      const newItem = db.createRawMaterial({
        code: String(code).trim().toUpperCase(),
        name: String(name).trim(),
        category: category || 'Geral',
        unit: String(unit).trim().toUpperCase(),
        currentStock: Number(currentStock) || 0,
        minStock: Number(minStock) || 0,
        unitCost: Number(unitCost) || 0,
        supplierId,
        supplierName,
        location,
        notes
      });
      res.status(201).json(newItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/raw-materials/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = db.updateRawMaterial(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Matéria-prima não encontrada' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/raw-materials/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = db.deleteRawMaterial(id);
      if (!success) {
        return res.status(404).json({ error: 'Matéria-prima não encontrada' });
      }
      res.json({ message: 'Matéria-prima excluída com sucesso' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Products (Ficha Técnica do Produto) ---
  router.get('/products', (req: Request, res: Response) => {
    try {
      const products = db.getProducts();
      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/products', (req: Request, res: Response) => {
    try {
      const { code, name, category, unit, salePrice, currentStock, minStock, technicalSpecs, bom, processTimeMinutes, active } = req.body;
      if (!code || !name) {
        return res.status(400).json({ error: 'Código e nome do produto são obrigatórios' });
      }

      // Calculate estimated cost from BOM
      const itemsBom = Array.isArray(bom) ? bom : [];
      const estimatedCost = itemsBom.reduce((sum: number, b: any) => sum + (Number(b.totalCost) || (Number(b.quantityPerUnit) * Number(b.unitCost)) || 0), 0);

      const newItem = db.createProduct({
        code: String(code).trim().toUpperCase(),
        name: String(name).trim(),
        category: category || 'Geral',
        unit: unit || 'UN',
        salePrice: Number(salePrice) || 0,
        estimatedCost: Number(estimatedCost.toFixed(2)),
        currentStock: Number(currentStock) || 0,
        minStock: Number(minStock) || 0,
        technicalSpecs: technicalSpecs || '',
        bom: itemsBom,
        processTimeMinutes: Number(processTimeMinutes) || 0,
        active: active !== undefined ? Boolean(active) : true
      });
      res.status(201).json(newItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/products/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (Array.isArray(data.bom)) {
        data.estimatedCost = Number(
          data.bom.reduce((sum: number, b: any) => sum + (Number(b.totalCost) || (Number(b.quantityPerUnit) * Number(b.unitCost)) || 0), 0).toFixed(2)
        );
      }
      const updated = db.updateProduct(id, data);
      if (!updated) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/products/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = db.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      res.json({ message: 'Produto excluído com sucesso' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Partners (Clientes & Fornecedores) ---
  router.get('/partners', (req: Request, res: Response) => {
    try {
      const type = req.query.type as string | undefined;
      let partners = db.getPartners();
      if (type && type !== 'all') {
        partners = partners.filter(p => p.type === type || p.type === 'both');
      }
      res.json(partners);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/partners', (req: Request, res: Response) => {
    try {
      const { code, type, name, tradeName, document, stateRegistration, email, phone, address, city, state, notes } = req.body;
      if (!name || !document) {
        return res.status(400).json({ error: 'Nome/Razão Social e CPF/CNPJ são obrigatórios' });
      }
      const newItem = db.createPartner({
        code: code || `PAR-${Date.now().toString().slice(-4)}`,
        type: type || 'client',
        name: String(name).trim(),
        tradeName: tradeName ? String(tradeName).trim() : '',
        document: String(document).trim(),
        stateRegistration: stateRegistration || '',
        email: email || '',
        phone: phone || '',
        address: address || '',
        city: city || '',
        state: state || '',
        status: 'active',
        notes: notes || ''
      });
      res.status(201).json(newItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/partners/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = db.updatePartner(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Parceiro não encontrado' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/partners/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = db.deletePartner(id);
      if (!success) {
        return res.status(404).json({ error: 'Parceiro não encontrado' });
      }
      res.json({ message: 'Parceiro excluído com sucesso' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Capacities (Capacidade Produtiva) ---
  router.get('/capacities', (req: Request, res: Response) => {
    try {
      const capacities = db.getCapacities();
      res.json(capacities);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/capacities', (req: Request, res: Response) => {
    try {
      const { code, name, department, dailyHours, operatorCount, nominalCapacityUnitsPerDay, efficiencyRate, status, notes } = req.body;
      if (!name || !code) {
        return res.status(400).json({ error: 'Código e nome do posto são obrigatórios' });
      }
      const newItem = db.createCapacity({
        code: String(code).trim().toUpperCase(),
        name: String(name).trim(),
        department: department || 'Geral',
        dailyHours: Number(dailyHours) || 8,
        operatorCount: Number(operatorCount) || 1,
        nominalCapacityUnitsPerDay: Number(nominalCapacityUnitsPerDay) || 10,
        efficiencyRate: Number(efficiencyRate) || 85,
        status: status || 'active',
        notes: notes || ''
      });
      res.status(201).json(newItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/capacities/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = db.updateCapacity(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Posto de capacidade não encontrado' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/capacities/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = db.deleteCapacity(id);
      if (!success) {
        return res.status(404).json({ error: 'Posto de capacidade não encontrado' });
      }
      res.json({ message: 'Posto excluído com sucesso' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Process Steps (Tempo de Processo / Roteiro) ---
  router.get('/process-steps', (req: Request, res: Response) => {
    try {
      const productId = req.query.productId as string | undefined;
      const steps = db.getProcessSteps(productId);
      res.json(steps);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/process-steps', (req: Request, res: Response) => {
    try {
      const { productId, stepOrder, name, workCenterId, setupTimeMinutes, operationTimeMinutes, description } = req.body;
      if (!productId || !name || !workCenterId) {
        return res.status(400).json({ error: 'Produto, etapa e posto de trabalho são obrigatórios' });
      }

      const product = db.getProductById(productId);
      const workCenter = db.getCapacityById(workCenterId);

      const newItem = db.createProcessStep({
        productId,
        productCode: product ? product.code : '',
        productName: product ? product.name : '',
        stepOrder: Number(stepOrder) || 1,
        name: String(name).trim(),
        workCenterId,
        workCenterName: workCenter ? workCenter.name : '',
        setupTimeMinutes: Number(setupTimeMinutes) || 0,
        operationTimeMinutes: Number(operationTimeMinutes) || 0,
        description: description || ''
      });

      // Also recalculate product total process time
      if (product) {
        const allSteps = db.getProcessSteps(productId);
        const totalMinutes = allSteps.reduce((sum, s) => sum + s.operationTimeMinutes, 0);
        db.updateProduct(productId, { processTimeMinutes: totalMinutes });
      }

      res.status(201).json(newItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/process-steps/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = db.updateProcessStep(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Etapa de processo não encontrada' });
      }

      // Recalculate product process time
      const allSteps = db.getProcessSteps(updated.productId);
      const totalMinutes = allSteps.reduce((sum, s) => sum + s.operationTimeMinutes, 0);
      db.updateProduct(updated.productId, { processTimeMinutes: totalMinutes });

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/process-steps/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const steps = db.getProcessSteps();
      const target = steps.find(s => s.id === id);
      const success = db.deleteProcessStep(id);
      if (!success) {
        return res.status(404).json({ error: 'Etapa não encontrada' });
      }

      if (target) {
        const allSteps = db.getProcessSteps(target.productId);
        const totalMinutes = allSteps.reduce((sum, s) => sum + s.operationTimeMinutes, 0);
        db.updateProduct(target.productId, { processTimeMinutes: totalMinutes });
      }

      res.json({ message: 'Etapa excluída com sucesso' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Sales Orders (Pedidos) ---
  router.get('/orders', (req: Request, res: Response) => {
    try {
      const orders = db.getOrders();
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/orders', (req: Request, res: Response) => {
    try {
      const { orderNumber, partnerId, orderDate, deliveryDate, items, notes } = req.body;
      if (!partnerId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Cliente e pelo menos um item são obrigatórios' });
      }

      const client = db.getPartnerById(partnerId);
      const totalAmount = items.reduce((sum: number, it: any) => sum + (Number(it.totalPrice) || (Number(it.quantity) * Number(it.unitPrice))), 0);

      const generatedNum = orderNumber || `PED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newItem = db.createOrder({
        orderNumber: generatedNum,
        partnerId,
        clientName: client ? client.name : 'Cliente',
        clientDocument: client ? client.document : '',
        orderDate: orderDate || new Date().toISOString().split('T')[0],
        deliveryDate: deliveryDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        items,
        totalAmount: Number(totalAmount.toFixed(2)),
        status: 'pending',
        notes: notes || ''
      });

      res.status(201).json(newItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/orders/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = db.updateOrder(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/orders/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = db.deleteOrder(id);
      if (!success) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      res.json({ message: 'Pedido excluído com sucesso' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Generate Production Order directly from Sales Order
  router.post('/orders/:id/generate-op', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const order = db.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      if (!order.items || order.items.length === 0) {
        return res.status(400).json({ error: 'Pedido não possui itens para produzir' });
      }

      const item = order.items[0]; // Primary product item
      const config = db.getConfig();

      const opCount = db.getProductionOrders().length + 1;
      const opNum = `OP-${new Date().getFullYear()}-${String(opCount).padStart(3, '0')}`;

      const newOp = db.createProductionOrder({
        orderNumber: opNum,
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        salesOrderId: order.id,
        salesOrderNumber: order.orderNumber,
        clientName: order.clientName,
        quantity: item.quantity,
        producedQuantity: 0,
        scrapQuantity: 0,
        status: 'planned',
        priority: 'normal',
        startDate: new Date().toISOString().split('T')[0],
        expectedEndDate: order.deliveryDate,
        technicalResponsible: config.technicalResponsible,
        technicalRole: config.technicalRole,
        technicalRegistration: config.technicalRegistration,
        notes: `Gerada automaticamente a partir do pedido ${order.orderNumber}`
      });

      res.status(201).json(newOp);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Production Orders (Ordens de Produção) ---
  router.get('/production-orders', (req: Request, res: Response) => {
    try {
      const ops = db.getProductionOrders();
      res.json(ops);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/production-orders/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const op = db.getProductionOrderById(id);
      if (!op) {
        return res.status(404).json({ error: 'Ordem de produção não encontrada' });
      }
      res.json(op);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/production-orders', (req: Request, res: Response) => {
    try {
      const {
        productId,
        quantity,
        salesOrderId,
        priority,
        startDate,
        expectedEndDate,
        notes,
        technicalResponsible,
        technicalRole,
        technicalRegistration
      } = req.body;

      if (!productId || !quantity || Number(quantity) <= 0) {
        return res.status(400).json({ error: 'Produto e quantidade válida são obrigatórios' });
      }

      const product = db.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto selecionado não existe' });
      }

      const config = db.getConfig();
      const salesOrder = salesOrderId ? db.getOrderById(salesOrderId) : undefined;

      const opCount = db.getProductionOrders().length + 1;
      const opNumber = `OP-${new Date().getFullYear()}-${String(opCount).padStart(3, '0')}`;

      const newOp = db.createProductionOrder({
        orderNumber: opNumber,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        salesOrderId: salesOrder ? salesOrder.id : undefined,
        salesOrderNumber: salesOrder ? salesOrder.orderNumber : undefined,
        clientName: salesOrder ? salesOrder.clientName : undefined,
        quantity: Number(quantity),
        producedQuantity: 0,
        scrapQuantity: 0,
        status: 'planned',
        priority: priority || 'normal',
        startDate: startDate || new Date().toISOString().split('T')[0],
        expectedEndDate: expectedEndDate || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        technicalResponsible: technicalResponsible || config.technicalResponsible,
        technicalRole: technicalRole || config.technicalRole,
        technicalRegistration: technicalRegistration || config.technicalRegistration,
        notes: notes || ''
      });

      res.status(201).json(newOp);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/production-orders/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = db.updateProductionOrder(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Ordem de produção não encontrada' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update status (e.g. from planned to in_progress or paused)
  router.patch('/production-orders/:id/status', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }
      const updated = db.updateProductionOrder(id, { status });
      if (!updated) {
        return res.status(404).json({ error: 'Ordem não encontrada' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Baixa / Conclusão da Ordem de Produção
  router.post('/production-orders/:id/complete', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { producedQuantity, scrapQuantity, completedBy, notes } = req.body;

      const result = db.completeProductionOrder(id, {
        producedQuantity: Number(producedQuantity),
        scrapQuantity: Number(scrapQuantity) || 0,
        completedBy,
        notes
      });

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json({
        message: 'Baixa da Ordem de Produção efetuada com sucesso! Matérias-primas baixadas e estoque de produtos atualizado.',
        productionOrder: result.productionOrder
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/production-orders/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = db.deleteProductionOrder(id);
      if (!success) {
        return res.status(404).json({ error: 'Ordem não encontrada' });
      }
      res.json({ message: 'Ordem excluída com sucesso' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Dashboard & Analytics Stats ---
  router.get('/dashboard/stats', (req: Request, res: Response) => {
    try {
      const stats = db.getDashboardStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Database Reset ---
  router.post('/database/reset', (req: Request, res: Response) => {
    try {
      const resetData = db.resetToInitialSeed();
      res.json({ message: 'Banco de dados restaurado com dados de demonstração com sucesso.', resetData });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
