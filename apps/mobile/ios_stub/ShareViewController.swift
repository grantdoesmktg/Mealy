//
//  ShareViewController.swift
//  ShareExtension
//
//  Created for Mealy.
//

import UIKit
import Social
import MobileCoreServices

class ShareViewController: SLComposeServiceViewController {

    override func isContentValid() -> Bool {
        // Do validation of contentText and/or NSExtensionContext attachments here
        return true
    }

    override func didSelectPost() {
        // This is called after the user selects Post. Do the upload of contentText and/or NSExtensionContext attachments.
        
        // In a real implementation:
        // 1. Extract URL from extensionContext
        // 2. Open main app via Deep Link
        
        if let item = extensionContext?.inputItems.first as? NSExtensionItem,
           let attachment = item.attachments?.first {
            
            if attachment.hasItemConformingToTypeIdentifier(kUTTypeURL as String) {
                attachment.loadItem(forTypeIdentifier: kUTTypeURL as String, options: nil) { (url, error) in
                    if let shareURL = url as? URL {
                        self.openMainApp(with: shareURL)
                    }
                }
            }
        }
        
        // Inform the host that we're done, so it un-blocks its UI. Note: Alternatively you could call super's -didSelectPost, which will similarly complete the extension context.
        self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
    }

    override func configurationItems() -> [Any]! {
        // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
        return []
    }
    
    func openMainApp(with url: URL) {
        // Deep link to Mealy app
        // Scheme: mealy://share?url=...
        
        let customURL = "mealy://share?url=\(url.absoluteString)"
        
        if let targetURL = URL(string: customURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!) {
            var responder: UIResponder? = self
            while responder != nil {
                if let application = responder as? UIApplication {
                    application.open(targetURL, options: [:], completionHandler: nil)
                    break
                }
                responder = responder?.next
            }
        }
    }
}
