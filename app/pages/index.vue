<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Index">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <Placeholder class="h-full" />
    </template>
  </UDashboardPanel>
</template>
