export {};

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: "sandbox" | "production") => void };
      Initialize: (options: {
        token: string;
        eventCallback?: (event: { name: string; data?: any }) => void;
      }) => void;
      Checkout: {
        open: (options: {
          items: { priceId: string; quantity: number }[];
          customData?: Record<string, any>;
          settings?: { displayMode?: "overlay" | "inline"; theme?: "light" | "dark" };
        }) => void;
      };
    };
  }
}
