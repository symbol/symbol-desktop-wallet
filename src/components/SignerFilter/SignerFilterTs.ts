import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Signer } from '@/store/Account'
import { mapGetters } from 'vuex'

@Component({
  computed: {
    ...mapGetters({
      currentSigner: 'account/currentSigner',
    }),
  },
})
export class SignerFilterTs extends Vue {
  @Prop({ default: [] })
  public signers: Signer[]

  /**
   * Selected signer from the store
   * @protected
   * @type {string}
   */
  public currentSigner: Signer

  public selectedSigner: string =
    (this.currentSigner && this.currentSigner.address.plain()) ||
    (this.signers.length && this.signers[0].address.plain()) ||
    ''

  /**
   * onAddressChange
   */
  public onSignerChange() {
    this.$emit('signer-change', this.selectedSigner)
  }

  @Watch('currentSigner')
  onCurrentSignerChange() {
    this.selectedSigner = this.currentSigner.address.plain()
  }
}
