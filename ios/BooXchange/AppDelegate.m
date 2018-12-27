/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

//#import <react-native-branch/RNBranch.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTPushNotificationManager.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import "RCTLinkingManager.h"

//---added Firebase import and [FIRApp configure]; for the react-native-firebase package not needed for general firebase-----
//#import <Firebase.h>
//---------------------------------------------------------------------------------------------------------------------------

@implementation AppDelegate
@synthesize oneSignal = _oneSignal;

- (void)applicationDidBecomeActive:(UIApplication *)application {
  [FBSDKAppEvents activateApp];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
//  [FIRApp configure];
  
//  // Uncomment this line to use the test key instead of the live one.
//  // [RNBranch useTestInstance]
//  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];

  NSURL *jsCodeLocation;

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  
  self.oneSignal = [[RCTOneSignal alloc] initWithLaunchOptions:launchOptions
                                                         appId:@"e09d00d9-b019-471d-ab1a-17ada2fdcda2"];
  
  // For requiring push notification permissions manually.
  self.oneSignal = [[RCTOneSignal alloc] initWithLaunchOptions:launchOptions
                                                         appId:@"e09d00d9-b019-471d-ab1a-17ada2fdcda2"
                                                      settings:@{kOSSettingsKeyAutoPrompt: @false}];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"BooXchange"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  return YES;
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
  
//  if (![RNBranch.branch application:application openURL:url sourceApplication:sourceApplication annotation:annotation]) {
    // do other deep link routing for the Facebook SDK, Pinterest SDK, etc
    BOOL handledFB = [[FBSDKApplicationDelegate sharedInstance] application:application
                                                                    openURL:url
                                                          sourceApplication:sourceApplication
                                                                 annotation:annotation];
    
    BOOL handledRCT = [RCTLinkingManager application:application openURL:url sourceApplication:sourceApplication annotation:annotation];
    return handledFB | handledRCT;
//  }
  
//  return YES;
}

//- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray *restorableObjects))restorationHandler {
//  return [RNBranch continueUserActivity:userActivity];
//}

@end
