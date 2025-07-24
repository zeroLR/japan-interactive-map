export interface JapanFeatureProperties {
  name: string;
  name_ja: string;
  type: string;
  population: number;
  capital?: string;
  image?: string;
}

export interface JapanFeature extends GeoJSON.Feature {
  properties: JapanFeatureProperties;
  geometry: GeoJSON.Polygon;
}

export interface JapanGeoJSON extends GeoJSON.FeatureCollection {
  features: JapanFeature[];
}

export interface TooltipData {
  name: string;
  name_ja: string;
  type: string;
  population: number;
  capital?: string;
  image?: string;
}