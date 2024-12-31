import { ForwardRefExoticComponent, RefAttributes } from 'react';

export type AssetSignature = {
  /** File system path to the saved signature */
  path: string;
  /** File URI of the saved signature */
  uri: string;
  /** File size in bytes */
  size: number;
  /** Filename of the saved signature */
  name: string;
  /** Width of the signature image in pixels */
  width: number;
  /** Height of the signature image in pixels */
  height: number;
};

export type SignaturePadProps = {
  /** Callback when signature is saved successfully */
  onSave?: (file: AssetSignature) => void;
  /** Callback when signature is cleared */
  onClear?: () => void;
  /** Callback when an error occurs during save */
  onError?: () => void;
  /** Background color for action buttons (default: '#0066FF') */
  backgroundColorButton?: string;
  /** Whether to save signature to device gallery (default: false) */
  isSaveToLibrary?: boolean;
  /** Width of signature stroke (default: 2) */
  lineWidth?: number;
  /** Whether to show baseline guide (default: false) */
  showBaseline?: boolean;
  /** Color of signature stroke (default: 'black') */
  signatureColor?: string;
  /** Format of saved signature image (default: 'PNG') */
  outputFormat?: 'JPEG' | 'PNG';
  /** Display style of signature pad */
  presentationStyle?: 'modal' | 'signature-pad';
  /** Whether to close pad after saving (default: true) */
  closeAfterSave?: boolean;
};

export type SignaturePadRef = {
  /** Opens the signature pad */
  open: () => void;
  /** Closes the signature pad */
  close: () => void;
  /** Clears the current signature */
  onClear: () => void;
  /** Saves the current signature */
  onSave: () => void;
};

/**
 * A React Native component for capturing signatures with multiple presentation styles
 *
 * @component
 * @example
 * ```typescript
 * const App = () => {
 *   const signaturePadRef = React.useRef<SignaturePadRef>(null);
 *
 *   return (
 *     <SignaturePad
 *       ref={signaturePadRef}
 *       onSave={(file) => console.log('Signature saved:', file)}
 *       onClear={() => console.log('Signature cleared')}
 *     />
 *   );
 * };
 * ```
 */
declare const SignaturePad: ForwardRefExoticComponent<
  SignaturePadProps & RefAttributes<SignaturePadRef>
>;

export default SignaturePad;
