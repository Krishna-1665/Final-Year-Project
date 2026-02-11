import pandas as pd
import os

file_path = os.path.join('backend', 'data', 'dataset.xlsx')
try:
    df = pd.read_excel(file_path)
    for col in df.columns:
        print(f"Column: '{col}'")
except Exception as e:
    print(f"Error reading file: {e}")
