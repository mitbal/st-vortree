# Streamlit Voronoi Treemap Component (V2)

A custom Streamlit component built on the [Streamlit V2 Component Architecture](https://docs.streamlit.io/) that renders beautiful, dynamic Voronoi Treemaps from pandas DataFrames. It uses D3.js and `d3-voronoi-treemap` to lay out the data natively in the DOM, avoiding iframe overhead.

## Features
- **Native Rendering**: Built with Streamlit V2 architecture, ensuring native DOM components without iframes.
- **Grouped Hierarchies**: Supports grouped data to visualize hierarchical relationships.
- **Customization Options**: Includes controls for color schemes, label scaling, borders, and legends.
- **Responsive Sizing**: Adapts dynamically to your Streamlit page width.

## Installation

You can install this component in editable mode locally:

```bash
pip install -e .
```

To build the frontend, make sure you have `npm` installed:
```bash
cd st_vortree/frontend
npm install
npm run build
```

## Quick Start

Import the custom component and pass a pandas DataFrame with your data. The DataFrame requires at a minimum a name column and a numeric value column.

```python
import streamlit as st
import pandas as pd
from st_vortree import st_vortree

# Sample dataset
data = [
    {"Company": "Apple", "Sector": "Tech", "MarketCap": 2800},
    {"Company": "Microsoft", "Sector": "Tech", "MarketCap": 2900},
    {"Company": "Johnson & Johnson", "Sector": "Healthcare", "MarketCap": 400},
    {"Company": "Pfizer", "Sector": "Healthcare", "MarketCap": 200},
]
df = pd.DataFrame(data)

st.title("Voronoi Treemap Example")

# Render grouped Treemap
st_vortree(
    df,
    name_col="Company",
    value_col="MarketCap",
    group_col="Sector",           # Groups polygons by 'Sector'
    color_scheme="tableau10",     # Available: tableau10, category10, pastel1, dark, cool, warm
    show_values=True,
    show_legend=True,
    label_scale=1.0,
    border_color="#ffffff",
    border_width=2,
    key="my_vortree"
)
```

## API Reference

### `st_vortree(df, ...)`
Renders a given pandas DataFrame as a Voronoi treemap visualization.

**Arguments:**
- `df (pandas.DataFrame)`: The DataFrame containing the input data.
- `name_col (str)`: The name of the column containing the labels for the polygons. Defaults to `"name"`.
- `value_col (str)`: The name of the column containing the numeric sizes of the polygons. Defaults to `"value"`.
- `group_col (str, optional)`: The name of the column used for grouping features together into a hierarchy. Defaults to `None`.
- `color_scheme (str)`: D3 categorical color scale to apply. Options include `"tableau10"`, `"category10"`, `"pastel1"`, `"dark"`, `"cool"`, `"warm"`. Defaults to `"tableau10"`.
- `show_values (bool)`: Whether to show the metric value and relative percentage inside the polygon labels. Defaults to `False`.
- `label_scale (float)`: Scale multiplier for the dynamically sized text labels. Defaults to `1.0`.
- `border_color (str)`: Hex color of the polygon outlines. Defaults to `"#ffffff"`.
- `border_width (int)`: Thickness of the polygon outlines. Defaults to `1`.
- `show_legend (bool)`: Whether to draw a legend beside the nodes. Defaults to `True`.
- `key (str, optional)`: An optional Streamlit key to uniquely identify the component instance.

## Architecture Highlights
This component does not use the deprecated V1 architecture's `<iframe>` mounting framework, making it significantly more performant and natively styled. The D3 logic parses and modifies standard DOM nodes wrapped by a generic Web Component interface (`@streamlit/component-v2-lib`).
