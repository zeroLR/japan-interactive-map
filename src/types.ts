export interface JapanFeatureProperties {
  name: string;
  name_ja: string;
  type: 'prefecture' | 'city';
  population: number;
  prefecture?: string; // For cities, which prefecture they belong to
}

export interface JapanFeature extends GeoJSON.Feature {
  properties: JapanFeatureProperties;
  geometry: GeoJSON.Polygon | GeoJSON.Point;
}

export interface JapanGeoJSON extends GeoJSON.FeatureCollection {
  features: JapanFeature[];
}

export interface TooltipData {
  name: string;
  name_ja: string;
  type: string;
  population: number;
  prefecture?: string;
}