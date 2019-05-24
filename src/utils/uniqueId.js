function uniqueId (salt = '', randomLength = 8) {
  return salt + Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36)
}
export default uniqueId
