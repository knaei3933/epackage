// Web Worker for heavy multi-quantity calculations
// This worker runs calculations in a separate thread to prevent UI blocking

// Import the pricing engine (Note: This would need to be adapted based on your actual setup)
// For now, we'll simulate the calculation

class WorkerCalculator {
  constructor() {
    self.onmessage = this.handleMessage.bind(this);
  }

  async handleMessage(event) {
    const { type, payload } = event.data;

    try {
      switch (type) {
        case 'CALCULATE_BATCH':
          const results = await this.calculateBatch(payload);
          self.postMessage({ results });
          break;

        case 'CALCULATE_COMPARISON':
          const comparison = await this.calculateComparison(payload);
          self.postMessage({ comparison });
          break;

        case 'GENERATE_RECOMMENDATIONS':
          const recommendations = await this.generateRecommendations(payload);
          self.postMessage({ recommendations });
          break;

        default:
          throw new Error(`Unknown message type: ${type}`);
      }
    } catch (error) {
      self.postMessage({
        error: error.message || 'Unknown error occurred'
      });
    }
  }

  async calculateBatch({ baseParams, quantities, sharedCosts }) {
    const results = [];

    for (const quantity of quantities) {
      // Simulate calculation - replace with actual unified pricing engine call
      const quote = await this.simulateQuoteCalculation(baseParams, quantity, sharedCosts);

      results.push({
        quantity,
        quote: {
          ...quote,
          quantity,
          unitPrice: quote.unitPrice,
          totalPrice: quote.unitPrice * quantity,
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
          breakdown: {
            material: quote.unitPrice * quantity * 0.5,
            printing: quote.unitPrice * quantity * 0.2,
            processing: quote.unitPrice * quantity * 0.2,
            setup: sharedCosts.setupFee,
            total: quote.unitPrice * quantity
          },
          details: {
            fixedCost: sharedCosts.setupFee + sharedCosts.toolingCosts,
            variableCostPerUnit: quote.unitPrice * 0.7,
            surcharge: 0,
            materialRate: 0,
            area: (baseParams.width * baseParams.height) / 1000000
          }
        }
      });

      // Allow other tasks to run between calculations
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return results;
  }

  async calculateComparison({ calculations, quantities }) {
    // Process calculations data
    const sortedQuantities = [...quantities].sort((a, b) => a - b);
    const unitPrices = sortedQuantities.map(q => {
      const calc = calculations.find(c => c.quantity === q);
      return calc ? calc.quote.unitPrice : 0;
    });

    // Find best value
    const bestQuantityIndex = unitPrices.indexOf(Math.min(...unitPrices));
    const bestQuantity = sortedQuantities[bestQuantityIndex];
    const highestPrice = Math.max(...unitPrices);
    const lowestPrice = unitPrices[bestQuantityIndex];
    const savings = highestPrice > 0 ? ((highestPrice - lowestPrice) / highestPrice) * 100 : 0;

    // Generate price breaks
    const priceBreaks = sortedQuantities.map(quantity => {
      let discountRate = 0;
      let priceBreak = '小ロット';

      if (quantity >= 50000) {
        discountRate = 0.4;
        priceBreak = '大ロット';
      } else if (quantity >= 20000) {
        discountRate = 0.3;
        priceBreak = '中ロット';
      } else if (quantity >= 10000) {
        discountRate = 0.2;
        priceBreak = '標準ロット';
      } else if (quantity >= 5000) {
        discountRate = 0.1;
        priceBreak = '小ロット';
      }

      return { quantity, priceBreak, discountRate };
    });

    // Calculate economies of scale
    const economiesOfScale = {};
    sortedQuantities.forEach((quantity, index) => {
      if (index === 0) {
        economiesOfScale[quantity] = {
          unitPrice: unitPrices[index],
          totalSavings: 0,
          efficiency: 100
        };
      } else {
        const baselineCost = unitPrices[0] * quantity;
        const actualCost = unitPrices[index] * quantity;
        const totalSavings = baselineCost - actualCost;
        const efficiency = ((baselineCost - actualCost) / baselineCost) * 100 + 100;

        economiesOfScale[quantity] = {
          unitPrice: unitPrices[index],
          totalSavings,
          efficiency: Math.round(efficiency)
        };
      }
    });

    // Analyze trends
    const priceTrend = this.analyzePriceTrend(unitPrices);
    const optimalQuantity = this.findOptimalQuantity(sortedQuantities, unitPrices);
    const diminishingReturns = this.calculateDiminishingReturns(sortedQuantities, unitPrices);

    return {
      bestValue: {
        quantity: bestQuantity,
        savings: Math.round(savings * bestQuantity),
        percentage: Math.round(savings),
        reason: `最も効率的な単価`
      },
      priceBreaks,
      economiesOfScale,
      trends: {
        priceTrend,
        optimalQuantity,
        diminishingReturns
      }
    };
  }

  async generateRecommendations({ calculations, comparison }) {
    const recommendations = [];

    // Cost-optimized recommendation
    recommendations.push({
      type: 'cost-optimized',
      title: '最適コスト推奨',
      description: `${comparison.bestValue.quantity}個が最も効率的な単価です`,
      quantity: comparison.bestValue.quantity,
      reasoning: [
        `単価が最も低い (${comparison.bestValue.quantity}個)`,
        `コスト効率: ${comparison.economiesOfScale[comparison.bestValue.quantity]?.efficiency}%`,
        `${comparison.bestValue.percentage}%のコスト削減`
      ],
      estimatedSavings: comparison.bestValue.savings,
      confidence: 0.95
    });

    // Balanced recommendation
    const quantities = calculations.map(c => c.quantity).sort((a, b) => a - b);
    const midQuantity = quantities[Math.floor(quantities.length / 2)];

    recommendations.push({
      type: 'balanced',
      title: 'バランス推奨',
      description: 'コストと在庫のバランスが取れた数量',
      quantity: midQuantity,
      reasoning: [
        '中間的な数量でリスクを分散',
        '適切な在庫管理が可能',
        '合理的な単価を維持'
      ],
      estimatedSavings: comparison.economiesOfScale[midQuantity]?.totalSavings || 0,
      confidence: 0.80
    });

    return recommendations;
  }

  // Simulate quote calculation (replace with actual implementation)
  async simulateQuoteCalculation(baseParams, quantity, sharedCosts) {
    // This is a simulation - replace with actual calculation logic
    const basePrice = 100; // Base price per unit
    const quantityDiscount = Math.min(0.5, Math.log10(quantity) / 10);
    const materialMultiplier = this.getMaterialMultiplier(baseParams.materialId);
    const sizeMultiplier = (baseParams.width * baseParams.height) / 60000; // Normalized to standard size

    const unitPrice = basePrice * (1 - quantityDiscount) * materialMultiplier * sizeMultiplier;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));

