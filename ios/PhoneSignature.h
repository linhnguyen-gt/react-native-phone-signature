
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNPhoneSignatureSpec.h"

@interface PhoneSignature : NSObject <NativePhoneSignatureSpec>
#else
#import <React/RCTBridgeModule.h>

@interface PhoneSignature : NSObject <RCTBridgeModule>
#endif

@end
