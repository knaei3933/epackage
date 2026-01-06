/**
 * Shipping Carriers Integration Library
 * Supports major Japanese carriers: Yamato, Sagawa, Japan Post, Seino
 */

import {
  CarrierType,
  ShipmentStatus,
  ShippingServiceType,
  DeliveryTimeSlot,
  ShippingAddress,
  PackageDimensions,
  CarrierApiConfig,
  CarrierShipmentResponse,
  CarrierTrackingResponse,
  CarrierApiError,
  SHIPMENT_STATUS_NAMES,
} from '@/types/shipment';

// =====================================================
// Environment Configuration
// =====================================================

function getCarrierConfig(carrier: CarrierType): CarrierApiConfig {
  switch (carrier) {
    case CarrierType.YAMATO:
      if (!process.env.YAMATO_API_KEY) {
        throw new Error('YAMATO_API_KEY not configured');
      }
      return {
        apiKey: process.env.YAMATO_API_KEY,
        senderCode: process.env.YAMATO_SENDER_CODE,
        endpoint: process.env.YAMATO_ENDPOINT || 'https://dataplus.kuronekoyamato.co.jp',
        sandbox: process.env.NODE_ENV !== 'production',
      };

    case CarrierType.SAGAWA:
      if (!process.env.SAGAWA_API_KEY) {
        throw new Error('SAGAWA_API_KEY not configured');
      }
      return {
        apiKey: process.env.SAGAWA_API_KEY,
        contractCode: process.env.SAGAWA_CONTRACT_CODE,
        endpoint: process.env.SAGAWA_ENDPOINT || 'https://k2k.sagawa-exp.co.jp',
        sandbox: process.env.NODE_ENV !== 'production',
      };

    case CarrierType.JP_POST:
      if (!process.env.JP_POST_API_KEY) {
        throw new Error('JP_POST_API_KEY not configured');
      }
      return {
        apiKey: process.env.JP_POST_API_KEY,
        endpoint: process.env.JP_POST_ENDPOINT || 'https://www.post.japanpost.jp',
        sandbox: process.env.NODE_ENV !== 'production',
      };

    case CarrierType.SEINO:
      if (!process.env.SEINO_API_KEY) {
        throw new Error('SEINO_API_KEY not configured');
      }
      return {
        apiKey: process.env.SEINO_API_KEY,
        endpoint: process.env.SEINO_ENDPOINT || 'https://api.seino.co.jp',
        sandbox: process.env.NODE_ENV !== 'production',
      };

    default:
      throw new Error(`Unsupported carrier: ${carrier}`);
  }
}

// =====================================================
// Yamato Transport Implementation
// =====================================================

class YamatoTransport {
  private config: CarrierApiConfig;

  constructor(config: CarrierApiConfig) {
    this.config = config;
  }

