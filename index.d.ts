import { ForwardRefExoticComponent, RefAttributes } from 'react';

export type AssetSignature = {
  path: string;
  uri: string;
  size: number;
  name: string;
  width: number;
  height: number;
};

export type SignaturePadProps = {
  onSave?: (file: AssetSignature) => void;
  onClear?: () => void;
  onError?: () => void;
  backgroundColorButton?: string;
  isSaveToLibrary?: boolean;
  lineWidth?: number;
  showBaseline?: boolean;
  signatureColor?: string;
  outputFormat?: 'JPEG' | 'PNG';
  presentationStyle?: 'modal' | 'signature-pad';
  closeAfterSave?: boolean;
};

export type SignaturePadRef = {
  open: () => void;
  close: () => void;
  onClear: () => void;
  onSave: () => void;
};

declare const SignaturePad: ForwardRefExoticComponent<
  SignaturePadProps & RefAttributes<SignaturePadRef>
>;

export default SignaturePad;
