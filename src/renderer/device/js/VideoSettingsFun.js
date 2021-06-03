import { utf8ByteArrayToString, stringToUtf8ByteArray } from './Util'
export default {
  fromBuffer(buffer) {
    let offset = 0
    const bitrate = buffer.readInt32BE(offset)
    offset += 4
    const maxFps = buffer.readInt32BE(offset)
    offset += 4
    const iFrameInterval = buffer.readInt8(offset)
    offset += 1
    const width = buffer.readInt16BE(offset)
    offset += 2
    const height = buffer.readInt16BE(offset)
    offset += 2
    const left = buffer.readInt16BE(offset)
    offset += 2
    const top = buffer.readInt16BE(offset)
    offset += 2
    const right = buffer.readInt16BE(offset)
    offset += 2
    const bottom = buffer.readInt16BE(offset)
    offset += 2
    const sendFrameMeta = !!buffer.readInt8(offset)
    offset += 1
    const lockedVideoOrientation = buffer.readInt8(offset)
    offset += 1
    const displayId = buffer.readInt32BE(offset)
    offset += 4

    let bounds = null
    let crop = null
    if (width !== 0 && height !== 0) {
      bounds = { width: width, height: height, w: width, h: height }
    }
    if (left || top || right || bottom) {
      crop = { left, top, right, bottom }
    }

    let codecOptions
    let encoderName
    const codecOptionsLength = buffer.readInt32BE(offset)
    offset += 4
    if (codecOptionsLength) {
      const codecOptionsBytes = buffer.slice(offset, offset + codecOptionsLength)
      offset += codecOptionsLength
      codecOptions = utf8ByteArrayToString(codecOptionsBytes)
    }
    const encoderNameLength = buffer.readInt32BE(offset)
    offset += 4
    if (encoderNameLength) {
      const encoderNameBytes = buffer.slice(offset, offset + encoderNameLength)
      offset += encoderNameLength
      encoderName = utf8ByteArrayToString(encoderNameBytes)
    }

    return {
      bitrate: bitrate,
      bounds: bounds,
      bytesLength: offset,
      crop: crop,
      iFrameInterval: iFrameInterval,
      lockedVideoOrientation: lockedVideoOrientation,
      maxFps: maxFps,
      sendFrameMeta: sendFrameMeta,
      codecOptions: codecOptions,
      encoderName: encoderName,
      displayId: displayId
    }
  },
  toBuffer(setting) {
    let additionalLength = 0
    let codecOptionsBytes
    let encoderNameBytes

    if (setting.codecOptions) {
      codecOptionsBytes = stringToUtf8ByteArray(setting.codecOptions)
      additionalLength += codecOptionsBytes.length
    }

    if (setting.encoderName) {
      encoderNameBytes = stringToUtf8ByteArray(setting.encoderName)
      additionalLength += encoderNameBytes.length
    }

    const buffer = new Buffer(35 + additionalLength)
    const { width = 0, height = 0 } = setting.bounds || {}
    const { left = 0, top = 0, right = 0, bottom = 0 } = setting.crop || {}
    let offset = 0
    offset = buffer.writeInt32BE(setting.bitrate, offset)
    offset = buffer.writeInt32BE(setting.maxFps, offset)
    offset = buffer.writeInt8(setting.iFrameInterval, offset)
    offset = buffer.writeInt16BE(width, offset)
    offset = buffer.writeInt16BE(height, offset)
    offset = buffer.writeInt16BE(left, offset)
    offset = buffer.writeInt16BE(top, offset)
    offset = buffer.writeInt16BE(right, offset)
    offset = buffer.writeInt16BE(bottom, offset)
    offset = buffer.writeInt8(setting.sendFrameMeta ? 1 : 0, offset)
    offset = buffer.writeInt8(setting.lockedVideoOrientation, offset)
    offset = buffer.writeInt32BE(setting.displayId, offset)
    if (codecOptionsBytes) {
      offset = buffer.writeInt32BE(codecOptionsBytes.length, offset)
      buffer.fill(codecOptionsBytes, offset)
      offset += codecOptionsBytes.length
    } else {
      offset = buffer.writeInt32BE(0, offset)
    }
    if (encoderNameBytes) {
      offset = buffer.writeInt32BE(encoderNameBytes.length, offset)
      buffer.fill(encoderNameBytes, offset)
      offset += encoderNameBytes.length
    } else {
      buffer.writeInt32BE(0, offset)
    }
    return buffer
  }
}
