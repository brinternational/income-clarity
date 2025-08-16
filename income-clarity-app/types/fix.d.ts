// Type declarations to fix common errors

declare module 'react-joyride' {
  const Joyride: any;
  export default Joyride;
  export type Step = any;
  export type CallBackProps = any;
  export const STATUS: any;
  export const EVENTS: any;
}

// Add global type extensions
declare global {
  interface Number {
    [key: string]: any;
  }
}