<template>
  <div class="main-content">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="app-header">
        <div class="app-brand">
          <ActivityIcon class="app-brand-icon" />
          TenantReport
        </div>
      </div>
      
      <div class="p-4 flex-1 flex flex-col" style="overflow-y: auto;">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-semibold text-muted uppercase tracking-wider">Tenants</h2>
          <button class="btn btn-primary" style="padding: 0.25rem 0.5rem;" @click="openCreateDialog" title="Add Tenant">
            <PlusIcon size="16" />
          </button>
        </div>
        
        <div class="flex-1">
          <div v-if="tenants.length === 0" class="text-center text-muted text-sm py-8">
            No tenants configured.<br>Click + to create one.
          </div>
          
          <div 
            v-for="tenant in tenants" 
            :key="tenant.id"
            class="list-item group"
            :class="{ 'active': selectedTenantId === tenant.id }"
            @click="selectTenant(tenant.id)"
          >
            <div>
              <div class="list-item-title">{{ tenant.name }}</div>
              <div class="list-item-subtitle">{{ tenant.points.length }} Points assigned</div>
            </div>
            
            <div class="flex gap-1" style="opacity: 0.7;">
              <button class="btn btn-secondary action-btn" @click.stop="openEditDialog(tenant.id)" title="Edit">
                <EditIcon size="14" />
              </button>
              <button class="btn btn-danger action-btn" @click.stop="deleteTenant(tenant.id)" title="Delete">
                <TrashIcon size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="content-area">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p class="text-muted mt-1">Manage tenant configurations and view PPD reports.</p>
        </div>
        
        <div class="flex gap-3">
          <DataUploader 
            title="Initial Setup" 
            description="Load ManagementPointData.csv"
            inputId="mng-upload"
            @file-loaded="loadManagementData"
            v-if="!isInitialized"
          />
          <button v-if="isInitialized && hasData" class="btn btn-secondary" @click="exportAll">
            <DownloadCloudIcon size="16" /> Export All
          </button>
        </div>
      </div>
      
      <div v-if="!isInitialized" class="card mt-8 p-12 text-center">
        <SettingsIcon size="48" class="mx-auto text-muted mb-4 opacity-50" />
        <h2 class="text-xl font-semibold mb-2">Application Not Initialized</h2>
        <p class="text-muted mb-6 max-w-md mx-auto">
          Please upload the <b>ManagementPointData.csv</b> file first to load available management points into the system.
        </p>
      </div>

      <template v-else>
        <!-- Data Uploader Card -->
        <DataUploader 
          title="Upload PPD Data" 
          description="Load consumption data from iTM"
          inputId="ppd-upload"
          @file-loaded="loadPpdData"
        />

        <!-- Tenant Result Viewer -->
        <TenantResult />
      </template>
    </main>
    
    <TenantDialog 
      :is-open="isDialogOpen" 
      :tenant-id="editingTenantId"
      @close="closeDialog" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ActivityIcon, PlusIcon, EditIcon, TrashIcon, 
  SettingsIcon, DownloadCloudIcon
} from 'lucide-vue-next'

import { useTenantStore } from '~/composables/useTenantStore'
import TenantDialog from '~/components/TenantDialog.vue'
import DataUploader from '~/components/DataUploader.vue'
import TenantResult from '~/components/TenantResult.vue'

const tenantStore = useTenantStore()

const tenants = computed(() => tenantStore.tenants)
const selectedTenantId = computed(() => tenantStore.selectedTenantId)
const isInitialized = computed(() => tenantStore.isInitialized)
const hasData = computed(() => tenantStore.ppdData.length > 0)

const isDialogOpen = ref(false)
const editingTenantId = ref<string | null>(null)

const selectTenant = (id: string) => {
  tenantStore.selectTenant(id)
}

const openCreateDialog = () => {
  editingTenantId.value = null
  isDialogOpen.value = true
}

const openEditDialog = (id: string) => {
  editingTenantId.value = id
  isDialogOpen.value = true
}

const closeDialog = () => {
  isDialogOpen.value = false
  editingTenantId.value = null
}

const deleteTenant = (id: string) => {
  if (confirm('Are you sure you want to delete this tenant?')) {
    tenantStore.deleteTenant(id)
  }
}

const loadManagementData = async (csvText: string) => {
  try {
    await tenantStore.loadManagementPoints(csvText)
  } catch (e) {
    alert('Failed to parse ManagementPointData.csv')
  }
}

const loadPpdData = async (csvText: string) => {
  try {
    await tenantStore.loadPpdData(csvText)
  } catch (e) {
    alert('Failed to parse PPD CSV')
  }
}

const exportAll = () => {
  if (!hasData.value || tenants.value.length === 0) return
  
  // Logic to export all tenants in one go or zip them.
  // For now, we will create a combined CSV
  let csvContent = 'Tenant Name,Point ID,Point Name,Value\n';
  
  tenants.value.forEach(tenant => {
    const data = tenantStore.tenantReportData(tenant.id);
    let total = 0;
    data.forEach(row => {
      csvContent += `"${tenant.name}",${row.pointId},"${row.pointName}",${row.value}\n`;
      total += parseFloat(row.value);
    });
    csvContent += `"${tenant.name} TOTAL",,,"${total.toFixed(2)}"\n\n`;
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'All_Tenants_Report.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.p-4 { padding: 1rem; }
.flex-col { flex-direction: column; }
.tracking-wider { letter-spacing: 0.05em; }
.tracking-tight { letter-spacing: -0.025em; }
.uppercase { text-transform: uppercase; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.max-w-md { max-width: 28rem; }
.opacity-50 { opacity: 0.5; }
.action-btn { padding: 0.25rem; border-radius: var(--radius-sm); }
</style>
