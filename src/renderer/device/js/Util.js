export function stringToUtf8ByteArray(str) {
  // TODO(user): Use native implementations if/when available
  var out = []; var p = 0
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i)
    if (c < 128) {
      out[p++] = c
    } else if (c < 2048) {
      out[p++] = (c >> 6) | 192
      out[p++] = (c & 63) | 128
    } else if (
      ((c & 0xFC00) === 0xD800) && (i + 1) < str.length &&
                ((str.charCodeAt(i + 1) & 0xFC00) === 0xDC00)) {
      // Surrogate Pair
      c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF)
      out[p++] = (c >> 18) | 240
      out[p++] = ((c >> 12) & 63) | 128
      out[p++] = ((c >> 6) & 63) | 128
      out[p++] = (c & 63) | 128
    } else {
      out[p++] = (c >> 12) | 224
      out[p++] = ((c >> 6) & 63) | 128
      out[p++] = (c & 63) | 128
    }
  }
  return Uint8Array.from(out)
}

export function utf8ByteArrayToString(bytes) {
  // TODO(user): Use native implementations if/when available
  var out = []; var pos = 0; var c = 0
  while (pos < bytes.length) {
    var c1 = bytes[pos++]
    if (c1 < 128) {
      out[c++] = String.fromCharCode(c1)
    } else if (c1 > 191 && c1 < 224) {
      var c2 = bytes[pos++]
      out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63)
    } else if (c1 > 239 && c1 < 365) {
      // Surrogate Pair
      c2 = bytes[pos++]
      var c3 = bytes[pos++]
      var c4 = bytes[pos++]
      var u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) -
                      0x10000
      out[c++] = String.fromCharCode(0xD800 + (u >> 10))
      out[c++] = String.fromCharCode(0xDC00 + (u & 1023))
    } else {
      c2 = bytes[pos++]
      c3 = bytes[pos++]
      out[c++] =
                      String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63)
    }
  }
  return out.join('')
}
