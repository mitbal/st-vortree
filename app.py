import streamlit as st
import pandas as pd
import random
from st_vortree import st_vortree

st.set_page_config(layout="wide")

st.title("Voronoi Treemap Component V2 Test")

# Generate some mock data
def get_mock_data():
    categories = ["Tech", "Finance", "Healthcare", "Energy"]
    companies = {
        "Tech": ["Apple", "Microsoft", "Google", "Amazon", "Meta"],
        "Finance": ["JPMorgan", "Visa", "Mastercard", "Bank of America"],
        "Healthcare": ["J&J", "UnitedHealth", "Pfizer", "AbbVie"],
        "Energy": ["ExxonMobil", "Chevron", "NextEra", "ConocoPhillips"]
    }
    
    data = []
    for cat in categories:
        for comp in companies[cat]:
            data.append({
                "Company": comp,
                "MarketCap": random.randint(50, 1000), # Mock value
                "Sector": cat
            })
    return pd.DataFrame(data)

df = get_mock_data()

st.sidebar.header("Configuration")
color_scheme = st.sidebar.selectbox(
    "Color Scheme", 
    ["tableau10", "category10", "pastel1", "dark", "cool", "warm"]
)
show_values = st.sidebar.checkbox("Show Values", value=True)
label_scale = st.sidebar.slider("Label Scale", 0.5, 2.0, 1.0)
border_color = st.sidebar.color_picker("Border Color", "#ffffff")
border_width = st.sidebar.slider("Border Width", 0, 5, 2)
show_legend = st.sidebar.checkbox("Show Legend", value=True)

st.write("### The Grouped Treemap")
st_vortree(
    df,
    name_col="Company",
    value_col="MarketCap",
    group_col="Sector",
    color_scheme=color_scheme,
    show_values=show_values,
    label_scale=label_scale,
    border_color=border_color,
    border_width=border_width,
    show_legend=show_legend,
    key="grouped_treemap"
)

st.write("### The Ungrouped Treemap")
st_vortree(
    df,
    name_col="Company",
    value_col="MarketCap",
    color_scheme=color_scheme,
    show_values=show_values,
    label_scale=label_scale,
    border_color=border_color,
    border_width=border_width,
    show_legend=show_legend,
    key="ungrouped_treemap"
)
