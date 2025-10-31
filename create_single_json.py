#!/usr/bin/env python3
"""
创建一个包含所有数据的单一JSON文件供JS使用
Create a single JSON file containing all data for JS processing
"""

import pandas as pd
import json

def create_comprehensive_json():
    """创建综合JSON数据文件"""
    
    # 读取清理后的数据
    df = pd.read_excel('SWAC publications 1980-2020s.xlsx', sheet_name='list of publications')
    
    # 基本清理
    cleaned = df[df['Year'] != 0].copy()
    cleaned = cleaned.dropna(subset=['Year'])
    cleaned['Year'] = cleaned['Year'].astype(int)
    
    # 定义主题映射
    topic_mapping = {
        'PERSP/cross': 'Perspective/Cross-cutting',
        'DEV': 'Development',
        'ECO': 'Economy',
        'URB': 'Urban',
        'SEC': 'Security',
        'FOOD': 'Food',
        'EDU': 'Education',
        'MIGR': 'Migration',
        'CLI': 'Climate',
        'HEALTH': 'Health',
        'GENDER': 'Gender',
        'INTERNAL': 'Internal'
    }
    
    # 收集出版物数据
    publications = []
    for idx, row in cleaned.iterrows():
        # 处理所有可能为NaN的字段
        def safe_value(val):
            return None if pd.isna(val) else val
        
        pub = {
            'year': int(row['Year']),
            'series': safe_value(row['Series name']),
            'type': safe_value(row['Type of document']),
            'title': safe_value(row['Title - link']),
            'author': safe_value(row['Author or Coordinator']),
            'status': safe_value(row['status']),
            'code': safe_value(row['code']),
            'topics': []
        }
        
        # 收集主题
        for col, topic in topic_mapping.items():
            if col in cleaned.columns and row[col] == 'x':
                pub['topics'].append(topic)
        
        publications.append(pub)
    
    # 按年份分组
    publications_by_year = {}
    for pub in publications:
        year = pub['year']
        if year not in publications_by_year:
            publications_by_year[year] = []
        publications_by_year[year].append(pub)
    
    # 构建综合数据对象
    data = {
        'metadata': {
            'total_publications': len(publications),
            'year_range': {
                'min': int(cleaned['Year'].min()),
                'max': int(cleaned['Year'].max())
            },
            'topics': list(topic_mapping.values()),
            'series_count': cleaned['Series name'].nunique(),
            'types_count': cleaned['Type of document'].nunique()
        },
        'publications': publications,
        'publications_by_year': publications_by_year,
        'series_info': {},
        'yearly_stats': {}
    }
    
    # 计算系列统计
    for series in cleaned['Series name'].unique():
        if pd.isna(series):
            series = None  # 将NaN转换为None
        series_data = cleaned[cleaned['Series name'] == series]
        years = series_data['Year'].dropna()
        if len(years) > 0:
            data['series_info'][series] = {
                'total': len(series_data),
                'years': {
                    'start': int(years.min()),
                    'end': int(years.max())
                },
                'main_type': series_data['Type of document'].mode().iloc[0] if len(series_data['Type of document'].mode()) > 0 else 'Unknown'
            }
        else:
            data['series_info'][series] = {
                'total': len(series_data),
                'years': None,
                'main_type': series_data['Type of document'].mode().iloc[0] if len(series_data['Type of document'].mode()) > 0 else 'Unknown'
            }
    
    # 计算每年统计
    for year in cleaned['Year'].unique():
        year_data = cleaned[cleaned['Year'] == year]
        data['yearly_stats'][int(year)] = {
            'total': len(year_data),
            'series_count': year_data['Series name'].nunique(),
            'top_series': year_data['Series name'].value_counts().head(3).to_dict()
        }
    
    # 计算累积统计
    cumulative = 0
    for year in sorted(data['yearly_stats'].keys()):
        cumulative += data['yearly_stats'][year]['total']
        data['yearly_stats'][year]['cumulative'] = cumulative
    
    # 保存为JSON
    output_file = 'swac_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ 已创建综合数据文件: {output_file}")
    print(f"  总出版物数: {len(publications)}")
    print(f"  年份跨度: {data['metadata']['year_range']['min']}-{data['metadata']['year_range']['max']}")
    print(f"  系列数量: {data['metadata']['series_count']}")
    print(f"  主题数量: {len(topic_mapping)}")
    
    return output_file

if __name__ == '__main__':
    create_comprehensive_json()

