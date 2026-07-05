export function getConversionRate(submissions: number, views: number): string {
	if (views === 0) return '0.0%';
	return ((submissions / views) * 100).toFixed(1) + '%';
}

export function getTypeLabel(type: string): string {
	switch (type) {
		case 'supplier':
			return 'Supplier';
		case 'client':
			return 'Client';
		case 'career_opportunity':
			return 'Career Opportunity';
		default:
			return type;
	}
}
