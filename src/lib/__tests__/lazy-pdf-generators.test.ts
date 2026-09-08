/**
 * Deterministic success-path tests for the lazily imported PDF generators.
 *
 * The mocked dependency implementations are installed before each generator
 * is loaded in an isolated registry. Success tests prove neither dependency is
 * resolved/invoked until the generator function reaches its dynamic import.
 */

import type { InvoiceData, QuoteData } from '../pdf/types';
import type { ContractData } from '@/types/contract';

type PdfTestState = {
  html2canvas: jest.Mock;
  jsPDF: jest.Mock;
};

const state = ((globalThis as any).__lazyPdfGeneratorTest__ ??= {
  html2canvas: jest.fn(),
  jsPDF: jest.fn(),
}) as PdfTestState;

jest.mock('html2canvas', () => ({
  __esModule: true,
  default: (...args: unknown[]) => state.html2canvas(...args),
}));

jest.mock('jspdf', () => ({
  __esModule: true,
  jsPDF: function lazyJsPDF(...args: unknown[]) {
    return state.jsPDF(...args);
  },
}));

const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
const CANVAS_WIDTH = 1240;
const CANVAS_HEIGHT = 1754;

const quoteData: QuoteData = {
  quoteNumber: 'Q-LAZY-001',
  issueDate: '2026-09-01',
  expiryDate: '2026-10-01',
  customerName: '株式会社テスト',
  items: [
    {
      id: 'item-1',
      name: 'スタンドパウチ',
      quantity: 1000,
      unit: '枚',
      unitPrice: 20,
    },
  ],
  paymentTerms: '月末締め翌月末払い',
  deliveryDate: '受注後30日',
  deliveryLocation: '貴社指定場所',
  validityPeriod: '30日',
};

const invoiceData: InvoiceData = {
  invoiceNumber: 'INV-LAZY-001',
  issueDate: '2026-09-01',
  dueDate: '2026-10-01',
  billingName: '株式会社テスト',
  items: [
    {
      id: 'invoice-item-1',
      name: '印刷制作費',
      quantity: 1,
      unit: '式',
      unitPrice: 100000,
      amount: 100000,
    },
  ],
  paymentMethod: '銀行振込',
};

const contractData: ContractData = {
  contractNumber: 'C-LAZY-001',
  issueDate: '2026-09-01',
  effectiveDate: '2026-09-10',
  status: 'active',
  seller: {
    name: 'EPAC株式会社',
    postalCode: '100-0001',
    address: '東京都千代田区1-1-1',
    representative: '販売代表',
    representativeTitle: '代表取締役',
  },
  buyer: {
    name: '株式会社テスト',
    postalCode: '150-0001',
    address: '東京都渋谷区2-2-2',
    representative: '購入代表',
    representativeTitle: '代表取締役',
  },
  items: [
    {
      id: 'contract-item-1',
      name: 'スタンドパウチ',
      specification: '材質: PET/AL/PE; 厚み: 100μm',
      quantity: 1000,
      unit: '枚',
      unitPrice: 20,
      amount: 20000,
    },
  ],
  terms: {
    payment: {
      method: '銀行振込',
      deadline: '納品後30日以内',
    },
    delivery: {
      period: '受注後30日',
      location: '貴社指定場所',
      conditions: '分割納入可',
    },
    specialTerms: ['最初の特約', '2番目の特約'],
  },
};

function createCanvas() {
  return {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,UEQG'),
  };
}

function createPdfDocument() {
  const arrayBuffer = PDF_BYTES.slice().buffer;
  const blob = new Blob([PDF_BYTES], { type: 'application/pdf' });

  return {
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setFillColor: jest.fn(),
    setDrawColor: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    rect: jest.fn(),
    addPage: jest.fn(),
    splitTextToSize: jest.fn().mockReturnValue(['最初の特約', '2番目の特約']),
    addImage: jest.fn(),
    output: jest.fn((outputType: string) => {
      if (outputType === 'arraybuffer') return arrayBuffer;
      if (outputType === 'blob') return blob;
      if (outputType === 'datauristring') return 'data:application/pdf;base64,UEQG';
      throw new Error(`Unexpected jsPDF output type: ${outputType}`);
    }),
    save: jest.fn(),
    getNumberOfPages: jest.fn().mockReturnValue(1),
  };
}

function captureLayoutForCleanup() {
  const html = document.documentElement.style;
  const body = document.body.style;
  return {
    htmlOverflow: html.overflow,
    htmlPosition: html.position,
    htmlWidth: html.width,
    htmlTop: html.top,
    htmlTransform: html.transform,
    bodyOverflow: body.overflow,
    bodyPosition: body.position,
    bodyWidth: body.width,
    bodyMinWidth: body.minWidth,
    bodyTransform: body.transform,
  };
}

