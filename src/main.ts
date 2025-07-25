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
    this.setupZoomControls();
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
    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        const { transform } = event;
        this.svg.select('.map-group').attr('transform', transform);
      });

    this.svg.call(this.zoom);
  }

  private setupZoomControls(): void {
    const zoomInBtn = document.getElementById('zoom-in') as HTMLButtonElement;
    const zoomOutBtn = document.getElementById('zoom-out') as HTMLButtonElement;

    if (zoomInBtn && zoomOutBtn) {
      zoomInBtn.addEventListener('click', () => {
        this.zoomIn();
      });

      zoomOutBtn.addEventListener('click', () => {
        this.zoomOut();
      });
    }
  }

  private zoomIn(): void {
    this.svg
      .transition()
      .duration(300)
      .call(this.zoom.scaleBy as any, 1.5);
  }

  private zoomOut(): void {
    this.svg
      .transition()
      .duration(300)
      .call(this.zoom.scaleBy as any, 1 / 1.5);
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
      const response = await fetch('./data/gadm41_JPN_1.geojson');
      this.data = (await response.json()) as JapanGeoJSON;
      this.renderMap();
    } catch (error) {
      console.error('Error loading Japan GeoJSON data:', error);
    }
  }

  private renderMap(): void {
    if (!this.data) return;

    // Clear existing map elements but preserve zoom state
    this.svg.selectAll('.map-group').remove();

    // Use fitExtent with minimal padding to maximize map size
    const padding = 40; // Small padding to ensure map doesn't touch edges
    this.projection.fitExtent(
      [
        [padding, padding],
        [this.width - padding, this.height - padding],
      ],
      this.data,
    );

    // Create main group for zoom transform with consistent class name
    const mapGroup = this.svg.append('g').attr('class', 'map-group');

    // Render all prefectures
    mapGroup
      .selectAll('.prefecture')
      .data(this.data.features)
      .enter()
      .append('path')
      .attr('class', 'prefecture')
      .attr('d', this.path)
      .style('fill', '#4A90E2')
      .style('stroke', '#ffffff')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3,3')
      .style('cursor', 'pointer')
      .style('transition', 'all 0.3s ease')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
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
    // Highlight the element with enhanced visual feedback
    d3.select(event.target as Element)
      .style('fill', '#E74C3C')
      .style('stroke-width', '2px')
      .style('stroke', '#ffffff')
      .style('stroke-dasharray', 'none')
      .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))')
      .style('transform', 'scale(1.02)');

    // Show tooltip
    const tooltipData: TooltipData = {
      name: d.properties.name,
      name_ja: d.properties.name_ja,
      type: d.properties.type,
      population: d.properties.population,
      capital: d.properties.capital,
      image: d.properties.image,
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
    // Remove highlight and restore original styling
    d3.selectAll('.prefecture')
      .style('fill', '#4A90E2')
      .style('stroke-width', '1px')
      .style('stroke', '#ffffff')
      .style('stroke-dasharray', '3,3')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      .style('transform', 'scale(1)');

    // Hide tooltip
    this.hideTooltip();
  }

  private handleClick(_event: MouseEvent, d: JapanFeature): void {
    console.log(
      'Clicked on:',
      d.properties.name,
      'Population:',
      d.properties.population,
    );
    // Could implement additional click functionality here
  }

  private showTooltip(data: TooltipData): void {
    const imageHtml = data.image
      ? `<div class="tooltip-image"><img src="${data.image}" alt="${data.name}" style="width: 150px; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" /></div>`
      : '';

    const capitalHtml = data.capital
      ? `<div style="color: #bbb; font-size: 12px;">Capital: ${data.capital}</div>`
      : '';

    const population = data.population || 0;

    const content = `
      ${imageHtml}
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">${
        data.name || 'Unknown'
      }</div>
      <div style="color: #ccc; margin-bottom: 6px;">${data.name_ja || 'Unknown'}</div>
      ${capitalHtml}
      <div style="color: #ddd; font-size: 14px;">Population: ${population.toLocaleString()}</div>
    `;

    this.tooltip.html(content).classed('show', true);
  }

  private hideTooltip(): void {
    this.tooltip.classed('show', false);
  }
}

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JapanInteractiveMap();
});
