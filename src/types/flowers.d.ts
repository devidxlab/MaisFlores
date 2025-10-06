declare module '*.json' {
  const value: {
    flowers: Array<{
      id: number;
      name: string;
      price: number;
      image_url: string | null;
    }>;
  };
  export default value;
} 