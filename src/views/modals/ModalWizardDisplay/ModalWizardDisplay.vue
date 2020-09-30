<template>
  <Steps :current="currentItemIndex" :size="size">
    <Step
      v-for="(item, index) in items"
      :key="index"
      :title="$t(item)"
      :icon="getIcon(item)"
      :class="{
        active: currentItemIndex >= index,
      }"
    />
  </Steps>
</template>
<script lang="ts">
// external dependencies
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class ModalWizardDisplay extends Vue {
  protected isDisplayed = false

  @Prop({ default: () => [] }) items: string[]
  @Prop({ default: () => [] }) icons: string[]
  @Prop({ default: 0 }) currentItemIndex: number
  @Prop({ default: 'small' }) size: string

  protected showWizard(): void {
    this.isDisplayed = true
  }

  protected getIcon(item: string) {
    if (!this.icons.length) return undefined

    const idx = this.items.findIndex((i) => i === item)
    return this.icons[idx]
  }
}
</script>
