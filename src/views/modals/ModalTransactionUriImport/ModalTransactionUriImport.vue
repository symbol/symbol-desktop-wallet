<template>
  <div>
    <ModalFormWrap
      :visible="visible"
      :title="$t('import_transaction_uri')"
      :hide-footer="true"
      @close="() => $emit('close')"
    >
      <template v-slot:form>
        <FormWrapper :whitelisted="true">
          <ValidationObserver v-slot="{ handleSubmit }" ref="observer" slim>
            <form onsubmit="event.preventDefault()" class="form-line-container mt-3">
              <FormRow>
                <template v-slot:label> {{ $t('transaction_uri') }}: </template>
                <template v-slot:inputs>
                  <div class="row-75-25 inputs-container">
                    <ValidationProvider
                      ref="provider"
                      v-slot="{ errors }"
                      vid="transactionURI"
                      :name="$t('transaction_uri')"
                      rules="required"
                      slim
                    >
                      <ErrorTooltip :errors="errors">
                        <textarea
                          v-model="transactionURIModel"
                          v-focus
                          class="textarea-style"
                          :placeholder="$t('placeholder_transaction_uri')"
                        />
                      </ErrorTooltip>
                    </ValidationProvider>
                    <button
                      class="button-style validation-button right-side-button"
                      type="submit"
                      @click="handleSubmit(onSubmit)"
                    >
                      {{ $t('import') }}
                    </button>
                  </div>
                </template>
              </FormRow>
            </form>
          </ValidationObserver>
        </FormWrapper>
      </template>
    </ModalFormWrap>
  </div>
</template>

<script lang="ts">
import ModalTransactionUriImportTs from './ModalTransactionUriImportTs'

export default class ModalTransactionUriImport extends ModalTransactionUriImportTs {}
</script>
