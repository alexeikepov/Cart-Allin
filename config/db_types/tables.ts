// define Json as any to avoid type errors
export type Json = any // string | number | boolean | null | { [key: string]: Json } | Json[]

// --------------------------------------------------
// Tables
// --------------------------------------------------

export interface User {
  id: number
  firstName: string
  lastName: string | null
}