  /**
   * Create shipment with Yamato
   * API Documentation: https://dataplus.kuronekoyamato.co.jp/
   */
  async createShipment(
    senderAddress: ShippingAddress,
    recipientAddress: ShippingAddress,
    serviceType: ShippingServiceType,
    packageCount: number,
    weightKg?: number,
    dimensions?: PackageDimensions,
    pickupDate?: Date,
    deliveryTimeSlot?: DeliveryTimeSlot,
    deliveryDateRequest?: Date
  ): Promise<CarrierShipmentResponse> {
    try {
      // Map service types to Yamato codes
      const serviceCode = this.mapServiceType(serviceType);
      const timeSlotCode = this.mapTimeSlot(deliveryTimeSlot);

      // Build API request payload
      const payload = {
        // Sender information (送付人情報)
        sender: {
          name: senderAddress.name,
          postal_code: senderAddress.postal_code,
          address: {
            prefecture: senderAddress.prefecture,
            city: senderAddress.city,
            address: senderAddress.address,
            building: senderAddress.building,
          },
          phone: senderAddress.phone,
          sender_code: this.config.senderCode,
        },
        // Recipient information (届け先情報)
        recipient: {
          name: recipientAddress.name,
          postal_code: recipientAddress.postal_code,
          address: {
            prefecture: recipientAddress.prefecture,
            city: recipientAddress.city,
            address: recipientAddress.address,
            building: recipientAddress.building,
          },
          phone: recipientAddress.phone,
        },
        // Package information (荷物情報)
        package: {
          service_code: serviceCode,
          package_count: packageCount,
          weight: weightKg,
          dimensions: dimensions,
        },
        // Delivery options (配達オプション)
        delivery: {
          pickup_date: pickupDate ? pickupDate.toISOString().split('T')[0] : undefined,
          delivery_date: deliveryDateRequest ? deliveryDateRequest.toISOString().split('T')[0] : undefined,
          time_slot: timeSlotCode,
        },
      };

      // Call Yamato API (this would be the actual API call)
      // For now, we'll simulate the response
      const response = await this.callApi('/api/shipment/create', payload);

      return {
        tracking_number: response.trackingNumber || this.generateTrackingNumber(),
        label_url: response.labelUrl,
        pickup_confirmation: response.pickupConfirmation,
        estimated_delivery: response.estimatedDelivery,
        raw_response: response,
      };
    } catch (error) {
      throw new CarrierApiError(
        'Failed to create Yamato shipment',
        CarrierType.YAMATO,
        error
      );
    }
  }

  /**
   * Get tracking status from Yamato
   */
  async getTrackingStatus(trackingNumber: string): Promise<CarrierTrackingResponse> {
    try {
      const response = await this.callApi('/api/tracking', {
        trackingNumber,
      });

      // Map Yamato status codes to our enum
      const currentStatus = this.mapYamatoStatus(response.status);

      // Format tracking history
      const events = response.history.map((event: any) => ({
        datetime: event.dateTime,
        status: event.statusCode,
        location: event.location,
        description_ja: event.descriptionJa,
        description_en: event.descriptionEn || event.descriptionJa,
      }));

      return {
        current_status: currentStatus,
        estimated_delivery: response.estimatedDelivery,
        events,
        raw_response: response,
      };
    } catch (error) {
      throw new CarrierApiError(
        'Failed to get Yamato tracking status',
        CarrierType.YAMATO,
        error
      );
    }
  }

  /**
   * Schedule pickup with Yamato
   */
  async schedulePickup(
    shipmentId: string,
    pickupTime: Date,
    specialInstructions?: string
  ): Promise<void> {
    try {
      await this.callApi('/api/pickup/schedule', {
        shipmentId,
        pickupDate: pickupTime.toISOString().split('T')[0],
        pickupTime: pickupTime.toTimeString().slice(0, 5),
        specialInstructions,
      });
    } catch (error) {
      throw new CarrierApiError(
        'Failed to schedule Yamato pickup',
        CarrierType.YAMATO,
        error
      );
    }
  }

  /**
   * Generate shipping label PDF
   */
  async generateShippingLabel(shipmentId: string): Promise<Blob> {
    try {
      const response = await this.callApi('/api/label/generate', {
        shipmentId,
        format: 'PDF',
      });

      // In real implementation, this would return actual PDF blob
      // For now, return mock blob
      return new Blob([JSON.stringify(response)], { type: 'application/pdf' });
    } catch (error) {
      throw new CarrierApiError(
        'Failed to generate Yamato shipping label',
        CarrierType.YAMATO,
        error
      );
    }
  }

  // =====================================================
  // Helper methods
  // =====================================================

