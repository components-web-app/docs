<script setup lang="ts">
import { FetchError } from 'ofetch'

const fieldId = useId()
const consentId = useId()
const emailAddress = ref()
const consentToTrack = ref(false)
const submitting = ref(false)
const showSuccess = ref(false)
const subscribeError = ref<FetchError>()

async function doRequest() {
  subscribeError.value = undefined
  submitting.value = true
  try {
    return await $fetch(`/api/subscribe`, {
      method: 'POST',
      body: {
        emailAddress: emailAddress.value,
        consentToTrack: consentToTrack.value
      }
    })
  } catch (e) {
    return e
  } finally {
    submitting.value = false
  }
}

async function addSubscriber() {
  const result = await doRequest()
  if (result instanceof FetchError) {
    subscribeError.value = result
    return
  }
  emailAddress.value = ''
  showSuccess.value = true
}
</script>

<template>
  <div>
    <div
      v-if="showSuccess"
      class="mt-8 py-6 text-center px-5 md:px-8 -mb-10 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 rounded-lg"
    >
      <h4 class="text-3xl font-mono font-extrabold text-vip">
        Welcome!
      </h4>
      <p class="text mt-4 font-mono font-bold">
        Thank you for becoming our VIP. We'll email you CWA news now and then, and look forward to collaborating on this adventure with you.
      </p>
    </div>
    <div
      v-else
      class="mt-20 md:mt-24 w-full"
    >
      <div class="font-script text-2xl md:text-5xl flex justify-center mb-1">
        <div class="flex">
          <SvgoVipArrow />
          <span class="block -rotate-6 text-black dark:text-vip -translate-y-7 md:-translate-y-10">Join the adventure!</span>
        </div>
      </div>
      <div class="flex justify-center w-full">
        <form
          :class="{ 'opacity-50': submitting }"
          class="w-full max-w-[380px]"
          @submit.prevent="addSubscriber"
        >
          <div class="w-full bg-white dark:bg-gray-950 border-2 border-vip rounded-lg flex flex-col px-2 md:px-4 pt-1 pb-1.5 md:pt-1.5 md:pb-2 focus-within:border-black dark:focus-within:border-white">
            <label
              :for="fieldId"
              class="text-gray-500 dark:text-gray-400 font-bold text-sm md:text-base"
            >Your email</label>
            <input
              :id="fieldId"
              v-model="emailAddress"
              :disabled="submitting"
              type="email"
              class="font-bold text-base md:text-lg bg-transparent focus:outline-none dark:placeholder:text-white/20"
              placeholder="vip@email.com"
              autoComplete="Email"
              aria-label="Email"
              required
              maxLength="200"
            >
          </div>
          <label
            :for="consentId"
            class="mt-3 flex items-start gap-2 text-sm text-left"
          >
            <input
              :id="consentId"
              v-model="consentToTrack"
              :disabled="submitting"
              type="checkbox"
              class="mt-1"
            >
            <span>Campaign Monitor, our email provider, may record when I open an email or click a link in it.</span>
          </label>
          <p class="mt-2 text-sm text-left text-gray-600 dark:text-gray-400">
            We use your email address only to send CWA news. See our <NuxtLink
              to="/privacy"
              class="underline"
            >Privacy Policy</NuxtLink>.
          </p>
          <div
            v-if="subscribeError"
            role="alert"
            class="text-red-500 font-mono font-bold my-1"
          >
            {{ subscribeError.data?.statusMessage || 'We couldn\'t sign you up just now. Please try again later.' }}
          </div>
          <UButton
            :disabled="submitting"
            type="submit"
            color="neutral"
            size="xl"
            block
            class="mt-4 font-bold"
          >
            {{ submitting ? 'Please Wait...' : 'Become Our VIP' }}
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>
