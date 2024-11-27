const PhoneSignature = require('./NativePhoneSignature').default;

export function multiply(a: number, b: number): number {
  return PhoneSignature.multiply(a, b);
}