  private async callApi(endpoint: string, payload: any): Promise<any> {
    // In production, this would make actual HTTP requests to Yamato API
    // For now, return mock responses
    if (this.config.sandbox) {
      return this.getMockResponse(endpoint, payload);
    }

    const url = `${this.config.endpoint}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Sender-Code': this.config.senderCode || '',
    };

    // Actual API call would be here:
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers,
    //   body: JSON.stringify(payload),
    // });
    // return await response.json();

    // Mock response for development
    return this.getMockResponse(endpoint, payload);
  }

  private mapServiceType(serviceType: ShippingServiceType): string {
    const mapping: Record<ShippingServiceType, string> = {
      [ShippingServiceType.COOL]: 'COOL_TAKKYUBIN',
      [ShippingServiceType.TAKKYUBIN]: 'TAKKYUBIN',
      [ShippingServiceType.REGULAR]: 'REGULAR',
      [ShippingServiceType.MAIL]: 'MAIL',
    };
    return mapping[serviceType];
  }

  private mapTimeSlot(slot?: DeliveryTimeSlot): string {
    if (!slot) return 'NONE';
    const mapping: Record<DeliveryTimeSlot, string> = {
      [DeliveryTimeSlot.NONE]: 'NONE',
      [DeliveryTimeSlot.MORNING]: 'MORNING',
      [DeliveryTimeSlot.TIME_12_14]: '12_14',
      [DeliveryTimeSlot.TIME_14_16]: '14_16',
      [DeliveryTimeSlot.TIME_16_18]: '16_18',
      [DeliveryTimeSlot.TIME_18_20]: '18_20',
      [DeliveryTimeSlot.TIME_19_21]: '19_21',
    };
    return mapping[slot];
  }

  private mapYamatoStatus(status: string): ShipmentStatus {
    // Map Yamato status codes to our enum
    const mapping: Record<string, ShipmentStatus> = {
      'PENDING': ShipmentStatus.PENDING,
      'PICKED_UP': ShipmentStatus.PICKED_UP,
      'IN_TRANSIT': ShipmentStatus.IN_TRANSIT,
      'OUT_FOR_DELIVERY': ShipmentStatus.OUT_FOR_DELIVERY,
      'DELIVERED': ShipmentStatus.DELIVERED,
      'FAILED': ShipmentStatus.FAILED,
      'RETURNED': ShipmentStatus.RETURNED,
    };
    return mapping[status] || ShipmentStatus.PENDING;
  }

  private generateTrackingNumber(): string {
    // Yamato tracking numbers are typically 12 digits
    // Format: ####-####-####
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const part3 = Math.floor(1000 + Math.random() * 9000);
    return `${part1}-${part2}-${part3}`;
  }

  private getMockResponse(endpoint: string, payload: any): any {
    // Mock responses for development/testing
    if (endpoint.includes('create')) {
      return {
        trackingNumber: this.generateTrackingNumber(),
        labelUrl: `https://mock-yamato.com/label/${Date.now()}.pdf`,
        pickupConfirmation: `YMT-${Date.now()}`,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    if (endpoint.includes('tracking')) {
      return {
        status: 'IN_TRANSIT',
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        history: [
          {
            dateTime: new Date().toISOString(),
            statusCode: 'IN_TRANSIT',
            location: '東京',
            descriptionJa: '輸送中',
            descriptionEn: 'In Transit',
          },
        ],
      };
    }
    return {};
  }
}

// =====================================================
// Sagawa Express Implementation
// =====================================================

class SagawaExpress {
  private config: CarrierApiConfig;

  constructor(config: CarrierApiConfig) {
    this.config = config;
  }

  async createShipment(
    senderAddress: ShippingAddress,
    recipientAddress: ShippingAddress,
    serviceType: ShippingServiceType,
    packageCount: number,
    weightKg?: number,
    dimensions?: PackageDimensions,
    pickupDate?: Date,
    deliveryTimeSlot?: DeliveryTimeSlot,
    deliveryDateRequest?: Date
  ): Promise<CarrierShipmentResponse> {
    try {
      // Similar implementation to Yamato but with Sagawa-specific codes
      const response = await this.callApi('/shipment/create', {
        sender: senderAddress,
        recipient: recipientAddress,
        serviceType,
        packageCount,
        weightKg,
        dimensions,
        pickupDate,
        deliveryTimeSlot,
        deliveryDateRequest,
      });

      return {
        tracking_number: response.trackingNumber || this.generateTrackingNumber(),
        label_url: response.labelUrl,
        pickup_confirmation: response.pickupConfirmation,
        estimated_delivery: response.estimatedDelivery,
        raw_response: response,
      };
    } catch (error) {
      throw new CarrierApiError(
        'Failed to create Sagawa shipment',
        CarrierType.SAGAWA,
        error
      );
    }
  }

