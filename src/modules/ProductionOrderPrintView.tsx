import React from 'react';
import { ProductionOrder, Product, ProcessStep, CompanyConfig } from '../types';
import { Printer, X, ShieldCheck, Factory, CheckSquare } from 'lucide-react';

interface ProductionOrderPrintViewProps {
  order: ProductionOrder;
  product?: Product;
  processSteps: ProcessStep[];
  config: CompanyConfig;
  onClose: () => void;
}

export const ProductionOrderPrintView: React.FC<ProductionOrderPrintViewProps> = ({
  order,
  product,
  processSteps,
  config,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const stepsForThisProduct = processSteps.filter(
    (s) => s.productId === order.productId
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#120824]/85 backdrop-blur-xs overflow-y-auto p-4 sm:p-6 flex justify-center">
      {/* Container da Folha de Impressão */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl shadow-purple-950/40 overflow-hidden flex flex-col my-auto border border-purple-200/60 print:m-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Barra Superior de Ações (Oculta na Impressão) */}
        <div className="px-6 py-4 bg-[#1a0f30] text-white flex items-center justify-between border-b border-purple-900/50 print:hidden">
          <div>
            <h3 className="font-bold text-base bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Visualização de Impressão da OP
            </h3>
            <p className="text-xs text-purple-200/70">
              Folha oficial de chão de fábrica pronta para expedição e apontamento
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-md shadow-purple-900/40"
            >
              <Printer className="w-4 h-4" />
              Imprimir Documento
            </button>
            <button
              onClick={onClose}
              className="p-2 text-purple-300 hover:text-white rounded-lg hover:bg-purple-900/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DOCUMENTO IMPRESSO (Folha A4) */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-900 bg-white font-sans text-xs">
          {/* Cabeçalho da Empresa & Ordem */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Factory className="w-6 h-6 text-slate-900" />
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                  {config.companyName}
                </h1>
              </div>
              <p className="text-[11px] text-slate-600">
                CNPJ: {config.cnpj} • {config.address}, {config.city}-{config.state}
              </p>
              <p className="text-[11px] text-slate-600">
                Telefone: {config.phone} • E-mail: {config.email}
              </p>
            </div>

            <div className="text-right border-l-2 border-slate-300 pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Ordem de Produção
              </span>
              <div className="text-2xl font-black font-mono text-slate-900">
                {order.orderNumber}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                Emissão: {new Date(order.createdAt).toLocaleDateString('pt-BR')}
              </div>
              {/* Fake Barcode Representation */}
              <div className="mt-2 tracking-widest font-mono text-[9px] bg-slate-100 px-2 py-0.5 rounded border border-slate-300 inline-block">
                |||| | ||||| || ||| {order.orderNumber}
              </div>
            </div>
          </div>

          {/* Dados do Produto & Planejamento */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Código do Produto
              </span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {order.productCode}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Descrição do Produto
              </span>
              <span className="font-bold text-sm text-slate-900">
                {order.productName}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Quantidade Programada
              </span>
              <span className="font-extrabold text-base text-purple-900">
                {order.quantity} {product?.unit || 'UN'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Pedido de Venda
              </span>
              <span className="font-semibold text-slate-800">
                {order.salesOrderNumber || 'Produção p/ Estoque'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Cliente
              </span>
              <span className="font-semibold text-slate-800 truncate block">
                {order.clientName || 'Estoque Interno'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Data Início Prevista
              </span>
              <span className="font-semibold text-slate-800">
                {order.startDate ? new Date(order.startDate).toLocaleDateString('pt-BR') : '-'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Data Término Prevista
              </span>
              <span className="font-semibold text-slate-800">
                {order.expectedEndDate ? new Date(order.expectedEndDate).toLocaleDateString('pt-BR') : '-'}
              </span>
            </div>
          </div>

          {/* Especificações Técnicas */}
          {product?.technicalSpecs && (
            <div className="border border-slate-300 rounded-lg p-3 bg-white">
              <h4 className="text-[11px] font-bold uppercase text-slate-700 tracking-wider mb-1">
                Especificações Técnicas de Engenharia
              </h4>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                {product.technicalSpecs}
              </p>
            </div>
          )}

          {/* Lista de Separação de Matérias-Primas (BOM / Almoxarifado) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                1. Lista de Separação de Materiais (Almoxarifado / Kit de Fabricação)
              </h4>
              <span className="text-[10px] text-slate-500 font-medium">
                Visto Almoxarife: [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]
              </span>
            </div>
            <table className="w-full border border-slate-300 text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[10px] uppercase font-bold text-slate-700">
                  <th className="p-2 border-r border-slate-300 w-24">Código</th>
                  <th className="p-2 border-r border-slate-300">Descrição do Insumo / Matéria-Prima</th>
                  <th className="p-2 border-r border-slate-300 w-24 text-right">Qtd. / Un</th>
                  <th className="p-2 border-r border-slate-300 w-28 text-right">Qtd. Total</th>
                  <th className="p-2 border-r border-slate-300 w-20 text-center">Unidade</th>
                  <th className="p-2 w-28 text-center">Conferido</th>
                </tr>
              </thead>
              <tbody>
                {order.bomRequirements && order.bomRequirements.length > 0 ? (
                  order.bomRequirements.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200 text-[11px]">
                      <td className="p-2 border-r border-slate-300 font-mono font-semibold">
                        {item.rawMaterialCode}
                      </td>
                      <td className="p-2 border-r border-slate-300">
                        {item.rawMaterialName}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-right">
                        {(item.requiredQuantity / order.quantity).toFixed(2)}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-right font-bold">
                        {item.requiredQuantity}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-center font-semibold">
                        {item.unit}
                      </td>
                      <td className="p-2 text-center text-slate-400">
                        [ &nbsp; ] OK
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-3 text-center text-slate-400">
                      Nenhum insumo listado na ficha técnica deste produto.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Roteiro de Fabricação e Apontamento de Processo */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              2. Roteiro de Fabricação e Apontamento de Tempos no Chão de Fábrica
            </h4>
            <table className="w-full border border-slate-300 text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[10px] uppercase font-bold text-slate-700">
                  <th className="p-2 border-r border-slate-300 w-10 text-center">Seq</th>
                  <th className="p-2 border-r border-slate-300">Etapa de Processo / Posto de Trabalho</th>
                  <th className="p-2 border-r border-slate-300 w-24 text-right">Tempo Est.</th>
                  <th className="p-2 border-r border-slate-300 w-24 text-center">Início</th>
                  <th className="p-2 border-r border-slate-300 w-24 text-center">Término</th>
                  <th className="p-2 border-r border-slate-300 w-28 text-center">Operador</th>
                  <th className="p-2 w-20 text-center">Visto</th>
                </tr>
              </thead>
              <tbody>
                {stepsForThisProduct.length > 0 ? (
                  stepsForThisProduct.map((step) => {
                    const totalStepMinutes = (step.setupTimeMinutes + step.operationTimeMinutes * order.quantity);
                    return (
                      <tr key={step.id} className="border-b border-slate-200 text-[11px]">
                        <td className="p-2 border-r border-slate-300 text-center font-bold">
                          {step.stepOrder}
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          <strong className="text-slate-900 block">{step.name}</strong>
                          <span className="text-[10px] text-slate-500">Posto: {step.workCenterName}</span>
                        </td>
                        <td className="p-2 border-r border-slate-300 text-right">
                          {totalStepMinutes} min
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center text-slate-300">
                          ___:___
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center text-slate-300">
                          ___:___
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center text-slate-300">
                          _______________
                        </td>
                        <td className="p-2 text-center text-slate-300">
                          [ &nbsp; ]
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border-r border-slate-300 text-center font-bold">1</td>
                    <td className="p-2 border-r border-slate-300">Produção Geral e Montagem Final</td>
                    <td className="p-2 border-r border-slate-300 text-right">{order.estimatedCycleTimeHours * 60} min</td>
                    <td className="p-2 border-r border-slate-300 text-center text-slate-300">___:___</td>
                    <td className="p-2 border-r border-slate-300 text-center text-slate-300">___:___</td>
                    <td className="p-2 border-r border-slate-300 text-center text-slate-300">_______________</td>
                    <td className="p-2 text-center text-slate-300">[ &nbsp; ]</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Observações da Ordem */}
          {order.notes && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
              <strong>Observações de Fabricação:</strong> {order.notes}
            </div>
          )}

          {/* BLOCO FORMAL DE RESPONSABILIDADE TÉCNICA E ASSINATURAS */}
          <div className="pt-6 border-t-2 border-slate-900 mt-6 grid grid-cols-2 gap-8 text-center">
            {/* Bloco do Chão de Fábrica */}
            <div className="space-y-4">
              <div className="pt-8 border-t border-dashed border-slate-400">
                <p className="font-bold text-slate-900 text-xs">Líder de Produção / Encarregado</p>
                <p className="text-[10px] text-slate-500">Data de Término Efetivo: ___/___/______</p>
                <p className="text-[10px] text-slate-500">Qtd. Aprovada: _______ &nbsp;•&nbsp; Refugo: _______</p>
              </div>
            </div>

            {/* Bloco Oficial do Responsável Técnico Requisitado */}
            <div className="space-y-4">
              <div className="pt-8 border-t border-slate-900">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <p className="font-bold text-slate-900 text-xs">
                    {order.technicalResponsible || config.technicalResponsible}
                  </p>
                </div>
                <p className="text-[10px] font-semibold text-slate-700">
                  {order.technicalRole || config.technicalRole}
                </p>
                <p className="text-[10px] font-mono text-slate-600">
                  Registro: {order.technicalRegistration || config.technicalRegistration}
                </p>
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                  Responsável Técnico Legal / NexusERP
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
