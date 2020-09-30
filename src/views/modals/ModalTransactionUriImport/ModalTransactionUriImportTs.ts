import { Vue, Component, Prop } from 'vue-property-decorator'

import { TransactionURI } from 'symbol-uri-scheme'
// @ts-ignore
import ModalFormWrap from '@/views/modals/ModalFormWrap/ModalFormWrap.vue'
// @ts-ignore
import ButtonCopyToClipboard from '@/components/ButtonCopyToClipboard/ButtonCopyToClipboard.vue'
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue'
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue'

@Component({
  components: {
    ModalFormWrap,
    ButtonCopyToClipboard,
    FormWrapper,
    FormRow,
    ValidationObserver,
    ValidationProvider,
    ErrorTooltip,
  },
})
export default class ModalTransactionUriImportTs extends Vue {
  @Prop({ default: false }) visible!: boolean

  public transactionURIModel: string = ''

  public $refs!: {
    observer: InstanceType<typeof ValidationObserver>
    provider: InstanceType<typeof ValidationProvider>
  }

  onSubmit() {
    try {
      this.$emit(
        'importTransaction',
        TransactionURI.fromURI(this.sanitizeInput(this.transactionURIModel)).toTransaction(),
      )
      this.$emit('close')
    } catch (error) {
      this.showError(error)
    }
  }

  private showError(error: string) {
    this.$refs.provider.applyResult({
      errors: [error],
      failedRules: {},
    })
  }

  private sanitizeInput(transactionURI: string) {
    if (!!transactionURI && !transactionURI.startsWith('web+symbol://')) {
      return 'web+symbol://' + transactionURI
    }
    return transactionURI
  }
}