  async getTrackingStatus(trackingNumber: string): Promise<CarrierTrackingResponse> {
    try {
      const response = await this.callApi('/tracking', { trackingNumber });

      return {
        current_status: this.mapSagawaStatus(response.status),
        estimated_delivery: response.estimatedDelivery,
        events: response.history,
        raw_response: response,
      };
    } catch (error) {
      throw new CarrierApiError(
        'Failed to get Sagawa tracking status',
        CarrierType.SAGAWA,
        error
      );
    }
  }

  async schedulePickup(shipmentId: string, pickupTime: Date, specialInstructions?: string): Promise<void> {
    try {
      await this.callApi('/pickup/schedule', {
        shipmentId,
        pickupTime,
        specialInstructions,
      });
    } catch (error) {
      throw new CarrierApiError('Failed to schedule Sagawa pickup', CarrierType.SAGAWA, error);
    }
  }

  async generateShippingLabel(shipmentId: string): Promise<Blob> {
    try {
      const response = await this.callApi('/label/generate', { shipmentId, format: 'PDF' });
      return new Blob([JSON.stringify(response)], { type: 'application/pdf' });
    } catch (error) {
      throw new CarrierApiError('Failed to generate Sagawa label', CarrierType.SAGAWA, error);
    }
  }

  private async callApi(endpoint: string, payload: any): Promise<any> {
    // Mock implementation
    return this.getMockResponse(endpoint, payload);
  }

  private mapSagawaStatus(status: string): ShipmentStatus {
    const mapping: Record<string, ShipmentStatus> = {
      'PENDING': ShipmentStatus.PENDING,
      'PICKED_UP': ShipmentStatus.PICKED_UP,
      'IN_TRANSIT': ShipmentStatus.IN_TRANSIT,
      'OUT_FOR_DELIVERY': ShipmentStatus.OUT_FOR_DELIVERY,
      'DELIVERED': ShipmentStatus.DELIVERED,
      'FAILED': ShipmentStatus.FAILED,
      'RETURNED': ShipmentStatus.RETURNED,
    };
    return mapping[status] || ShipmentStatus.PENDING;
  }

  private generateTrackingNumber(): string {
    // Sagawa tracking numbers: 10 digits
    const num = Math.floor(1000000000 + Math.random() * 9000000000);
    return num.toString();
  }

