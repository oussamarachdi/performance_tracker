import { Member, Department, University, Product, DateRange } from './mockData';

/**
 * Filters members based on selected departments and date range
 */
export function filterMembers(
  members: Member[],
  selectedDepartments: string[],
  dateRange: DateRange
): Member[] {
  return members.filter((member) => {
    // Department filter
    if (selectedDepartments.length > 0 && !selectedDepartments.includes(member.department)) {
      return false;
    }
    
    // Date range filter (basic - would need actual date data in mock data)
    if (dateRange.start || dateRange.end) {
      // Placeholder for date filtering logic
      return true;
    }
    
    return true;
  });
}

/**
 * Filters departments based on selected departments
 */
export function filterDepartments(
  departments: Department[],
  selectedDepartments: string[]
): Department[] {
  if (selectedDepartments.length === 0) {
    return departments;
  }
  
  return departments.filter((dept) => selectedDepartments.includes(dept.name));
}

/**
 * Filters universities based on selected filters
 */
export function filterUniversities(
  universities: University[],
  selectedDepartments: string[],
  dateRange: DateRange
): University[] {
  return universities.filter((university) => {
    // Department filter would need relationship data
    if (selectedDepartments.length > 0) {
      // Placeholder for department filtering
      return true;
    }
    
    // Date range filter
    if (dateRange.start || dateRange.end) {
      // Placeholder for date filtering logic
      return true;
    }
    
    return true;
  });
}

/**
 * Filters products based on selected filters
 */
export function filterProducts(
  products: Product[],
  selectedDepartments: string[],
  dateRange: DateRange
): Product[] {
  return products.filter((product) => {
    // Department filter would need relationship data
    if (selectedDepartments.length > 0) {
      // Placeholder for department filtering
      return true;
    }
    
    // Date range filter
    if (dateRange.start || dateRange.end) {
      // Placeholder for date filtering logic
      return true;
    }
    
    return true;
  });
}

/**
 * Calculate aggregated metrics for filtered data
 */
export function calculateMetrics(items: Array<{ signups: number; leads: number; contacted: number; interested: number; applied: number }>) {
  return {
    signups: items.reduce((sum, item) => sum + item.signups, 0),
    leads: items.reduce((sum, item) => sum + item.leads, 0),
    contacted: items.reduce((sum, item) => sum + item.contacted, 0),
    interested: items.reduce((sum, item) => sum + item.interested, 0),
    applied: items.reduce((sum, item) => sum + item.applied, 0),
  };
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(applied: number, signups: number): number {
  if (signups === 0) return 0;
  return (applied / signups) * 100;
}
