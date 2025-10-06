export interface Database {
  public: {
    Tables: {
      flowers: {
        Row: {
          id: number;
          name: string;
          price: number;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          price: number;
          image_url?: string | null;
        };
        Update: {
          name?: string;
          price?: number;
          image_url?: string | null;
        };
      };
    };
  };
}