<template>
  <div class="app-container">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTenantStore } from '~/composables/useTenantStore'

const tenantStore = useTenantStore()

onMounted(() => {
  tenantStore.initFromLocalStorage()
})
</script>
