// external dependencies
import { Account, AccountInfo, AccountType, PublicAccount, NetworkType } from 'symbol-sdk'
import { AccountModel, AccountType as ProfileType } from '@/core/database/entities/AccountModel'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import { TransactionCommand } from '@/services/TransactionCommand'

// child components
// @ts-ignore
import ModalWizardDisplay from '@/views/modals/ModalWizardDisplay/ModalWizardDisplay.vue'
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue'
// @ts-ignore
import FormRemoteAccountCreation from '@/views/forms/FormRemoteAccountCreation/FormRemoteAccountCreation.vue'
// @ts-ignore
import FormAccountKeyLinkTransaction from '@/views/forms/FormAccountKeyLinkTransaction/FormAccountKeyLinkTransaction.vue'
// @ts-ignore
import FormPersistentDelegationRequestTransaction from '@/views/forms/FormPersistentDelegationRequestTransaction/FormPersistentDelegationRequestTransaction.vue'
// @ts-ignore
import AccountAddressDisplay from '@/components/AccountAddressDisplay/AccountAddressDisplay.vue'
// @ts-ignore
import AccountPublicKeyDisplay from '@/components/AccountPublicKeyDisplay/AccountPublicKeyDisplay.vue'
// @ts-ignore
import ProtectedPrivateKeyDisplay from '@/components/ProtectedPrivateKeyDisplay/ProtectedPrivateKeyDisplay.vue'
// @ts-ignore
import FormTransactionConfirmation from '@/views/forms/FormTransactionConfirmation/FormTransactionConfirmation.vue'

/**
 * Wizard steps
 */
enum HarvestingWizardSteps {
  ACCOUNT_LINK = 0,
  SET_UP = 1,
  CONFIRMATION = 2,
}

@Component({
  components: {
    ModalWizardDisplay,
    FormRow,
    FormRemoteAccountCreation,
    FormAccountKeyLinkTransaction,
    FormPersistentDelegationRequestTransaction,
    AccountAddressDisplay,
    AccountPublicKeyDisplay,
    ProtectedPrivateKeyDisplay,
    FormTransactionConfirmation,
  },
  computed: mapGetters({
    currentAccount: 'account/currentAccount',
    currentAccountAccountInfo: 'account/currentAccountAccountInfo',
    networkType: 'network/networkType',
  }),
})
export class ModalHarvestingWizardTs extends Vue {
  /**
   * Enum representing the wizard steps
   */
  protected wizardSteps = HarvestingWizardSteps

  protected supportedProfileTypes: ProfileType[] = [ProfileType.SEED]

  /**
   * Current account
   */
  private currentAccount: AccountModel

  /**
   * Current account account info
   */
  private currentAccountAccountInfo: AccountInfo

  /**
   * The current network type
   */
  private networkType: NetworkType

  /**
   * Items that will be shown in the ModalWizardDisplay
   */
  protected wizardStepsItems = Object.keys(HarvestingWizardSteps).filter((key) => Number.isNaN(parseInt(key)))

  /**
   * Icons that will be shown in the ModalWizardDisplay
   */
  protected wizardStepsIcons = Object.keys(HarvestingWizardSteps)
    .filter((key) => Number.isNaN(parseInt(key)))
    .map((item) => {
      switch (item) {
        default:
        case 'ACCOUNT_LINK':
          return 'ios-card'
        case 'SET_UP':
          return 'ios-globe'
        case 'CONFIRMATION':
          return 'md-time'
      }
    })

  /**
   * Currently active step
   */
  protected currentStepIndex = 0

  /**
   * Sets the disabled property of the next button
   */
  protected isNextEnabled = true

  /**
   * Remote account
   */
  protected remoteAccount: Account = null

  /**
   * Node public key
   */
  protected nodePublicKey: string = null

  private form: any
  private command: TransactionCommand

  /**
   * Modal visibility state from parent
   * @type {string}
   */
  @Prop({ default: false }) visible: boolean

  /**
   * Internal visibility state
   * @type {boolean}
   */
  protected get show(): boolean {
    return this.visible
  }

  /**
   * Emits close event
   */
  protected set show(val) {
    if (!val) {
      this.$emit('close')
    }
  }

  /**
   * Hook called when the next button is clicked
   */
  protected onNextClicked(): void {
    let nextStepIndex = (this.currentStepIndex += 1)

    // skip the account link step if the current account is already linked
    if (nextStepIndex === this.wizardSteps.ACCOUNT_LINK && this.isCurrentAccountLinked) {
      nextStepIndex += 1
    }

    if (nextStepIndex === this.wizardSteps.CONFIRMATION) {
      this.command = ((this.$refs
        .delegationRequest as FormPersistentDelegationRequestTransaction).onSubmit() as unknown) as TransactionCommand
      if (!this.command) {
        nextStepIndex -= 1
        this.currentStepIndex = nextStepIndex
        return
      }
    } else if (nextStepIndex === this.wizardSteps.CONFIRMATION + 1) {
      ;(this.$refs.confirmationForm as FormTransactionConfirmation).onSubmit()
      this.show = false
      return
    }

    this.currentStepIndex = nextStepIndex
  }

  private get isCurrentAccountLinked(): boolean {
    return this.currentAccountAccountInfo && this.currentAccountAccountInfo.accountType === AccountType.Main
  }

  private get linkedAccount(): PublicAccount {
    if (!this.currentAccountAccountInfo || !this.currentAccountAccountInfo.supplementalPublicKeys.linked)
      return undefined

    return PublicAccount.createFromPublicKey(
      this.currentAccountAccountInfo.supplementalPublicKeys.linked.publicKey,
      this.networkType,
    )
  }

  /**
   * Hook called when the previous button is called
   */
  protected onPreviousClicked(): void {
    this.currentStepIndex = this.currentStepIndex -= 1
  }

  /**
   * Hook called when a child component toggles the disabled state of the next button
   * @param {boolean} bool
   */
  protected onNextToggled(bool: boolean): void {
    this.isNextEnabled = bool
  }

  /**
   * Hook called when a child component sets the remote account
   * @param {Account} remoteAccount
   */
  protected onSetRemoteAccount(remoteAccount: Account): void {
    this.remoteAccount = remoteAccount
    this.onNextClicked()
  }

  /**
   * Hook called when a child component sets the node public key
   * @param {string} nodePublicKey
   */
  protected onSetNodePublicKey(nodePublicKey: string): void {
    this.nodePublicKey = nodePublicKey
  }

  /**
   * Hook called when the child component ModalTransactionConfirmation triggers
   * the event 'success'
   */
  public onConfirmationSuccess() {
    this.$emit('on-confirmation-success')
  }

  /**
   * Hook called when the child component ModalTransactionConfirmation triggers
   * the event 'error'
   * @return {void}
   */
  public onConfirmationError(error: string) {
    this.$store.dispatch('notification/ADD_ERROR', error)
  }

  /**
   * Hook called when the child component ModalTransactionConfirmation triggers
   * the event 'close'
   * @return {void}
   */
  public onConfirmationCancel() {
    this.show = false
  }

  /**
   * Hook called when the component is created
   */
  public created() {
    this.$emit('toggleNext', false)
    this.form = this.$refs.form

    if (!this.supportedProfileTypes.includes(this.currentAccount.type)) {
      this.wizardStepsItems = ['ACCOUNT_LINK']
    }
  }
}
