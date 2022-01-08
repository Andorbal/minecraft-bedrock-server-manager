/** Convert a string to snake case
 * @param value {string} Value to convert
 * @returns snake case version of the string
 */
export default (value) =>
  value
    .replace(/\W+/g, " ")
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join("_");
