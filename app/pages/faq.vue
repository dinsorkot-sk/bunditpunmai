<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'

const { t } = useI18n()

const items = computed<AccordionItem[]>(() => [
  {
    label: t('faq.q1'),
    content: t('faq.q1_a'),
  },
  {
    label: t('faq.q2'),
    content: t('faq.q2_a'),
  },
  {
    label: t('faq.q3'),
    content: t('faq.q3_a'),
  },
  {
    label: t('faq.q4'),
    content: t('faq.q4_a'),
  },
  {
    label: t('faq.q5'),
    content: t('faq.q5_a'),
  },
  {
    label: t('faq.q6'),
    content: t('faq.q6_a'),
  },
  {
    label: t('faq.q7'),
    content: t('faq.q7_a'),
  },
])
</script>

<template>
  <UPage>
    <UPageSection
      :title="$t('faq.title')"
      :description="$t('faq.description')"
      orientation="horizontal"
    />

    <UPageSection>
      <UAccordion :items="items" type="multiple" />
    </UPageSection>
  </UPage>
</template>
