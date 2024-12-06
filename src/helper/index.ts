import type { AssetSignature, SignatureEvent } from '..';

export const createFileInfo = (
  nativeEvent: SignatureEvent['nativeEvent']
): AssetSignature => ({
  path: nativeEvent.path || '',
  uri: nativeEvent.uri ? `file://${nativeEvent.uri}` : '',
  name: nativeEvent.name || '',
  size: nativeEvent.size || 0,
  width: nativeEvent.width || 940,
  height: nativeEvent.height || 788,
});
