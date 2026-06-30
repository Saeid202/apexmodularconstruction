export type AnchorType = 'door' | 'window' | 'wall-mask';

export interface HouseAnchor {
  id?: string;
  house_id: string;
  anchor_type: AnchorType;
  label: string;
  mask_url?: string; // Only for wall-mask type
  metadata?: Record<string, any>;
  x_pos: number; // 0-100
  y_pos: number; // 0-100
  width: number; // 0-100
  height: number; // 0-100
  z_index: number;
}

export interface HouseConfiguratorSettings {
  id: string;
  product_id: string;
  base_image_url: string;
  lighting_metadata: {
    sun_direction: string;
    ambient: string;
  };
  anchors: HouseAnchor[];
}

export interface AllowedProduct {
  id: string;
  anchor_id: string;
  product_id: string;
  is_default: boolean;
  display_order: number;
  // Join fields
  product?: {
    name: string;
    image_url?: string;
    price: number;
  };
}
