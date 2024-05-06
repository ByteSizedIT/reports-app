export function extractFormData(formData: FormData) {
  const extractedData: { [key: string]: any } = {};
  formData.forEach((value, key) => {
    extractedData[key] = value;
  });
  return extractedData;
}