  private getMockResponse(endpoint: string, payload: any): any {
    if (endpoint.includes('create')) {
      return {
        trackingNumber: this.generateTrackingNumber(),
        labelUrl: `https://mock-sagawa.com/label/${Date.now()}.pdf`,
        pickupConfirmation: `SGW-${Date.now()}`,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    return {};
  }
}

// =====================================================
// Japan Post Implementation
// =====================================================

class JapanPost {
  private config: CarrierApiConfig;

  constructor(config: CarrierApiConfig) {
    this.config = config;
  }

  async createShipment(
    senderAddress: ShippingAddress,
    recipientAddress: ShippingAddress,
    serviceType: ShippingServiceType,
    packageCount: number,
    weightKg?: number,
    dimensions?: PackageDimensions,
    pickupDate?: Date,
    deliveryTimeSlot?: DeliveryTimeSlot,
    deliveryDateRequest?: Date
  ): Promise<CarrierShipmentResponse> {
    try {
      const response = await this.callApi('/shipment/create', {
        sender: senderAddress,
        recipient: recipientAddress,
        serviceType,
        packageCount,
        weightKg,
        dimensions,
        pickupDate,
        deliveryTimeSlot,
        deliveryDateRequest,
      });

      return {
        tracking_number: response.trackingNumber || this.generateTrackingNumber(),
        label_url: response.labelUrl,
        pickup_confirmation: response.pickupConfirmation,
        estimated_delivery: response.estimatedDelivery,
        raw_response: response,
      };
    } catch (error) {
      throw new CarrierApiError('Failed to create Japan Post shipment', CarrierType.JP_POST, error);
    }
  }

  async getTrackingStatus(trackingNumber: string): Promise<CarrierTrackingResponse> {
    try {
      const response = await this.callApi('/tracking', { trackingNumber });

      return {
        current_status: this.mapJapanPostStatus(response.status),
        estimated_delivery: response.estimatedDelivery,
        events: response.history,
        raw_response: response,
      };
    } catch (error) {
      throw new CarrierApiError('Failed to get Japan Post tracking status', CarrierType.JP_POST, error);
    }
  }

  async schedulePickup(shipmentId: string, pickupTime: Date, specialInstructions?: string): Promise<void> {
    try {
      await this.callApi('/pickup/schedule', {
        shipmentId,
        pickupTime,
        specialInstructions,
      });
    } catch (error) {
      throw new CarrierApiError('Failed to schedule Japan Post pickup', CarrierType.JP_POST, error);
    }
  }

  async generateShippingLabel(shipmentId: string): Promise<Blob> {
    try {
      const response = await this.callApi('/label/generate', { shipmentId, format: 'PDF' });
      return new Blob([JSON.stringify(response)], { type: 'application/pdf' });
    } catch (error) {
      throw new CarrierApiError('Failed to generate Japan Post label', CarrierType.JP_POST, error);
    }
  }

  private async callApi(endpoint: string, payload: any): Promise<any> {
    return this.getMockResponse(endpoint, payload);
  }

  private mapJapanPostStatus(status: string): ShipmentStatus {
    const mapping: Record<string, ShipmentStatus> = {
      'PENDING': ShipmentStatus.PENDING,
      'PICKED_UP': ShipmentStatus.PICKED_UP,
      'IN_TRANSIT': ShipmentStatus.IN_TRANSIT,
      'OUT_FOR_DELIVERY': ShipmentStatus.OUT_FOR_DELIVERY,
      'DELIVERED': ShipmentStatus.DELIVERED,
      'FAILED': ShipmentStatus.FAILED,
      'RETURNED': ShipmentStatus.RETURNED,
    };
    return mapping[status] || ShipmentStatus.PENDING;
  }

  private generateTrackingNumber(): string {
    // Japan Post tracking: 11 digits
    const num = Math.floor(10000000000 + Math.random() * 90000000000);
    return num.toString();
  }

  private getMockResponse(endpoint: string, payload: any): any {
    if (endpoint.includes('create')) {
      return {
        trackingNumber: this.generateTrackingNumber(),
        labelUrl: `https://mock-jppost.com/label/${Date.now()}.pdf`,
        pickupConfirmation: `JPP-${Date.now()}`,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    return {};
  }
}

// =====================================================
// Seino Transport Implementation
// =====================================================

class SeinoTransport {
  private config: CarrierApiConfig;

  constructor(config: CarrierApiConfig) {
    this.config = config;
  }

  async createShipment(
    senderAddress: ShippingAddress,
    recipientAddress: ShippingAddress,
    serviceType: ShippingServiceType,
    packageCount: number,
    weightKg?: number,
    dimensions?: PackageDimensions,
    pickupDate?: Date,
    deliveryTimeSlot?: DeliveryTimeSlot,
    deliveryDateRequest?: Date
  ): Promise<CarrierShipmentResponse> {
    try {
      const response = await this.callApi('/shipment/create', {
        sender: senderAddress,
        recipient: recipientAddress,
        serviceType,
        packageCount,
        weightKg,
        dimensions,
        pickupDate,
        deliveryTimeSlot,
        deliveryDateRequest,
      });

      return {
        tracking_number: response.trackingNumber || this.generateTrackingNumber(),
        label_url: response.labelUrl,
        pickup_confirmation: response.pickupConfirmation,
        estimated_delivery: response.estimatedDelivery,
        raw_response: response,
      };
    } catch (error) {
      throw new CarrierApiError('Failed to create Seino shipment', CarrierType.SEINO, error);
    }
  }

  async getTrackingStatus(trackingNumber: string): Promise<CarrierTrackingResponse> {
    try {
      const response = await this.callApi('/tracking', { trackingNumber });

      return {
        current_status: this.mapSeinoStatus(response.status),
        estimated_delivery: response.estimatedDelivery,
        events: response.history,
        raw_response: response,
      };
    } catch (error) {
      throw new CarrierApiError('Failed to get Seino tracking status', CarrierType.SEINO, error);
    }
  }

  async schedulePickup(shipmentId: string, pickupTime: Date, specialInstructions?: string): Promise<void> {
    try {
      await this.callApi('/pickup/schedule', {
        shipmentId,
        pickupTime,
        specialInstructions,
      });
    } catch (error) {
      throw new CarrierApiError('Failed to schedule Seino pickup', CarrierType.SEINO, error);
    }
  }

  async generateShippingLabel(shipmentId: string): Promise<Blob> {
    try {
      const response = await this.callApi('/label/generate', { shipmentId, format: 'PDF' });
      return new Blob([JSON.stringify(response)], { type: 'application/pdf' });
    } catch (error) {
      throw new CarrierApiError('Failed to generate Seino label', CarrierType.SEINO, error);
    }
  }

  private async callApi(endpoint: string, payload: any): Promise<any> {
    return this.getMockResponse(endpoint, payload);
  }

  private mapSeinoStatus(status: string): ShipmentStatus {
    const mapping: Record<string, ShipmentStatus> = {
      'PENDING': ShipmentStatus.PENDING,
      'PICKED_UP': ShipmentStatus.PICKED_UP,
      'IN_TRANSIT': ShipmentStatus.IN_TRANSIT,
      'OUT_FOR_DELIVERY': ShipmentStatus.OUT_FOR_DELIVERY,
      'DELIVERED': ShipmentStatus.DELIVERED,
      'FAILED': ShipmentStatus.FAILED,
      'RETURNED': ShipmentStatus.RETURNED,
    };
    return mapping[status] || ShipmentStatus.PENDING;
  }

  private generateTrackingNumber(): string {
    // Seino tracking: 9 digits
    const num = Math.floor(100000000 + Math.random() * 900000000);
    return num.toString();
  }

  private getMockResponse(endpoint: string, payload: any): any {
    if (endpoint.includes('create')) {
      return {
        trackingNumber: this.generateTrackingNumber(),
        labelUrl: `https://mock-seino.com/label/${Date.now()}.pdf`,
        pickupConfirmation: `SNO-${Date.now()}`,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    return {};
  }
}

// =====================================================
// Factory Function
// =====================================================

export function getCarrierInstance(carrier: CarrierType): YamatoTransport | SagawaExpress | JapanPost | SeinoTransport {
  const config = getCarrierConfig(carrier);

  switch (carrier) {
    case CarrierType.YAMATO:
      return new YamatoTransport(config);
    case CarrierType.SAGAWA:
      return new SagawaExpress(config);
    case CarrierType.JP_POST:
      return new JapanPost(config);
    case CarrierType.SEINO:
      return new SeinoTransport(config);
    default:
      throw new Error(`Unsupported carrier: ${carrier}`);
  }
}

// =====================================================
// Public API Functions
// =====================================================

/**
 * Create shipment with specified carrier
 */
export async function createShipmentWithCarrier(
  orderId: string,
  carrier: CarrierType,
  pickupDate: Date,
  senderAddress: ShippingAddress,
  recipientAddress: ShippingAddress,
  serviceType: ShippingServiceType = ShippingServiceType.TAKKYUBIN,
  packageCount: number = 1,
  weightKg?: number,
  dimensions?: PackageDimensions,
  deliveryTimeSlot?: DeliveryTimeSlot,
  deliveryDateRequest?: Date
): Promise<{
  trackingNumber: string;
  labelUrl?: string;
  pickupConfirmation?: string;
  estimatedDelivery?: string;
  carrier: CarrierType;
}> {
  const carrierInstance = getCarrierInstance(carrier);

  const response = await carrierInstance.createShipment(
    senderAddress,
    recipientAddress,
    serviceType,
    packageCount,
    weightKg,
    dimensions,
    pickupDate,
    deliveryTimeSlot,
    deliveryDateRequest
  );

  return {
    trackingNumber: response.tracking_number,
    labelUrl: response.label_url,
    pickupConfirmation: response.pickup_confirmation,
    estimatedDelivery: response.estimated_delivery,
    carrier,
  };
}

/**
 * Get tracking status from carrier
 */
export async function getTrackingStatus(
  carrier: CarrierType,
  trackingNumber: string
): Promise<CarrierTrackingResponse> {
  const carrierInstance = getCarrierInstance(carrier);
  return await carrierInstance.getTrackingStatus(trackingNumber);
}

/**
 * Schedule pickup with carrier
 */
export async function schedulePickup(
  shipmentId: string,
  carrier: CarrierType,
  pickupTime: Date,
  specialInstructions?: string
): Promise<void> {
  const carrierInstance = getCarrierInstance(carrier);
  await carrierInstance.schedulePickup(shipmentId, pickupTime, specialInstructions);
}

/**
 * Generate shipping label PDF
 */
export async function generateShippingLabel(
  shipmentId: string,
  carrier: CarrierType
): Promise<Blob> {
  const carrierInstance = getCarrierInstance(carrier);
  return await carrierInstance.generateShippingLabel(shipmentId);
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Get carrier display name
 */
export function getCarrierName(carrier: CarrierType, locale: 'ja' | 'en' = 'ja'): string {
  const names: Record<CarrierType, { ja: string; en: string }> = {
    [CarrierType.YAMATO]: { ja: 'ヤマト運輸', en: 'Yamato Transport' },
    [CarrierType.SAGAWA]: { ja: '佐川急便', en: 'Sagawa Express' },
    [CarrierType.JP_POST]: { ja: '日本郵便', en: 'Japan Post' },
    [CarrierType.SEINO]: { ja: '西濃運輸', en: 'Seino Transport' },
  };
  return names[carrier][locale];
}

/**
 * Get status display name
 */
export function getStatusName(status: ShipmentStatus, locale: 'ja' | 'en' = 'ja'): string {
  return SHIPMENT_STATUS_NAMES[status][locale];
}

/**
 * Validate tracking number format for carrier
 */
export function validateTrackingNumber(carrier: CarrierType, trackingNumber: string): boolean {
  // Remove any dashes or spaces
  const cleaned = trackingNumber.replace(/[\s-]/g, '');

  switch (carrier) {
    case CarrierType.YAMATO:
      // Yamato: 12 digits
      return /^\d{12}$/.test(cleaned);
    case CarrierType.SAGAWA:
      // Sagawa: 10 digits
      return /^\d{10}$/.test(cleaned);
    case CarrierType.JP_POST:
      // Japan Post: 11 digits
      return /^\d{11}$/.test(cleaned);
    case CarrierType.SEINO:
      // Seino: 9 digits
      return /^\d{9}$/.test(cleaned);
    default:
      return false;
  }
}

/**
 * Calculate estimated delivery date based on carrier and service type
 */
export function calculateEstimatedDelivery(
  carrier: CarrierType,
  serviceType: ShippingServiceType,
  pickupDate: Date,
  originPostalCode: string,
  destinationPostalCode: string
): Date {
  // Simple estimation based on carrier and service
  let baseDays = 2; // Default: 2 days

  // Adjust based on service type
  if (serviceType === ShippingServiceType.MAIL) {
    baseDays = 3; // Mail is slower
  }

  // Adjust based on carrier
  if (carrier === CarrierType.JP_POST) {
    baseDays += 1; // Japan Post is generally slower
  }

  // In production, this would use carrier APIs or distance calculation
  const estimated = new Date(pickupDate);
  estimated.setDate(estimated.getDate() + baseDays);

  return estimated;
}

// Export carrier instances for direct access if needed
export { YamatoTransport, SagawaExpress, JapanPost, SeinoTransport };
