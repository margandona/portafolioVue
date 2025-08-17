const { SimulatorPaymentService } = require('../../services/transbankPaymentService');

describe('SimulatorPaymentService (Unit Tests)', () => {
  let simulator;

  beforeEach(() => {
    simulator = new SimulatorPaymentService();
  });

  test('should validate card number with Luhn algorithm', () => {
    expect(simulator.validateCardNumber('4111111111111111')).toBe(true);
    expect(simulator.validateCardNumber('4000000000000002')).toBe(true);
    expect(simulator.validateCardNumber('1234567890123456')).toBe(false);
  });

  test('should handle processing delay', async () => {
    const startTime = Date.now();
    
    const result = await simulator.processPayment({
      cardData: { cardNumber: '4111111111111111' }
    });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    expect(processingTime).toBeGreaterThan(1500); // At least 1.5 seconds
    expect(result.success).toBe(true);
  });

  test('should reject payments when card ends in 2', async () => {
    const result = await simulator.processPayment({
      cardData: { cardNumber: '4000000000000002' } // Valid Luhn but ends in 2
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('SIMULATION_DECLINED');
  });

  test('should accept payments when card does not end in 2', async () => {
    const result = await simulator.processPayment({
      cardData: { cardNumber: '4111111111111111' } // Ends in 1
    });

    expect(result.success).toBe(true);
    expect(result.transactionId).toBeDefined();
  });

  test('should reject invalid card numbers', async () => {
    const result = await simulator.processPayment({
      cardData: { cardNumber: '1234567890123456' } // Invalid Luhn
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('INVALID_CARD');
  });
});
