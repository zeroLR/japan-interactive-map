export interface JapanFeatureProperties {
  names_1_20: string;
  code_1_20: number;
}

export interface JapanFeature extends GeoJSON.Feature {
  properties: JapanFeatureProperties;
  geometry: GeoJSON.Polygon;
  id: number;
}

export interface JapanGeoJSON extends GeoJSON.FeatureCollection {
  features: JapanFeature[];
}

export interface TooltipData {
  name: string;
  code: number;
}