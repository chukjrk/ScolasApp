import { observable, autorun } from 'mobx'

class AppStore {
  @observable username = ''
  @observable user = {}
  @observable post_count = 0
  @observable order_count = 0
  @observable chat_count = 0
  @observable new_messages = 0
  @observable current_page = ''
  @observable current_puid = ''
  @observable uid = ''   //added
  @observable user_point = 0   //added
  @observable device_id = ''   //added
  @observable seller_uid = ''   //added
  @observable address = ''
  @observable firstname = ''
  @observable lastname = ''
  @observable zip = ''
  @observable aptno = ''
  @observable city = ''
  @observable state_us = ''
  @observable phone_number = ''
  @observable ssn_last_4 = ''
  @observable dob_day = ''
  @observable dob_month = ''
  @observable dob_year = ''
  @observable buttoncheck = false
}

const appStore = new AppStore()

/*
autorun(() => {
  console.log(appStore)
})
*/

export default appStore
