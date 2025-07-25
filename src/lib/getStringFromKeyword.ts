export const getStringFromKeyword = (
  originalString: string,
  keyword: string,
) => {
  const startIndex = originalString.indexOf(keyword)

  if (startIndex === -1) {
    return null
  }

  return originalString.substring(startIndex)
}
