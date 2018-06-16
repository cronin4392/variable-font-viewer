const newLine = `
`;

const fontVariationSettings = (param1, param2) => `
.your-selector {
  /* CSS3 */
  font-variation-settings: ${param1};
  /* CSS4 */
${Object.keys(param2).reduce((output, value) => {
  return output + `  ${value}: ${param2[value]};${newLine}`;
}, "")}}
`.trim();

export default {
  fontVariationSettings,
  newLine,
};
