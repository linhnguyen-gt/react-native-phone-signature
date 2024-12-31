<h1 align="center">
  React Native Phone Signature
</h1>

<p align="center">
  A powerful React Native library for capturing signatures with a smooth drawing experience and multiple presentation styles.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@linhnguyen96114/react-native-phone-signature">
    <img src="https://img.shields.io/npm/v/@linhnguyen96114/react-native-phone-signature.svg" alt="npm version">
  </a>
  <img src="https://img.shields.io/badge/platforms-android%20|%20ios-lightgrey.svg" alt="platforms">
  <img src="https://img.shields.io/github/license/linhnguyen-gt/react-native-phone-signature" alt="license">
</p>

<div align="center">
  <div style="display: flex; justify-content: center; gap: 20px; margin: 40px 0;">
    <img src="https://raw.githubusercontent.com/linhnguyen-gt/react-native-phone-signature/main/image/demo1.png" width="260" alt="Bottom Sheet" />
    &nbsp;&nbsp;&nbsp;&nbsp;
    <img src="https://raw.githubusercontent.com/linhnguyen-gt/react-native-phone-signature/main/image/demo2.png" width="260" alt="Modal" />
    &nbsp;&nbsp;&nbsp;&nbsp;
    <img src="https://raw.githubusercontent.com/linhnguyen-gt/react-native-phone-signature/main/image/demo3.png" width="260" alt="Custom Signature Pad" />
  </div>
</div>

<p align="center">
  <i>Left to right: Bottom Sheet, Modal, and Custom Signature Pad presentation styles</i>
</p>

## ✨ Features

- 🎨 **Smooth Drawing** - High performance native implementation for fluid signature capture
- 📱 **Multiple Styles** - Bottom Sheet, Modal, and Custom Signature Pad presentation options
- 💾 **Flexible Export** - Save as JPEG or PNG with customizable quality
- 📲 **Gallery Integration** - Optional auto-save to device gallery
- 🎯 **Highly Customizable** - Customize colors, stroke width, and more
- 🔄 **Simple Controls** - Easy to implement clear and reset functionality
- 📏 **Baseline Guide** - Optional guide line for consistent signatures
- ⚡️ **Performance Focused** - Optimized for smooth drawing experience
- 🛠 **Easy Integration** - Simple API with TypeScript support

## 📦 Installation

```bash
# Using npm
npm install @linhnguyen96114/react-native-phone-signature

# Using Yarn
yarn add @linhnguyen96114/react-native-phone-signature

# Using pnpm
pnpm add @linhnguyen96114/react-native-phone-signature
```

For iOS, run:

```bash
cd ios && pod install
```

### iOS Permissions

Add these keys to your `Info.plist` file to enable photo library access for saving signatures:

```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>This app needs permission to save your signature as an image to your photo library. Your signature will only be saved when you explicitly choose to save it.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs permission to save your signature as an image to your photo library. Your signature will only be saved when you explicitly choose to save it.</string>
```

## 🚀 Quick Start

```typescript
import SignaturePad from 'react-native-phone-signature';

const App = () => {
  const signaturePadRef = React.useRef(null);

  return (
    <SignaturePad
      ref={signaturePadRef}
      onSave={(file) => console.log('Signature saved:', file)}
      onClear={() => console.log('Signature cleared')}
      onError={() => console.log('Error: No signature to save')}
    />
  );
};
```

## 🎯 Usage

### Presentation Styles

#### 1. Bottom Sheet (Default)

```typescript
<SignaturePad
  showBaseline={true}
  signatureColor="black"
/>
```

#### 2. Modal

```typescript
<SignaturePad
  presentationStyle="modal"
  isSaveToLibrary={true}
  closeAfterSave={true}
/>
```

#### 3. Custom Signature Pad

```typescript
<View style={{ flex: 1 }}>
  <SignaturePad
    presentationStyle="signature-pad"
    lineWidth={2}
    signatureColor="blue"
  />
</View>
```

## 📋 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSave` | `(file: AssetSignature) => void` | - | Callback when signature is saved |
| `onClear` | `() => void` | - | Callback when signature is cleared |
| `onError` | `() => void` | - | Callback when error occurs |
| `backgroundColorButton` | `string` | #0066FF | Background color for buttons |
| `isSaveToLibrary` | `boolean` | `false` | Auto-save to gallery |
| `lineWidth` | `number` | `2` | Signature stroke width |
| `showBaseline` | `boolean` | `false` | Show baseline guide |
| `signatureColor` | `string` | 'black' | Signature color |
| `outputFormat` | `'JPEG' \| 'PNG'` | 'PNG' | Output image format |
| `presentationStyle` | `'modal' \| 'signature-pad'` | - | Display style |
| `closeAfterSave` | `boolean` | `true` | Auto-close after saving |

## 📱 AssetSignature Type

```typescript
type AssetSignature = {
  path: string;    // File path
  uri: string;     // File URI
  size: number;    // File size in bytes
  name: string;    // File name
  width: number;   // Image width
  height: number;  // Image height
};
```

## 🛠 Methods

```typescript
const signaturePadRef = React.useRef<SignaturePadRef>(null);

// Open signature pad
signaturePadRef.current?.open();

// Save signature
signaturePadRef.current?.onSave();

// Clear signature
signaturePadRef.current?.onClear();
```

## 🤝 Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## 📄 License

MIT © [linhnguyen-gt](https://github.com/linhnguyen-gt)

---

<p align="center">
  Made with ❤️ by linhnguyen-gt
</p>
