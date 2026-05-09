<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'

interface Feature {
    title: string
    description: string
    icon: string
}

const features = ref<Feature[]>([
    {
        title: 'ระยะเวลาการรับสมัคร',
        description: 'November 1, 2023 - January 15, 2024',
        icon: 'i-lucide-calendar-days',
    },
    {
        title: 'คัดเลือก',
        description: 'January 20 - February 10, 2024',
        icon: 'i-lucide-users',
    },
    {
        title: 'เริ่มอบรม',
        description: 'February - March 2024 (varies by course)',
        icon: 'i-lucide-graduation-cap',
    },
])

const qualifications = ref([
    {
        label: 'ปริญญาตรี',
        description: 'สำเร็จการศึกษาในระดับปริญญาตรีหรือสูงกว่าในสาขาที่เกี่ยวข้อง (ข้อกำหนดเฉพาะแตกต่างกันไปในแต่ละหลักสูตร)',
    },
    {
        label: 'สำเร็จการศึกษาเมื่อไม่นานนี้',
        description: 'สำเร็จการศึกษาภายใน 3 ปีที่ผ่านมาหรืออยู่ในปีสุดท้ายของการศึกษา',
    },
    {
        label: 'สัญชาติไทย',
        description: 'เป็นพลเมืองไทยหรือมีใบอนุญาตที่จำเป็นในการศึกษาและทำงานในประเทศไทย',
    },
    {
        label: 'ความสามารถทางภาษา',
        description: 'แสดงความสามารถทางภาษาไทย และ/หรือ ภาษาอังกฤษ (ขึ้นอยู่กับหลักสูตร)',
    },
    {
        label: 'ความมุ่งมั่น',
        description: 'สามารถมุ่งมั่นกับโปรแกรมได้เต็มเวลาตลอดระยะเวลาที่กำหนดไว้',
    },
])

const documents = ref([
    {
        icon: 'i-lucide-file-text',
        label: 'แบบฟอร์มใบสมัครที่สมบูรณ์',
        description: 'กรอกแบบฟอร์มใบสมัครออนไลน์ให้ครบถ้วน',
    },
    {
        icon: 'i-lucide-user',
        label: 'CV/Resume',
        description: 'ประวัติย่อล่าสุดที่เน้นด้านการศึกษา ทักษะ และประสบการณ์ที่เกี่ยวข้องของคุณ',
    },
    {
        icon: 'i-lucide-book-open',
        label: 'สำเนาผลการเรียนทางวิชาการ',
        description: 'สำเนาผลการเรียนอย่างเป็นทางการจากมหาวิทยาลัยของคุณ',
    },
    {
        icon: 'i-lucide-id-card',
        label: 'สำเนาบัตรประชาชน/หนังสือเดินทาง',
        description: 'เอกสารยืนยันตัวตนที่ยังไม่หมดอายุ',
    },
    {
        icon: 'i-lucide-pen-tool',
        label: 'คำชี้แจงส่วนตัว',
        description: 'คำชี้แจงที่อธิบายถึงความสนใจของคุณในโปรแกรมนี้และว่าโปรแกรมนี้สอดคล้องกับเป้าหมายอาชีพของคุณอย่างไร (500–800 คำ)',
    },
    {
        icon: 'i-lucide-mail',
        label: 'จดหมายอ้างอิง',
        description: 'จดหมายแนะนำอย่างน้อยหนึ่งฉบับจากผู้อ้างอิงทางวิชาการหรือวิชาชีพ',
    },
])

const stepperItems = ref<StepperItem[]>([
  {
    title: 'การสมัครออนไลน์',
    description: 'กรอกแบบฟอร์มใบสมัครออนไลน์และอัพโหลดเอกสารที่จำเป็นทั้งหมดผ่านใบสมัครที่ปลอดภัยของเรา',
  },
  {
    title: 'การตรวจสอบการสมัคร',
    description: 'ทีมรับสมัครของเราจะตรวจสอบใบสมัครและเอกสารของคุณเพื่อให้แน่ใจว่าตรงตามข้อกำหนดคุณสมบัติ',
  },
  {
    title: 'แบบทดสอบประเมินผล',
    description: 'ผู้สมัครที่มีคุณสมบัติจะได้รับเชิญให้ทำการทดสอบประเมินผลออนไลน์ที่เกี่ยวข้องกับหลักสูตรที่ตนเลือก'
  },
  {
    title: 'สัมภาษณ์',
    description: 'ผู้สมัครที่ผ่านการคัดเลือกจะได้รับเชิญให้สัมภาษณ์แบบตัวต่อตัวหรือแบบเสมือนจริงกับคณาจารย์ของโครงการและตัวแทนจากอุตสาหกรรม'
  },
  {
    title: 'แบบทดสอบประเมินผล',
    description: 'การตัดสินใจขั้นสุดท้ายจะแจ้งให้ผู้สมัครทุกคนทราบ โดยนักเรียนที่ผ่านการคัดเลือกจะได้รับ คำแนะนำในการลงทะเบียน'
  }
])
</script>

<template>
    <UPage>
        <UPageSection title="การรับสมัคร"
            description="เข้าร่วมโครงการฝึกอบรมชั้นนำของประเทศไทยสำหรับอุตสาหกรรม New Growth Engine ขณะนี้เปิดรับสมัครสำหรับกลุ่มปี 2024 แล้ว"
            orientation="horizontal" />

        <UPageSection title="กำหนดเวลาการสมัคร">
            <div class="flex flex-col gap-8 lg:gap-y-16 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                <UPageCard v-for="value in features" :key="value.title" :title="value.title"
                    :description="value.description" :icon="value.icon" to="https://tailwindcss.com/docs/v4-beta"
                    target="_blank" variant="soft" />
            </div>
        </UPageSection>

        <UPageSection title="คุณสมบัติผู้เข้าร่วม">
            <UPageGrid class="lg:grid-cols-2">
                <!-- คุณสมบัติทั่วไป -->
                <div class="flex flex-col gap-4">
                    <h3 class="text-base font-semibold text-highlighted">คุณสมบัติทั่วไป</h3>
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
                        description="หลักสูตรบางหลักสูตรอาจมีข้อกำหนดเฉพาะเพิ่มเติม โปรดตรวจสอบรายละเอียดในหน้าหลักสูตรแต่ละหลักสูตร" />
                </div>

                <!-- เอกสารที่ต้องการ -->
                <div class="flex flex-col gap-4">
                    <h3 class="text-base font-semibold text-highlighted">เอกสารที่ต้องการ</h3>
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

        <UPageSection title="ขั้นตอนการสมัคร">
            <UStepper orientation="vertical" :items="stepperItems" class="justify-center" />
        </UPageSection>
    </UPage>
</template>