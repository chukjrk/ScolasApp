package com.booxchange;

import android.app.Application;

import com.facebook.react.ReactApplication;
import io.branch.rnbranch.RNBranchPackage;
import io.branch.referral.Branch;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.geektime.rnonesignalandroid.ReactNativeOneSignalPackage;
import com.imagepicker.ImagePickerPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.jamesisaac.rnbackgroundtask.BackgroundTaskPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNBranchPackage(),
            new ReactNativePushNotificationPackage(),
            new VectorIconsPackage(),
            new ReactNativeOneSignalPackage(),
            new ImagePickerPackage(),
            new RNFetchBlobPackage(),
            new BackgroundTaskPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    BackgroundTaskPackage.useContext(this);
    Branch.getAutoInstance(this);
  }

  // added due to googleappinvites for activity class
  // @Override
  // protected void onActivityResult(int requestCode, int resultCode, android.content.Intent data) {
  //     if (requestCode == RNGoogleAppInvitesModule.RC_APP_INVITES_IN) {
  //         RNGoogleAppInvitesModule.onActivityResult(resultCode, data);
  //     }
  //     // super.onActivityResult(requestCode, resultCode, data);
  // }

}
