const convertToFormData = function (
  obj,
  formData = new FormData(),
  namespace = "",
) {
  for (const property in obj) {
    if (!obj.hasOwnProperty(property)) {
      continue;
    }
    const formKey = namespace ? `${namespace}[${property}]` : property;
    console.log("key", formKey, "value", obj[property]);
    if (obj[property] instanceof Date) {
      formData.append(formKey, obj[property].toISOString());
    } else if (
      typeof obj[property] === "object" &&
      !(obj[property] instanceof File)
    ) {
      convertToFormData(obj[property], formData, formKey);
    } else {
      formData.append(formKey, obj[property]);
    }
  }
  return formData;
};
export default convertToFormData;
