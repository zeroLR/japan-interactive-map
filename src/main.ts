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
    // Use Mercator projection that will be fitted to the data
    this.projection = d3.geoMercator();
    this.path = d3.geoPath().projection(this.projection);
  }

  private setupZoom(): void {
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        const { transform } = event;
        this.svg.selectAll('path')
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

      // Redraw if data is loaded
      if (this.data) {
        this.renderMap();
      }
    }
  }

  private async loadData(): Promise<void> {
    try {
      const response = await fetch('./data/japan_one_twenty_map.geojson');
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

    // Use fitExtent to better control the positioning and use full width
    this.projection.fitExtent([[0, 0], [this.width, this.height]], this.data);
    
    // Get the projection's scale after fitting
    let scale = this.projection.scale();

    // Manually increase the scale to make the map larger and better use available space
    // Japan's natural aspect ratio doesn't fill the wide container, so we scale it up
    const scaleFactor = 3.5; // Balanced scaling for good visibility without too much overflow
    scale *= scaleFactor;
    
    // Center the map in the available space
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    this.projection
      .scale(scale)
      .translate([centerX, centerY]);

    // Create main group for zoom transform
    const mapGroup = this.svg.append('g');

    // Render all city regions (all features are now cities)
    mapGroup.selectAll('.city-region')
      .data(this.data.features)
      .enter()
      .append('path')
      .attr('class', 'city-region')
      .attr('d', this.path)
      .style('fill', '#e6f3ff')
      .style('stroke', 'black')
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
  }

  private handleMouseEnter(event: MouseEvent, d: JapanFeature): void {
    // Highlight the element
    d3.select(event.target as Element)
      .style('opacity', 1)
      .style('filter', 'brightness(1.2)');

    // Show tooltip
    const tooltipData: TooltipData = {
      name: d.properties.names_1_20,
      code: d.properties.code_1_20
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
    d3.selectAll('.city-region')
      .style('opacity', 1)
      .style('filter', 'none');

    // Hide tooltip
    this.hideTooltip();
  }

  private handleClick(_event: MouseEvent, d: JapanFeature): void {
    console.log('Clicked on:', d.properties.names_1_20, 'Code:', d.properties.code_1_20);
    // Could implement additional click functionality here
  }

  private showTooltip(data: TooltipData): void {
    const content = `
      <div><strong>${data.name}</strong></div>
      <div>Code: ${data.code}</div>
      <div>City Region</div>
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