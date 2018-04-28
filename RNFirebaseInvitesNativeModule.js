//  Created by react-native-create-bridge

import { NativeModules } from 'react-native'

const { RNFirebaseInvites } = NativeModules

export default {
  exampleMethod () {
    return RNFirebaseInvites.exampleMethod()
  },

  EXAMPLE_CONSTANT: RNFirebaseInvites.EXAMPLE_CONSTANT
}
