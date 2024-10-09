<template>
  <UContainer>
    <div class="flex justify-center">
      <ULandingLogos
        title="Special thanks to our sponsors"
        align="center"
      >
        <div class="px-4">
          <SvgoLogoSwa
            class="opacity-50 h-12"
            alt="Sponsored by Silverback Web Apps"
            :font-controlled="false"
          />
        </div>
        <div class="px-4">
          <SvgoLogoUbc
            class="opacity-50 h-12"
            alt="Sponsored by Unlocking Behaviour Change"
            :font-controlled="false"
          />
        </div>
        <div class="px-4">
          <SvgoLogoNuxtUi
            class="opacity-50 h-10"
            alt="Sponsored by Nuxt UI Pro"
            :font-controlled="false"
          />
        </div>
      </ULandingLogos>
    </div>
  </UContainer>
</template>
