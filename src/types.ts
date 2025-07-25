export interface JapanFeatureProperties {
  GID_1: string;
  GID_0: string;
  COUNTRY: string;
  NAME_1: string;
  VARNAME_1?: string;
  NL_NAME_1: string;
  TYPE_1: string;
  ENGTYPE_1: string;
  CC_1: string;
  HASC_1: string;
  ISO_1: string;
  // Legacy properties for backward compatibility
  name?: string;
  name_ja?: string;
  type?: string;
  population?: number;
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
  population?: number;
  capital?: string;
  image?: string;
}