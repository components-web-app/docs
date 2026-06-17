<template>
  <UContainer>
    <div class="flex justify-center">
      <UPageLogos
        title="Special thanks to our sponsors"
        :ui="{ logos: 'mx-auto mt-10 flex flex-wrap items-center justify-between gap-8 flex-col sm:flex-row' }"
      >
        <div class="md:px-4">
          <SvgoLogoSwa
            class="opacity-50 h-8 md:h-10"
            alt="Sponsored by Silverback Web Apps"
            :font-controlled="false"
          />
        </div>
        <div class="md:px-4">
          <SvgoLogoUbc
            class="opacity-50 h-9 md:h-10"
            alt="Sponsored by Unlocking Behaviour Change"
            :font-controlled="false"
          />
        </div>
        <div class="md:px-4">
          <SvgoLogoNuxtUi
            class="opacity-50 h-7 md:h-9"
            alt="Sponsored by Nuxt UI"
            :font-controlled="false"
          />
        </div>
      </UPageLogos>
    </div>
  </UContainer>
</template>
