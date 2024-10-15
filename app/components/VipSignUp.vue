<script setup lang="ts">
import { FetchError } from 'ofetch'

const fieldId = useId()
const emailAddress = ref()
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
        emailAddress: emailAddress.value
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
      class="mt-8 py-8 text-center px-5 -mx-5 md:-mx-16 md:px-16 -mb-10 border rounded-lg"
    >
      <h4 class="text-3xl font-mono font-extrabold">
        Welcome!
      </h4>
      <p class="text-lg mt-4">
        Thank you for becoming our VIP. We will be in touch to share the playground link and look forward to collaborating on this adventure with you.
      </p>
    </div>
    <div
      v-else
      class="mt-20 md:mt-24 w-full"
    >
      <div class="font-script text-2xl md:text-5xl flex justify-center mb-1">
        <div class="flex">
          <SvgoVipArrow />
          <span class="block -rotate-6 text-vip -translate-y-7 md:-translate-y-10">Join the adventure!</span>
        </div>
      </div>
      <div class="flex justify-center w-full">
        <form
          :class="{ 'opacity-50': submitting }"
          class="w-full max-w-[380px]"
          action="https://www.createsend.com/t/subscribeerror?description="
          @submit.prevent="addSubscriber"
        >
          <div class="w-full bg-field border-2 border-vip rounded-lg flex flex-col px-2 md:px-4 pt-1 pb-1.5 md:pt-1.5 md:pb-2 focus-within:border-white">
            <label
              :for="fieldId"
              class="text-label font-bold text-sm md:text-base"
            >Your email</label>
            <input
              :id="fieldId"
              v-model="emailAddress"
              :disabled="submitting"
              type="email"
              class="font-bold text-base md:text-lg bg-transparent focus:outline-none placeholder:text-white/20"
              placeholder="vip@email.com"
              autoComplete="Email"
              aria-label="Email"
              required
              maxLength="200"
            >
          </div>
          <div
            v-if="subscribeError"
            class="text-red-500 font-mono font-bold my-1"
          >
            ({{ subscribeError.response?._data.data.Code || '-1' }})
            {{ subscribeError.response?._data.data.Message || 'An Error Occurred' }}
          </div>
          <UButton
            :disabled="submitting"
            type="submit"
            color="white"
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
