<template>
  <div class="card mb-4 border-dashed border-2">
    <div class="flex items-center gap-4">
      <div class="upload-icon-wrapper">
        <UploadCloudIcon size="24" class="text-primary" />
      </div>
      <div class="flex-1">
        <h3 class="font-semibold text-lg">{{ title }}</h3>
        <p class="text-sm text-muted">{{ description }}</p>
      </div>
      <div>
        <input 
          type="file" 
          accept=".csv" 
          class="hidden" 
          :id="inputId" 
          @change="handleFileUpload"
        />
        <label :for="inputId" class="btn btn-primary cursor-pointer">
          <FileUpIcon size="16" />
          Select CSV File
        </label>
      </div>
    </div>
    
    <div v-if="errorMsg" class="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-400 text-sm">
      {{ errorMsg }}
    </div>
    <div v-if="successMsg" class="mt-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-md text-green-400 text-sm">
      {{ successMsg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloudIcon, FileUpIcon } from 'lucide-vue-next'

const props = defineProps({
  title: String,
  description: String,
  inputId: {
    type: String,
    default: 'file-upload'
  }
})

const emit = defineEmits(['file-loaded'])

const errorMsg = ref('')
const successMsg = ref('')

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  errorMsg.value = '';
  successMsg.value = '';
  
  if (file.name.endsWith('.csv')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        emit('file-loaded', text);
        successMsg.value = `File "${file.name}" loaded successfully.`;
        setTimeout(() => { successMsg.value = ''; }, 3000);
      }
    };
    reader.onerror = () => {
      errorMsg.value = 'Error reading the file.';
    };
    reader.readAsText(file);
  } else {
    errorMsg.value = 'Please select a valid CSV file.';
  }
  
  // reset input
  target.value = '';
}
</script>

<style scoped>
.hidden {
  display: none;
}
.cursor-pointer {
  cursor: pointer;
}
.border-dashed {
  border-style: dashed;
}
.border-2 {
  border-width: 2px;
}
.upload-icon-wrapper {
  background-color: rgba(59, 130, 246, 0.1);
  padding: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.text-primary {
  color: var(--primary-color);
}
</style>
