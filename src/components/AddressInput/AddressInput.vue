<template>
    <FormRow>
        <template v-slot:label> {{ $t(label) }}: </template>
        <template v-slot:inputs>
            <ValidationProvider
                v-slot="{ errors }"
                vid="recipient"
                :name="$t('recipient')"
                :rules="`required|address:${networkType}`"
                tag="div"
                class="inputs-container"
            >
                <ErrorTooltip :errors="errors">
                    <input v-model="rawValue" v-focus class="input-size input-style" :placeholder="$t('placeholder_address')" type="text" />
                </ErrorTooltip>
            </ValidationProvider>
        </template>
    </FormRow>
</template>

<script lang="ts">
import AddressInputTs from './AddressInputTs';

export default class AddressInput extends AddressInputTs {}
</script>
