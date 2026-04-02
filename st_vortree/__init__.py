import streamlit as st
import os
import pathlib
import pandas as pd

_COMPONENT_NAME = "st_vortree"
_DIR = pathlib.Path(__file__).parent

# Read JS/CSS as inline content so no asset_dir discovery is needed.
# Streamlit's resolver treats any string with a newline as inline content,
# bypassing pyproject.toml scanning entirely — this works for any install method.
_JS = (_DIR / "frontend" / "dist" / "vortree.js").read_text(encoding="utf-8")
_CSS = (_DIR / "frontend" / "dist" / "style.css").read_text(encoding="utf-8")

# Use the V2 component declaration
_component_func = st.components.v2.component(
    "st_vortree.st_vortree",
    js=_JS,
    css=_CSS,
    html='<div class="react-root"></div>',
)

def st_vortree(
    df: pd.DataFrame, 
    name_col: str = "name", 
    value_col: str = "value", 
    group_col: str = None,
    color_col: str = None,
    color_scale: str = "green",
    show_color_value: bool = False,
    color_scheme: str = "tableau10", 
    show_values: bool = False, 
    show_pct_only: bool = False,
    label_scale: float = 1.0, 
    border_color: str = "#ffffff", 
    border_width: int = 1, 
    show_legend: bool = True, 
    height: int = 400,
    key=None
):
    """
    Render a Voronoi Treemap custom component using Streamlit Component V2.
    """
    # Transform DataFrame to an array of dicts for JS
    cols_to_keep = {name_col: "name", value_col: "value"}
    if group_col and group_col in df.columns:
        cols_to_keep[group_col] = "group"
    if color_col and color_col in df.columns:
        cols_to_keep[color_col] = "color"
    
    available_cols = [c for c in cols_to_keep.keys() if c in df.columns]
    
    subset_df = df[available_cols].rename(columns=cols_to_keep)
    data_records = subset_df.to_dict('records')

    # Component call
    # In Streamlit V2 (BidiComponent), we pack all state/inputs into a single data dictionary 
    # to ensure they are all delivered to the frontend renderer.
    component_value = _component_func(
        data={
            "data": data_records,
            "color_scheme": color_scheme,
            "color_scale": color_scale,
            "show_color_value": show_color_value,
            "show_values": show_values,
            "show_pct_only": show_pct_only,
            "label_scale": label_scale,
            "border_color": border_color,
            "border_width": border_width,
            "show_legend": show_legend,
            "height": height,
        },
        key=key,
        default=None
    )

    return component_value
