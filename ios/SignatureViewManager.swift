import Photos

@objc(RNSignatureViewManager)
class RNSignatureViewManager: RCTViewManager {
    override func view() -> UIView! {
        return SignatureView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override class func moduleName() -> String! {
        return "RNSignatureView"
    }

    override func constantsToExport() -> [AnyHashable : Any]! {
        return [
            "Commands": [
                "clear": "clear",
                "save": "save"
            ]
        ]
    }

    @objc func clear(_ node: NSNumber) {
        print("Clear command received for node:", node)
        DispatchQueue.main.async {
            if let view = self.bridge?.uiManager.view(forReactTag: node) as? SignatureView {
                view.clear()
            }
        }
    }

    @objc func save(_ node: NSNumber) {
        DispatchQueue.main.async {
            if let view = self.bridge?.uiManager.view(forReactTag: node) as? SignatureView {
                if let image = view.saveToImage() {
                    let fileName = "signature_\(Int(Date().timeIntervalSince1970)).jpg"
                    let isSaveToLibrary = view.isSaveToLibrary

                    if isSaveToLibrary {
                        self.saveToPhotos(image: image, fileName: fileName, node: node)
                    } else {
                        self.saveToTemp(image: image, fileName: fileName, node: node)
                    }
                }
            }
        }
    }

    private func saveToPhotos(image: UIImage, fileName: String, node: NSNumber) {
        PHPhotoLibrary.requestAuthorization { status in
            if status == .authorized {
                PHPhotoLibrary.shared().performChanges({
                    PHAssetChangeRequest.creationRequestForAsset(from: image)
                }) { success, error in
                    if success {
                        if let imageData = image.jpegData(compressionQuality: 0.8) {
                            let tempPath = NSTemporaryDirectory().appending(fileName)
                            try? imageData.write(to: URL(fileURLWithPath: tempPath))

                            DispatchQueue.main.async {
                                self.sendEvent(withName: "onSave", body: [
                                    "path": tempPath,
                                    "name": fileName,
                                    "uri": tempPath,
                                    "width": image.size.width,
                                    "height": image.size.height,
                                    "size": imageData.count
                                ], reactTag: node)
                            }
                        }
                    }
                }
            }
        }
    }

    private func saveToTemp(image: UIImage, fileName: String, node: NSNumber) {
        if let imageData = image.jpegData(compressionQuality: 0.8) {
            let tempPath = NSTemporaryDirectory().appending(fileName)
            try? imageData.write(to: URL(fileURLWithPath: tempPath))

            DispatchQueue.main.async {
                self.sendEvent(withName: "onSave", body: [
                    "path": tempPath,
                    "name": fileName,
                    "uri": tempPath,
                    "width": image.size.width,
                    "height": image.size.height,
                    "size": imageData.count
                ], reactTag: node)
            }
        }
    }

    private func sendEvent(withName name: String, body: [String: Any], reactTag: NSNumber) {
        if let uiManager = self.bridge?.module(for: RCTUIManager.self) as? RCTUIManager,
           let view = uiManager.view(forReactTag: reactTag) as? SignatureView {
            view.onSave?(["nativeEvent": body as Any])
        }
    }
}
