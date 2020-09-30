import { Vue, Component } from 'vue-property-decorator'
// @ts-ignore
import { ValidationRuleset } from '@/core/validation/ValidationRuleset'
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue'
import { Account, Password, NetworkType } from 'symbol-sdk'
import { mapGetters } from 'vuex'
// @ts-ignore
import { AccountModel } from '@/core/database/entities/AccountModel'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue'
// @ts-ignore
import { NotificationType } from '@/core/utils/NotificationType'
// @ts-ignore
import { AccountService } from '@/services/AccountService'
import { ProfileModel } from '@/core/database/entities/ProfileModel'
import { ProfileService } from '@/services/ProfileService'
@Component({
  components: {
    FormRow,
    ValidationObserver,
    ValidationProvider,
    ErrorTooltip,
  },
  computed: {
    ...mapGetters({
      currentProfile: 'profile/currentProfile',
      currentPassword: 'temporary/password',
    }),
  },
})
export default class InputPrivateKeyTs extends Vue {
  /**
   * Type the ValidationObserver refs
   * @type {{
   *     observer: InstanceType<typeof ValidationObserver>
   *   }}
   */
  public $refs!: {
    observer: InstanceType<typeof ValidationObserver>
  }

  public validationRules = ValidationRuleset
  public currentProfile: ProfileModel
  public privateKey: string = ''
  public get account(): Account {
    if (
      !this.privateKey ||
      0 !== this.privateKey.length % 2 ||
      (this.$refs.observer.fields.privateKey && this.$refs.observer.fields.privateKey.invalid)
    ) {
      return null
    }
    return Account.createFromPrivateKey(this.privateKey, this.currentProfile.networkType)
  }
  public get publicKey() {
    return this.account ? this.account.publicKey : ''
  }
  public get address() {
    return this.account ? this.account.address.pretty() : ''
  }
  public get accountNetwork(): string {
    return this.account ? NetworkType[this.account.networkType] : ''
  }
  public get currentProfileNetwork(): string {
    return NetworkType[this.currentProfile.networkType]
  }
  public async createAccountByPrivate() {
    const profileService = new ProfileService()
    const accountService = new AccountService()

    let newAccount: AccountModel
    const password = new Password(this.currentProfile.password)
    try {
      // create a AccountModel
      newAccount = accountService.getSubAccountByPrivateKey(
        this.currentProfile,
        password,
        'Private key account',
        this.privateKey,
        this.account.networkType,
      )
      // console.log(newAccount)
      // return if undefined
      if (!newAccount) {
        return
      }

      // persistent storage
      accountService.saveAccount(newAccount)
      profileService.updatePassword(
        this.currentProfile,
        ProfileService.getPasswordHash(password),
        this.currentProfile.hint,
        this.currentProfile.seed,
      )
      //  update  state
      await this.$store.dispatch('profile/ADD_ACCOUNT', newAccount)
      await this.$store.dispatch('profile/SET_CURRENT_PROFILE', this.currentProfile)
      await this.$store.dispatch('account/SET_CURRENT_ACCOUNT', newAccount)
      this.$store.dispatch('account/SET_KNOWN_ACCOUNTS', this.currentProfile.accounts)
      // execute store actions
      this.$store.dispatch('temporary/RESET_STATE')
      this.$store.dispatch('notification/ADD_SUCCESS', NotificationType.OPERATION_SUCCESS)
      this.$store.dispatch(
        'diagnostic/ADD_DEBUG',
        `Profile login successful with profileName: ${this.currentProfile.profileName}`,
      )
      // redirect
      return this.$router.push({ name: 'profiles.importPrivateKey.finalize' })
    } catch (e) {
      this.$store.dispatch('notification/ADD_ERROR', 'An error happened, please try again.')
      console.error(e)
    }
  }
}
