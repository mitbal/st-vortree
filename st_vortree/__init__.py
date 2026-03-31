import streamlit as st
import os
import pandas as pd

_COMPONENT_NAME = "st_vortree"

# Use the V2 component declaration
_component_func = st.components.v2.component(
    "st-vortree.st_vortree",
    js="vortree.js",
    css="style.css",
    html='<div class="react-root"></div>',
)

def st_vortree(
    df: pd.DataFrame, 
    name_col: str = "name", 
    value_col: str = "value", 
    group_col: str = None,
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
