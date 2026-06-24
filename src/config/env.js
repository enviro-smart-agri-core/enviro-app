

export const ENV = {

  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://51.21.241.218'),

  IS_DEV: import.meta.env.DEV,

}
