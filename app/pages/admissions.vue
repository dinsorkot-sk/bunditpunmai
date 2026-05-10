<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'
import { computed } from 'vue'

const { t } = useI18n()

interface Feature {
    title: string
    description: string
    icon: string
}

const features = computed<Feature[]>(() => [
    {
        title: t('admissions.period'),
        description: t('admissions.period_desc'),
        icon: 'i-lucide-calendar-days',
    },
    {
        title: t('admissions.selection'),
        description: t('admissions.selection_desc'),
        icon: 'i-lucide-users',
    },
    {
        title: t('admissions.training_start'),
        description: t('admissions.training_start_desc'),
        icon: 'i-lucide-graduation-cap',
    },
])

const qualifications = computed(() => [
    {
        label: t('admissions.qual_bachelor'),
        description: t('admissions.qual_bachelor_desc'),
    },
    {
        label: t('admissions.qual_recent_graduate'),
        description: t('admissions.qual_recent_graduate_desc'),
    },
    {
        label: t('admissions.qual_thai_nationality'),
        description: t('admissions.qual_thai_nationality_desc'),
    },
    {
        label: t('admissions.qual_language'),
        description: t('admissions.qual_language_desc'),
    },
    {
        label: t('admissions.qual_commitment'),
        description: t('admissions.qual_commitment_desc'),
    },
])

const documents = computed(() => [
    {
        icon: 'i-lucide-file-text',
        label: t('admissions.doc_application'),
        description: t('admissions.doc_application_desc'),
    },
    {
        icon: 'i-lucide-user',
        label: t('admissions.doc_cv'),
        description: t('admissions.doc_cv_desc'),
    },
    {
        icon: 'i-lucide-book-open',
        label: t('admissions.doc_transcript'),
        description: t('admissions.doc_transcript_desc'),
    },
    {
        icon: 'i-lucide-id-card',
        label: t('admissions.doc_id'),
        description: t('admissions.doc_id_desc'),
    },
    {
        icon: 'i-lucide-pen-tool',
        label: t('admissions.doc_statement'),
        description: t('admissions.doc_statement_desc'),
    },
    {
        icon: 'i-lucide-mail',
        label: t('admissions.doc_reference'),
        description: t('admissions.doc_reference_desc'),
    },
])

const stepperItems = computed<StepperItem[]>(() => [
  {
    title: t('admissions.step1_title'),
    description: t('admissions.step1_desc'),
  },
  {
    title: t('admissions.step2_title'),
    description: t('admissions.step2_desc'),
  },
  {
    title: t('admissions.step3_title'),
    description: t('admissions.step3_desc'),
  },
  {
    title: t('admissions.step4_title'),
    description: t('admissions.step4_desc'),
  },
  {
    title: t('admissions.step5_title'),
    description: t('admissions.step5_desc'),
  },
])
</script>

<template>
    <UPage>
        <UPageSection :title="$t('admissions.title')"
            :description="$t('admissions.description')"
            orientation="horizontal" />

        <UPageSection :title="$t('admissions.timeline_title')">
            <div class="flex flex-col gap-8 lg:gap-y-16 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                <UPageCard v-for="value in features" :key="value.title" :title="value.title"
                    :description="value.description" :icon="value.icon" to="https://tailwindcss.com/docs/v4-beta"
                    target="_blank" variant="soft" />
            </div>
        </UPageSection>

        <UPageSection :title="$t('admissions.qualifications_title')">
            <UPageGrid class="lg:grid-cols-2">
                <div class="flex flex-col gap-4">
                    <h3 class="text-base font-semibold text-highlighted">{{ $t('admissions.general_requirements') }}</h3>
                    <div class="flex flex-col gap-3">
                        <div v-for="(item, index) in qualifications" :key="index" class="flex items-start gap-3">
                            <UIcon name="i-lucide-circle-check" class="text-primary mt-0.5 shrink-0 size-5" />
                            <div class="flex flex-col">
                                <span class="font-semibold text-sm text-highlighted">{{ item.label }}:</span>
                                <span class="text-sm text-muted">{{ item.description }}</span>
                            </div>
                        </div>
                    </div>
                    <UAlert icon="i-lucide-info" color="warning" variant="soft"
                        :description="$t('admissions.alert_note')" />
                </div>

                <div class="flex flex-col gap-4">
                    <h3 class="text-base font-semibold text-highlighted">{{ $t('admissions.required_documents') }}</h3>
                    <div class="flex flex-col gap-3">
                        <div v-for="(doc, index) in documents" :key="index" class="flex items-start gap-3">
                            <UIcon :name="doc.icon" class="text-primary mt-0.5 shrink-0 size-5" />
                            <div class="flex flex-col">
                                <span class="font-semibold text-sm text-highlighted">{{ doc.label }}:</span>
                                <span class="text-sm text-muted">{{ doc.description }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </UPageGrid>
        </UPageSection>

        <UPageSection :title="$t('admissions.steps_title')">
            <UStepper orientation="vertical" :items="stepperItems" class="justify-center" />
        </UPageSection>
    </UPage>
</template>
