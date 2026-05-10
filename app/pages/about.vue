<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const cards = computed(() => [
    {
        title: t('about.our_goal'),
        description: t('about.our_goal_desc'),
        icon: 'i-lucide-smile',
        to: localePath('/docs/getting-started/integrations/icons')
    },
    {
        title: t('about.vision'),
        description: t('about.vision_desc'),
        icon: 'i-lucide-a-large-small',
        to: localePath('/docs/getting-started/integrations/fonts')
    }
])

const features = computed(() => [
    {
        title: t('about.objective_skill'),
        description: t('about.objective_skill_desc'),
        icon: 'i-lucide-smile',
    },
    {
        title: t('about.objective_innovation'),
        description: t('about.objective_innovation_desc'),
        icon: 'i-lucide-a-large-small',
    },
    {
        title: t('about.objective_collaboration'),
        description: t('about.objective_collaboration_desc'),
        icon: 'i-lucide-sun-moon',
    },
    {
        title: t('about.objective_economy'),
        description: t('about.objective_economy_desc'),
        icon: 'i-lucide-sun-moon',
    },
])
</script>
<template>
    <UPage>
        <UPageSection :title="$t('about.title')" :description="$t('site.description')" orientation="horizontal" />

        <UPageSection>
            <UPageGrid class="lg:grid-cols-2">
                <UPageCard v-for="(card, index) in cards" :key="index" v-bind="card" />
            </UPageGrid>
        </UPageSection>

        <UPageSection :title="$t('about.objectives_title')" :features="features" :ui="{ features: 'lg:grid-cols-2' }" />

        <UPageSection :title="$t('about.sponsors_title')">
            <UPageLogos :items="[
                'i-simple-icons-github',
                'i-simple-icons-discord',
                'i-simple-icons-x',
                'i-simple-icons-instagram',
                'i-simple-icons-linkedin',
                'i-simple-icons-facebook'
            ]" />
        </UPageSection>
    </UPage>
</template>
