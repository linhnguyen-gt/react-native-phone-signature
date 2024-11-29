#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTComponent.h>

@interface RCT_EXTERN_MODULE(RNSignatureViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(strokeWidth, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(showBaseline, BOOL)
RCT_EXPORT_VIEW_PROPERTY(signatureColor, NSString)
RCT_EXPORT_VIEW_PROPERTY(outputFormat, NSString)
RCT_EXPORT_VIEW_PROPERTY(isSaveToLibrary, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onSave, RCTDirectEventBlock)

RCT_EXTERN_METHOD(clear:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(save:(nonnull NSNumber *)node)

@end
