import pandas as pd
import json
import os

def convert_excel_to_json(excel_path, json_path):
    if not os.path.exists(excel_path):
        print(f"Error: {excel_path} not found.")
        return

    # 读取 Excel
    try:
        # 尝试读取，真实数据文件可能有表头偏移
        df = pd.read_excel(excel_path, header=1)
        
        # 检查是否包含必要的列，如果不包含，尝试 header=0
        required_cols = ["专业代号及名称", "院校代号及名称", "投档计划数", "投档最低分（综合分）"]
        if not all(col in df.columns for col in required_cols):
            df = pd.read_excel(excel_path, header=0)
        
        # 字段映射
        mapping = {
            "专业代号及名称": "major_code_name",
            "院校代号及名称": "college_code_name",
            "投档计划数": "admission_plan",
            "投档最低分（综合分）": "min_composite_score",
            "文化课最低分（按照美术234分）": "min_culture_score"
        }
        
        # 重命名列
        df = df.rename(columns=mapping)
        
        # 只保留需要的列
        df = df[list(mapping.values())]
        
        # 转换为 JSON 列表
        data_list = df.to_dict(orient='records')
        
        # 保存为 JSON 文件
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data_list, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully converted {excel_path} to {json_path}")
        print(f"Total records: {len(data_list)}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # 优先转换真实数据
    real_data = "data/25年美术本科第一志愿投档线.xls"
    if os.path.exists(real_data):
        convert_excel_to_json(real_data, "data/scores.json")
    else:
        convert_excel_to_json("data/raw_data.xlsx", "data/scores.json")