function expectLayoutRestored(layout: ReturnType<typeof captureLayoutForCleanup>) {
  const html = document.documentElement.style;
  const body = document.body.style;
  expect({
    htmlOverflow: html.overflow,
    htmlPosition: html.position,
    htmlWidth: html.width,
    htmlTop: html.top,
    htmlTransform: html.transform,
    bodyOverflow: body.overflow,
    bodyPosition: body.position,
    bodyWidth: body.width,
    bodyMinWidth: body.minWidth,
    bodyTransform: body.transform,
  }).toEqual(layout);
}

function installCanvasMocks(expectFrozenLayout = true) {
  const canvas = createCanvas();
  state.html2canvas = jest.fn().mockImplementation(async () => {
    if (expectFrozenLayout) {
      expect(document.documentElement.style.overflow).toBe('hidden');
      expect(document.body.style.overflow).toBe('hidden');
    }
    return canvas;
  });
  return canvas;
}

function installJsPDFMocks() {
  const document = createPdfDocument();
  state.jsPDF = jest.fn().mockImplementation(() => document);
  return document;
}

async function loadGenerator(modulePath: string) {
  let generatorModule: any;
  await jest.isolateModulesAsync(async () => {
    state.html2canvas.mockClear();
    state.jsPDF.mockClear();
    generatorModule = await import(modulePath);
  });
  return generatorModule;
}

