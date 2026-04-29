import { defineStore } from 'pinia'
import Papa from 'papaparse'

export interface ManagementPoint {
  id: string
  name: string
  type: string
}

export interface Tenant {
  id: string
  name: string
  points: string[] // Array of ManagementPoint IDs
}

export interface PpdDataRow {
  [key: string]: any
}

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    tenants: [] as Tenant[],
    managementPoints: [] as ManagementPoint[],
    ppdData: [] as PpdDataRow[],
    ppdPeriod: '' as string,
    isInitialized: false,
    selectedTenantId: null as string | null
  }),
  
  getters: {
    selectedTenant: (state) => {
      return state.tenants.find(t => t.id === state.selectedTenantId) || null
    },
    
    tenantReportData: (state) => {
      // This will calculate the report data for the selected tenant based on ppdData
      // and the tenant's assigned management points.
      return (tenantId: string) => {
        const tenant = state.tenants.find(t => t.id === tenantId);
        if (!tenant || state.ppdData.length === 0) return [];
        
        // Find columns in PPD data that match the tenant's management points
        // Often PPD data has columns like 'VRV RDC-R2' or the point ID.
        // We will try to match by point name or ID.
        
        // For demonstration, assuming each point is a column in the first row.
        const report = [];
        for (const pointId of tenant.points) {
          const point = state.managementPoints.find(p => p.id === pointId);
          if (point) {
            // Find sum or specific values from PpdDataRow.
            // This logic depends heavily on the exact PPD CSV structure.
            // For now, we will extract the last row's value or sum if multiple.
            let value = 0;
            // Simplified logic: Check if column exists by name
            const colName = Object.keys(state.ppdData[0] || {}).find(k => k.includes(point.name) || k.includes(pointId));
            
            if (colName) {
              // sum up all rows for this column (assuming numeric)
              value = state.ppdData.reduce((sum, row) => {
                const val = parseFloat(row[colName]);
                return sum + (isNaN(val) ? 0 : val);
              }, 0);
            }
            
            report.push({
              pointId: point.id,
              pointName: point.name,
              value: value.toFixed(2)
            });
          }
        }
        
        return report;
      }
    }
  },
  
  actions: {
    initFromLocalStorage() {
      if (process.client) {
        const storedTenants = localStorage.getItem('tenants')
        if (storedTenants) {
          this.tenants = JSON.parse(storedTenants)
        }
      }
    },
    
    saveToLocalStorage() {
      if (process.client) {
        localStorage.setItem('tenants', JSON.stringify(this.tenants))
      }
    },
    
    async loadManagementPoints(csvText: string) {
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            const points: ManagementPoint[] = [];
            // Parse specific lines (like IN-D and PI-D)
            results.data.forEach((row: any) => {
              if (row[0] === 'IN-D' || row[0] === 'PI-D') {
                points.push({
                  type: row[0],
                  id: row[1],
                  name: row[2]
                });
              }
            });
            this.managementPoints = points;
            this.isInitialized = true;
            resolve(true);
          },
          error: (error: any) => reject(error)
        });
      });
    },
    
    loadPpdData(csvText: string) {
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.ppdData = results.data as PpdDataRow[];
            // Try to extract period if available
            this.ppdPeriod = "Loaded Data Period"; 
            resolve(true);
          },
          error: (error: any) => reject(error)
        });
      });
    },
    
    createTenant(name: string, points: string[]) {
      const newTenant: Tenant = {
        id: Date.now().toString(),
        name,
        points
      }
      this.tenants.push(newTenant)
      this.saveToLocalStorage()
      return newTenant
    },
    
    updateTenant(id: string, name: string, points: string[]) {
      const index = this.tenants.findIndex(t => t.id === id)
      if (index !== -1) {
        this.tenants[index] = { ...this.tenants[index], name, points }
        this.saveToLocalStorage()
      }
    },
    
    deleteTenant(id: string) {
      this.tenants = this.tenants.filter(t => t.id !== id)
      if (this.selectedTenantId === id) {
        this.selectedTenantId = null
      }
      this.saveToLocalStorage()
    },
    
    selectTenant(id: string) {
      this.selectedTenantId = id
    }
  }
})