    return {
      unitPrice,
      isValid: true,
      leadTimeDays: Math.max(7, 30 - Math.floor(quantity / 1000)),
      discountRate: Math.round(quantityDiscount * 100)
    };
  }

  getMaterialMultiplier(materialId) {
    const multipliers = {
      'pet_al': 1.2,
      'pet_vmpet': 1.3,
      'pet_ldpe': 1.1,
      'pet_ny_al': 1.4,
      'paper': 0.8,
      'kraft_paper': 0.9,
      'aluminum': 1.5
    };
    return multipliers[materialId] || 1;
  }

  analyzePriceTrend(prices) {
    if (prices.length < 2) return 'stable';

    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const difference = (secondAvg - firstAvg) / firstAvg;

    if (difference < -0.05) return 'decreasing';
    if (difference > 0.05) return 'increasing';
    return 'stable';
  }

  findOptimalQuantity(quantities, prices) {
    let minPricePerUnit = Infinity;
    let optimalQuantity = quantities[0];

    for (let i = 0; i < quantities.length; i++) {
      const efficiency = prices[i] / quantities[i];
      if (efficiency < minPricePerUnit) {
        minPricePerUnit = efficiency;
        optimalQuantity = quantities[i];
      }
    }

    return optimalQuantity;
  }

  calculateDiminishingReturns(quantities, prices) {
    if (quantities.length < 3) return 0;

    const lastImprovement = (prices[prices.length - 2] - prices[prices.length - 1]) / prices[prices.length - 2];
    const firstImprovement = (prices[0] - prices[1]) / prices[0];

    return Math.round((1 - lastImprovement / firstImprovement) * 100);
  }
}

// Initialize the worker calculator
new WorkerCalculator();