async function advanceThroughCanvasDelays(promise: Promise<unknown>) {
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalScrollTo = window.scrollTo;
  window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  }) as typeof window.requestAnimationFrame;
  window.scrollTo = jest.fn();

  try {
    jest.useFakeTimers();
    const pending = promise;
    await jest.advanceTimersByTimeAsync(600);
    return await pending;
  } finally {
    jest.useRealTimers();
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.scrollTo = originalScrollTo;
  }
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('lazy PDF generator success paths', () => {
  it('imports browser dependencies and generates a quote Uint8Array only during generation', async () => {
    const canvas = installCanvasMocks();
    const pdf = installJsPDFMocks();
    const generator = await loadGenerator('../pdf/quote-pdf');
    const layoutBefore = captureLayoutForCleanup();

    expect(state.html2canvas).not.toHaveBeenCalled();
    expect(state.jsPDF).not.toHaveBeenCalled();
    expect(document.querySelectorAll('div[style*="z-index: -999999"]')).toHaveLength(0);

    const result = await advanceThroughCanvasDelays(
      generator.generateQuotePDF(quoteData, { filename: 'lazy-quote.pdf' })
    );

    expect(state.html2canvas).toHaveBeenCalledTimes(1);
    expect(state.jsPDF).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: true,
      pdfBuffer: PDF_BYTES,
      filename: 'lazy-quote.pdf',
      size: PDF_BYTES.length,
    });
    expect(result.pdfBuffer).toBeInstanceOf(Uint8Array);

    const [canvasTarget, canvasOptions] = state.html2canvas.mock.calls[0] as [
      HTMLElement,
      Record<string, unknown>,
    ];
    expect(document.body.contains(canvasTarget)).toBe(false);
    expect(canvasTarget.style.left).toBe('-99999px');
    expect(canvasOptions).toMatchObject({
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      allowTaint: true,
    });
    const fittedWidth = 180;
    const canvasAspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
    const fittedHeight = fittedWidth / canvasAspectRatio;
    expect(canvas.toDataURL).toHaveBeenNthCalledWith(2, 'image/png', 0.95);
    expect(state.jsPDF).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    expect(pdf.addImage).toHaveBeenCalledWith(
      'data:image/png;base64,UEQG',
      'PNG',
      15,
      10 + (277 - fittedHeight) / 2,
      fittedWidth,
      fittedHeight
    );
    expect(pdf.output).toHaveBeenCalledWith('arraybuffer');
    expectLayoutRestored(layoutBefore);
    expect(document.querySelectorAll('div[style*="z-index: -999999"]')).toHaveLength(0);
  });

  it('imports browser dependencies, saves an invoice, and removes its temporary element', async () => {
    const canvas = installCanvasMocks(false);
    const pdf = installJsPDFMocks();
    const generator = await loadGenerator('../pdf/invoice-pdf');
    const initialBodyChildren = document.body.children.length;

    expect(state.html2canvas).not.toHaveBeenCalled();
    expect(state.jsPDF).not.toHaveBeenCalled();

    const result = await generator.generateInvoicePDF(invoiceData);

    expect(state.html2canvas).toHaveBeenCalledTimes(1);
    expect(state.jsPDF).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: true,
      filename: 'Invoice_INV-LAZY-001.pdf',
    });

    const [invoiceTarget, canvasOptions] = state.html2canvas.mock.calls[0] as [
      HTMLElement,
      Record<string, unknown>,
    ];
    expect(document.body.contains(invoiceTarget)).toBe(false);
    expect(canvasOptions).toEqual({
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 794,
    });
    expect(canvasOptions).not.toHaveProperty('allowTaint');
    expect(canvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(state.jsPDF).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    expect(pdf.addImage).toHaveBeenCalledWith(
      'data:image/png;base64,UEQG',
      'PNG',
      0,
      0,
      210,
      (CANVAS_HEIGHT * 210) / CANVAS_WIDTH
    );
    expect(pdf.save).toHaveBeenCalledWith('Invoice_INV-LAZY-001.pdf');
    expect(document.body.children.length).toBe(initialBodyChildren);
  });

  it('imports browser dependencies and returns a Blob for a multi-quantity quote', async () => {
    installCanvasMocks();
    const pdf = installJsPDFMocks();
    const generator = await loadGenerator('../pdf/multi-quantity-pdf');
    const layoutBefore = captureLayoutForCleanup();

    expect(state.html2canvas).not.toHaveBeenCalled();
    expect(state.jsPDF).not.toHaveBeenCalled();

    const result = await advanceThroughCanvasDelays(
      generator.generateMultiQuantityPDF(
        [
          {
            quantity: 1000,
            unitPrice: 20,
            totalPrice: 20000,
            recommendation: { method: 'digital' },
          },
        ],
        { filename: 'multi-quantity-lazy' }
      )
    );

    expect(state.html2canvas).toHaveBeenCalledTimes(1);
    expect(state.jsPDF).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(Blob);
    expect(await result.arrayBuffer()).toEqual(PDF_BYTES.slice().buffer);
    expect(pdf.output).toHaveBeenCalledWith('blob');
    expect(pdf.addImage).toHaveBeenCalledWith(
      'data:image/png;base64,UEQG',
      'PNG',
      15,
      10 + (277 - 180 / (CANVAS_WIDTH / CANVAS_HEIGHT)) / 2,
      180,
      180 / (CANVAS_WIDTH / CANVAS_HEIGHT)
    );
    expectLayoutRestored(layoutBefore);
    expect(document.querySelectorAll('div[style*="z-index: -999999"]')).toHaveLength(0);
  });

  it('lazily imports jsPDF and returns a Uint8Array for a contract', async () => {
    const pdf = installJsPDFMocks();
    const generator = await loadGenerator('../pdf-contracts');

    expect(state.html2canvas).not.toHaveBeenCalled();
    expect(state.jsPDF).not.toHaveBeenCalled();

    const result = await generator.generateContractPDF({
      contractNumber: 'CONTRACT-LAZY-001',
      orderNumber: 'ORDER-LAZY-001',
      customerName: '株式会社テスト',
      customerEmail: 'buyer@example.com',
      totalAmount: 22000,
      currency: 'JPY',
      validFrom: '2026-09-01',
      validUntil: '2027-08-31',
      terms: '最初の契約条項 2番目の契約条項',
      status: 'active',
      items: [
        {
          product_name: 'スタンドパウチ',
          quantity: 1000,
          unit_price: 20,
          total_price: 20000,
        },
      ],
      signatures: {
        customer: { signed: true, signedAt: '2026-09-02T00:00:00.000Z' },
        admin: { signed: false },
      },
    });

    expect(state.html2canvas).not.toHaveBeenCalled();
    expect(state.jsPDF).toHaveBeenCalledTimes(1);
    expect(ArrayBuffer.isView(result)).toBe(true);
    expect(Array.from(result)).toEqual([0x25, 0x50, 0x44, 0x46]);
    expect(state.jsPDF).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    expect(pdf.text).toHaveBeenCalledWith('Customer: 株式会社テスト', 25, 62);
    expect(pdf.text).toHaveBeenCalledWith('1. スタンドパウチ', 25, 84);
    expect(pdf.splitTextToSize).toHaveBeenCalledWith(
      '最初の契約条項 2番目の契約条項',
      170
    );
    expect(pdf.output).toHaveBeenCalledWith('arraybuffer');
  });

  it('lazily imports jsPDF and returns a Uint8Array for an enhanced contract', async () => {
    const pdf = installJsPDFMocks();
    const generator = await loadGenerator('../pdf-contracts-enhanced');

    expect(state.html2canvas).not.toHaveBeenCalled();
    expect(state.jsPDF).not.toHaveBeenCalled();

    const result = await generator.generateEnhancedContractPDF(contractData);

    expect(state.html2canvas).not.toHaveBeenCalled();
    expect(state.jsPDF).toHaveBeenCalledTimes(1);
    expect(ArrayBuffer.isView(result)).toBe(true);
    expect(Array.from(result)).toEqual([0x25, 0x50, 0x44, 0x46]);
    expect(state.jsPDF).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    expect(pdf.rect).toHaveBeenCalledWith(20, expect.any(Number), 170, expect.any(Number), 'F');
    expect(pdf.text).toHaveBeenCalledWith('契約番号: C-LAZY-001', 20, expect.any(Number));
    expect(pdf.splitTextToSize).toHaveBeenCalledWith(
      '仕様: 材質: PET/AL/PE; 厚み: 100μm',
      130
    );
    expect(pdf.output).toHaveBeenCalledWith('arraybuffer');
  });

});
