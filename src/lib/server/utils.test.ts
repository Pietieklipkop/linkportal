import { describe, it, expect } from 'vite-plus/test';
import { getConversionRate, getTypeLabel } from './utils';

describe('getConversionRate', () => {
	it('calculates the conversion rate correct to 1 decimal place', () => {
		expect(getConversionRate(5, 10)).toBe('50.0%');
		expect(getConversionRate(1, 3)).toBe('33.3%');
		expect(getConversionRate(0, 0)).toBe('0.0%');
	});
});

describe('getTypeLabel', () => {
	it('returns capitalized custom labels for standard roles', () => {
		expect(getTypeLabel('supplier')).toBe('Supplier');
		expect(getTypeLabel('client')).toBe('Client');
		expect(getTypeLabel('career_opportunity')).toBe('Career Opportunity');
		expect(getTypeLabel('random')).toBe('random');
	});
});
