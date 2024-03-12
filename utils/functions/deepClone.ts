// function deepClone(obj) {
//     // Handle non-object types and null
//     if (obj === null || typeof obj !== 'object') {
//         return obj;
//     }

//     // Create a new object or array to hold the cloned properties
//     const clone = Array.isArray(obj) ? [] : {};

//     // Recursively clone each property
//     for (let key in obj) {
//         if (obj.hasOwnProperty(key)) {
//             clone[key] = deepClone(obj[key]);
//         }
//     }

//     return clone;
// }

// Record<K, T>: This is a predefined TS utility type; it creates an object type whose keys are of type K and whose values are of type T.
export default function deepClone<T extends Record<string, any>>(obj: T): T {
  // Handle non-object types and null
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Create a new object or array to hold the cloned properties
  const clone = Array.isArray(obj) ? ([] as any) : ({} as T);

  // Recursively clone each property
  for (const key in obj) {
    // if (Object.prototype.hasOwnProperty.call(obj, key)) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }

  return clone;
}
