const bindings = require('../index.node');

export function readAsset(mimeType: string, buffer: Buffer) {
  return bindings.read_asset(mimeType, buffer);
}
