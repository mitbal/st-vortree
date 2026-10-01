import React, { useEffect, useRef } from 'react'
import { renderVoronoiTreemap } from './voronoi'

export interface VoronoiProps {
  data: any[];
  theme?: any;
  color_scheme?: string;
  show_values?: boolean;
  show_pct_only?: boolean;
  label_scale?: number;
  border_color?: string;
  border_width?: number;
  show_legend?: boolean;
  height?: number;
  color_scale?: string;
  show_color_value?: boolean;
}

const VoronoiComponent: React.FC<VoronoiProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const height = props.height || 400;

  useEffect(() => {
    const container = containerRef.current
    if (!props.data || !container) return

    const {
      data,
      color_scheme = 'tableau10',
      show_values = false,
      show_pct_only = false,
      label_scale = 1.0,
      border_color = '#ffffff',
      border_width = 1,
      show_legend = true,
      color_scale = 'green',
      show_color_value = false
    } = props

    // Apply Streamlit's base theme styles if requested, but for now we'll just handle standard visualization.
    if (props.theme) {
      document.documentElement.style.setProperty('--background-color', props.theme.backgroundColor)
      document.documentElement.style.setProperty('--text-color', props.theme.textColor)
    }

    if (!(data && Array.isArray(data) && data.length > 0)) return

    let drawnWidth = 0
    let drawnHeight = 0

    const draw = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      // Hidden containers (e.g. an inactive st.tabs panel) report zero width;
      // wait for the ResizeObserver to fire once they become visible.
      if (width === 0 || height === 0) return
      if (width === drawnWidth && height === drawnHeight) return
      drawnWidth = width
      drawnHeight = height

      // Clear container before re-drawing
      container.innerHTML = ''

      const id = 'vortree-container'
      const uniqueId = id + '-' + Math.random().toString(36).substr(2, 9);
      container.id = uniqueId;

      try {
        renderVoronoiTreemap(
          data,
          container,
          color_scheme,
          show_values,
          show_pct_only,
          label_scale,
          border_color,
          border_width,
          show_legend,
          color_scale,
          show_color_value
        )
      } catch (err) {
        console.error("Error rendering Voronoi Treemap:", err)
      }
    }

    draw()

    // Redraw when the container is shown or resized. Coalesce bursts of
    // resize events into one layout per animation frame.
    let frame = 0
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(draw)
    })
    observer.observe(container)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [props.data, props.theme, props.color_scheme, props.show_values, props.show_pct_only, props.label_scale, props.border_color, props.border_width, props.show_legend, props.height, props.color_scale, props.show_color_value])

  return (
    <div
      className="voronoi-container"
      style={{ width: '100%', height: height, overflow: 'hidden' }}
    >
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', minHeight: '300px' }}
      />
    </div>
  )
}

export default VoronoiComponent
