import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class SplitButtonTs extends Vue {
  @Prop({ default: '' }) readonly label!: string
  @Prop({ default: 'button-style validation-button' }) readonly className!: string
  @Prop({ default: 'validation-button' }) readonly dropdownClassName!: string
  @Prop({ default: [] }) readonly dropdownActions!: Array<{ icon: string; label: string; action: () => void }>
}
