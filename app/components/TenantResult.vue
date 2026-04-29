<template>
  <div v-if="tenant" class="card mt-4">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold">{{ tenant.name }} - Consumption Report</h2>
        <p class="text-muted text-sm mt-1">Tenant ID: {{ tenant.id }}</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-secondary" @click="printReport">
          <PrinterIcon size="16" /> Print
        </button>
        <button class="btn btn-primary" @click="saveCsv">
          <DownloadIcon size="16" /> Save CSV
        </button>
      </div>
    </div>
    
    <div v-if="!hasData" class="py-8 text-center text-muted">
      <p>No PPD data available. Please upload a PPD CSV file to generate the report.</p>
    </div>
    
    <div v-else class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Point ID</th>
            <th>Point Name</th>
            <th class="text-right">Consumption Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in reportData" :key="row.pointId">
            <td>{{ row.pointId }}</td>
            <td class="font-medium">{{ row.pointName }}</td>
            <td class="text-right">{{ row.value }}</td>
          </tr>
        </tbody>
        <tfoot class="bg-black bg-opacity-20 font-bold">
          <tr>
            <td colspan="2" class="text-right py-3 px-4">Total:</td>
            <td class="text-right py-3 px-4">{{ totalConsumption }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
  <div v-else class="card mt-4 flex items-center justify-center py-12 text-muted">
    Select a tenant from the sidebar to view their report.
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PrinterIcon, DownloadIcon } from 'lucide-vue-next'
import { useTenantStore } from '~/composables/useTenantStore'

const tenantStore = useTenantStore()

const tenant = computed(() => tenantStore.selectedTenant)
const reportData = computed(() => {
  if (!tenant.value) return []
  return tenantStore.tenantReportData(tenant.value.id)
})

const hasData = computed(() => tenantStore.ppdData.length > 0)

const totalConsumption = computed(() => {
  return reportData.value.reduce((sum, row) => sum + parseFloat(row.value), 0).toFixed(2)
})

const printReport = () => {
  window.print()
}

const saveCsv = () => {
  if (!tenant.value) return
  
  const headers = ['Point ID', 'Point Name', 'Value']
  const rows = reportData.value.map(row => [row.pointId, `"${row.pointName}"`, row.value])
  
  // Add total
  rows.push(['', '"Total"', totalConsumption.value])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${tenant.value.name.replace(/\s+/g, '_')}_Report.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.text-right { text-align: right; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.mb-6 { margin-bottom: 1.5rem; }
.bg-black { background-color: rgb(0 0 0); }
.bg-opacity-20 { --tw-bg-opacity: 0.2; }
</style>
