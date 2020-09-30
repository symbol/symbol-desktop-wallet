import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class LongTextDisplayTs extends Vue {
  @Prop({ default: '' }) readonly text!: string

  @Prop({ default: 10 }) readonly rightPartSize!: number

  @Prop({ default: 'Full Text' }) readonly popTipTitle!: string

  @Prop({ default: 600 }) readonly popTipWidth!: number

  public get lastCharsCount() {
    return Math.min(this.text.length, this.rightPartSize)
  }

  public get leftPart() {
    return this.text.substr(0, this.text.length - this.lastCharsCount)
  }

  public get rightPart() {
    return this.text.substr(this.text.length - this.lastCharsCount, this.text.length)
  }
}
