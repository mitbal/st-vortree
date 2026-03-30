import React, { useEffect, useRef } from 'react'
import { renderVoronoiTreemap } from './voronoi'

export interface VoronoiProps {
  data: any[];
  theme?: any;
  color_scheme?: string;
  show_values?: boolean;
  label_scale?: number;
  border_color?: string;
  border_width?: number;
  show_legend?: boolean;
}

const VoronoiComponent: React.FC<VoronoiProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!props.data || !containerRef.current) return

    const {
      data,
      color_scheme = 'tableau10',
      show_values = false,
      label_scale = 1.0,
      border_color = '#ffffff',
      border_width = 1,
      show_legend = true
    } = props

    // Apply Streamlit's base theme styles if requested, but for now we'll just handle standard visualization.
    if (props.theme) {
      document.documentElement.style.setProperty('--background-color', props.theme.backgroundColor)
      document.documentElement.style.setProperty('--text-color', props.theme.textColor)
    }

    if (data && Array.isArray(data) && data.length > 0) {
      // Clear container before re-drawing
      containerRef.current.innerHTML = ''
      
      const id = 'vortree-container'
      const uniqueId = id + '-' + Math.random().toString(36).substr(2, 9);
      containerRef.current.id = uniqueId;

      try {
        renderVoronoiTreemap(
          data, 
          containerRef.current, 
          color_scheme, 
          show_values, 
          label_scale, 
          border_color, 
          border_width, 
          show_legend
        )
      } catch (err) {
        console.error("Error rendering Voronoi Treemap:", err)
      }
    }
  }, [props.data, props.theme, props.color_scheme, props.show_values, props.label_scale, props.border_color, props.border_width, props.show_legend])

  return (
    <div 
      className="voronoi-container" 
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', minHeight: '300px' }} 
      />
    </div>
  )
}

export default VoronoiComponent
