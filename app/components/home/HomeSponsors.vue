<template>
  <UContainer>
    <div class="flex justify-center">
      <ULandingLogos
        title="Special thanks to our sponsors"
        align="center"
        :ui="{ images: 'mx-auto mt-10 flex flex-wrap items-center justify-between gap-8 flex-col sm:flex-row' }"
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
            alt="Sponsored by Nuxt UI Pro"
            :font-controlled="false"
          />
        </div>
      </ULandingLogos>
    </div>
  </UContainer>
</template>
