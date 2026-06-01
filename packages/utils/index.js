/**
 * 
 * @param {string} snakeCaseString snake_case string to convert to camelCase
 * @returns {string}
 * @description Convert a snake_case string to camelCase
 */
export function snakeToCamel(snakeCaseString) {
    return snakeCaseString.split("_").map((word, i) => i === 0 ? word.toLowerCase() : word.toLowerCase().split('').map((ch, j) => j === 0 ? ch.toUpperCase() : ch).join('')).join('')
}

/**
 * @param {string} kebabString kebab-case string to convert to camelCase
 * @returns {string} kebab-case string converted to camelCase
 * @description Convert a kebab-case string to camelCase
 */
export function kebabToCamel(kebabString) {
    return kebabString.split('-').map((word, i) => i === 0 ? word : word.split('').map((ch, j) => j === 0 ? ch.toUpperCase() : ch).join('')).join('')
}

/**
 * 
 * @param {string} string string to convert to snake_case
 * @returns {string}
 */
export function toSnake(anyString) {
    return anyString.match(/[a-z]+|[A-Z][a-z]+/g).map(word => word.toLowerCase()).join("_")
}