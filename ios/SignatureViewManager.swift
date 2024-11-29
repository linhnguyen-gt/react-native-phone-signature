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

    static func propConfig(for viewName: String!) -> [String: Any]! {
        return [
            "strokeWidth": ["CGFloat", "setStrokeWidth"],
            "showBaseline": ["BOOL", "setShowBaseline"],
            "signatureColor": ["NSString", "setSignatureColor"],
            "isSaveToLibrary": ["BOOL"],
            "outputFormat": ["NSString"]
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
        print("Save command received for node:", node)
        DispatchQueue.main.async {
            if let view = self.bridge?.uiManager.view(forReactTag: node) as? SignatureView {
                if let image = view.saveToImage() {
                    let outputFormat = view.outputFormat ?? "JPEG"
                    let fileExt = outputFormat == "PNG" ? "png" : "jpg"
                    let fileName = "signature_\(Int(Date().timeIntervalSince1970)).\(fileExt)"

                    print("Generated fileName:", fileName)

                    let isSaveToLibrary = view.isSaveToLibrary

                    if isSaveToLibrary {
                        self.saveToPhotos(image: image, fileName: fileName, view: view, outputFormat: outputFormat)
                    } else {
                        self.saveToTemp(image: image, fileName: fileName, view: view, outputFormat: outputFormat)
                    }
                }
            }
        }
    }

    private func saveToPhotos(image: UIImage, fileName: String, view: SignatureView, outputFormat: String) {
        print("Saving to photos with fileName:", fileName)
        PHPhotoLibrary.requestAuthorization { status in
            if status == .authorized {
                PHPhotoLibrary.shared().performChanges({
                    PHAssetChangeRequest.creationRequestForAsset(from: image)
                }) { success, error in
                    if success {
                        let imageData: Data?
                        if outputFormat == "PNG" {
                            imageData = image.pngData()
                        } else {
                            imageData = image.jpegData(compressionQuality: 0.8)
                        }

                        if let imageData = imageData {
                            let tempPath = NSTemporaryDirectory().appending(fileName)
                            try? imageData.write(to: URL(fileURLWithPath: tempPath))

                            DispatchQueue.main.async {
                                print("Photo saved successfully")
                                let eventData: [String: Any] = [
                                    "path": tempPath,
                                    "name": fileName,
                                    "uri": tempPath,
                                    "width": image.size.width,
                                    "height": image.size.height,
                                    "size": imageData.count
                                ]
                                print("Sending event data:", eventData)
                                view.emitSaveEvent(eventData)
                            }
                        }
                    } else if let error = error {
                        print("Error saving photo:", error)
                    }
                }
            }
        }
    }

    private func saveToTemp(image: UIImage, fileName: String, view: SignatureView, outputFormat: String) {
        print("Saving to temp with fileName:", fileName)
        let imageData: Data?
        if outputFormat == "PNG" {
            imageData = image.pngData()
        } else {
            imageData = image.jpegData(compressionQuality: 0.8)
        }

        if let imageData = imageData {
            let tempPath = NSTemporaryDirectory().appending(fileName)
            try? imageData.write(to: URL(fileURLWithPath: tempPath))

            DispatchQueue.main.async {
                print("Temp file saved")
                let eventData: [String: Any] = [
                    "path": tempPath,
                    "name": fileName,
                    "uri": tempPath,
                    "width": image.size.width,
                    "height": image.size.height,
                    "size": imageData.count
                ]
                print("Sending event data:", eventData)
                view.emitSaveEvent(eventData)
            }
        }
    }
}
