<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="text-xl font-semibold">{{ isEditing ? 'Edit Tenant' : 'Create Tenant' }}</h3>
        <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem;" @click="close">
          <XIcon size="18" />
        </button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Tenant Name</label>
          <input 
            v-model="tenantName" 
            type="text" 
            class="form-input" 
            placeholder="e.g. Acme Corp" 
            @keyup.enter="save"
          />
        </div>
        
        <div class="form-group mt-4">
          <label class="form-label">Management Points ({{ selectedPoints.length }} selected)</label>
          <div class="points-container">
            <div 
              v-for="point in managementPoints" 
              :key="point.id"
              class="point-item"
              :class="{ 'selected': selectedPoints.includes(point.id) }"
              @click="togglePoint(point.id)"
            >
              <div class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  :checked="selectedPoints.includes(point.id)"
                  @click.stop="togglePoint(point.id)"
                />
                <div>
                  <div class="point-name">{{ point.name }}</div>
                  <div class="point-id text-muted">{{ point.id }} ({{ point.type }})</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">Cancel</button>
        <button class="btn btn-primary" @click="save" :disabled="!tenantName.trim()">
          <SaveIcon size="16" />
          {{ isEditing ? 'Save Changes' : 'Create' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { XIcon, SaveIcon } from 'lucide-vue-next'
import { useTenantStore } from '~/composables/useTenantStore'

const props = defineProps({
  isOpen: Boolean,
  tenantId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close'])

const tenantStore = useTenantStore()
const managementPoints = computed(() => tenantStore.managementPoints)

const isEditing = computed(() => !!props.tenantId)
const tenantName = ref('')
const selectedPoints = ref<string[]>([])

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.tenantId) {
      const tenant = tenantStore.tenants.find(t => t.id === props.tenantId)
      if (tenant) {
        tenantName.value = tenant.name
        selectedPoints.value = [...tenant.points]
      }
    } else {
      tenantName.value = ''
      selectedPoints.value = []
    }
  }
})

const togglePoint = (pointId: string) => {
  const index = selectedPoints.value.indexOf(pointId)
  if (index === -1) {
    selectedPoints.value.push(pointId)
  } else {
    selectedPoints.value.splice(index, 1)
  }
}

const close = () => {
  emit('close')
}

const save = () => {
  if (!tenantName.value.trim()) return
  
  if (isEditing.value && props.tenantId) {
    tenantStore.updateTenant(props.tenantId, tenantName.value, selectedPoints.value)
  } else {
    tenantStore.createTenant(tenantName.value, selectedPoints.value)
  }
  close()
}
</script>

<style scoped>
.points-container {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-color);
}

.point-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition);
}

.point-item:last-child {
  border-bottom: none;
}

.point-item:hover {
  background-color: var(--surface-hover);
}

.point-item.selected {
  background-color: rgba(59, 130, 246, 0.1);
}

.point-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.point-id {
  font-size: 0.75rem;
  margin-top: 0.125rem;
}
</style>
