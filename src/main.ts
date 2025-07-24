import * as d3 from 'd3';
import { JapanGeoJSON, JapanFeature, TooltipData } from './types';

class JapanInteractiveMap {
  private svg!: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private container!: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
  private tooltip!: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
  private projection!: d3.GeoProjection;
  private path!: d3.GeoPath;
  private zoom!: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private width!: number;
  private height!: number;
  private data: JapanGeoJSON | null = null;

  constructor() {
    this.initializeElements();
    this.setupProjection();
    this.setupZoom();
    this.setupResponsive();
    this.loadData();
  }

  private initializeElements(): void {
    this.container = d3.select('#map-container');
    this.svg = d3.select('#map');
    this.tooltip = d3.select('#tooltip');

    // Get container dimensions
    const containerNode = this.container.node() as HTMLElement;
    this.width = containerNode.clientWidth;
    this.height = containerNode.clientHeight;

    // Set SVG dimensions
    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('width', '100%')
      .style('height', '100%');
  }

  private setupProjection(): void {
    // Use Mercator projection centered on Japan
    this.projection = d3.geoMercator()
      .center([138, 36]) // Center of Japan approximately
      .scale(1200)
      .translate([this.width / 2, this.height / 2]);

    this.path = d3.geoPath().projection(this.projection);
  }

  private setupZoom(): void {
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        const { transform } = event;
        this.svg.selectAll('path, circle')
          .attr('transform', transform);
      });

    this.svg.call(this.zoom);
  }

  private setupResponsive(): void {
    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  private handleResize(): void {
    const containerNode = this.container.node() as HTMLElement;
    const newWidth = containerNode.clientWidth;
    const newHeight = containerNode.clientHeight;

    if (newWidth !== this.width || newHeight !== this.height) {
      this.width = newWidth;
      this.height = newHeight;

      this.svg
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('viewBox', `0 0 ${this.width} ${this.height}`);

      this.projection
        .translate([this.width / 2, this.height / 2]);

      // Redraw if data is loaded
      if (this.data) {
        this.renderMap();
      }
    }
  }

  private async loadData(): Promise<void> {
    try {
      const response = await fetch('./data/japan.geojson');
      this.data = await response.json() as JapanGeoJSON;
      this.renderMap();
    } catch (error) {
      console.error('Error loading Japan GeoJSON data:', error);
    }
  }

  private renderMap(): void {
    if (!this.data) return;

    // Clear existing elements
    this.svg.selectAll('*').remove();

    // Create main group for zoom transform
    const mapGroup = this.svg.append('g');

    // Render prefectures
    const prefectures = this.data.features.filter(d => d.properties.type === 'prefecture');
    
    mapGroup.selectAll('.prefecture')
      .data(prefectures)
      .enter()
      .append('path')
      .attr('class', 'prefecture')
      .attr('d', this.path)
      .style('fill', '#e6f3ff')
      .style('stroke', '#2980b9')
      .style('stroke-width', '1px')
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        this.handleMouseEnter(event, d);
      })
      .on('mousemove', (event) => {
        this.handleMouseMove(event);
      })
      .on('mouseleave', () => {
        this.handleMouseLeave();
      })
      .on('click', (event, d) => {
        this.handleClick(event, d);
      });

    // Render cities
    const cities = this.data.features.filter(d => d.properties.type === 'city');
    
    mapGroup.selectAll('.city')
      .data(cities)
      .enter()
      .append('circle')
      .attr('class', 'city')
      .attr('cx', d => {
        const coords = d.geometry as GeoJSON.Point;
        const projected = this.projection(coords.coordinates as [number, number]);
        return projected ? projected[0] : 0;
      })
      .attr('cy', d => {
        const coords = d.geometry as GeoJSON.Point;
        const projected = this.projection(coords.coordinates as [number, number]);
        return projected ? projected[1] : 0;
      })
      .attr('r', d => Math.sqrt(d.properties.population / 100000) + 3)
      .style('fill', '#e74c3c')
      .style('stroke', '#c0392b')
      .style('stroke-width', '1px')
      .style('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        this.handleMouseEnter(event, d);
      })
      .on('mousemove', (event) => {
        this.handleMouseMove(event);
      })
      .on('mouseleave', () => {
        this.handleMouseLeave();
      })
      .on('click', (event, d) => {
        this.handleClick(event, d);
      });
  }

  private handleMouseEnter(event: MouseEvent, d: JapanFeature): void {
    // Highlight the element
    d3.select(event.target as Element)
      .style('opacity', 1)
      .style('filter', 'brightness(1.2)');

    // Show tooltip
    const tooltipData: TooltipData = {
      name: d.properties.name,
      name_ja: d.properties.name_ja,
      type: d.properties.type,
      population: d.properties.population,
      prefecture: d.properties.prefecture
    };

    this.showTooltip(tooltipData);
  }

  private handleMouseMove(event: MouseEvent): void {
    // Update tooltip position
    this.tooltip
      .style('left', `${event.offsetX + 10}px`)
      .style('top', `${event.offsetY - 10}px`);
  }

  private handleMouseLeave(): void {
    // Remove highlight
    d3.selectAll('.prefecture, .city')
      .style('opacity', function() { 
        return d3.select(this).classed('city') ? 0.8 : 1;
      })
      .style('filter', 'none');

    // Hide tooltip
    this.hideTooltip();
  }

  private handleClick(_event: MouseEvent, d: JapanFeature): void {
    console.log('Clicked on:', d.properties.name);
    // Could implement additional click functionality here
  }

  private showTooltip(data: TooltipData): void {
    const content = `
      <div><strong>${data.name}</strong></div>
      <div>${data.name_ja}</div>
      <div>${data.type === 'city' ? 'City' : 'Prefecture'}</div>
      <div>Population: ${data.population.toLocaleString()}</div>
      ${data.prefecture ? `<div>Prefecture: ${data.prefecture}</div>` : ''}
    `;

    this.tooltip
      .html(content)
      .classed('show', true);
  }

  private hideTooltip(): void {
    this.tooltip.classed('show', false);
  }
}

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JapanInteractiveMap();
});