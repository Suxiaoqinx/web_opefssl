import React, { useMemo } from 'react';
import { Table } from 'antd';

interface HttpHeadersProps {
    headers: Record<string, string | string[]>;
}

const HttpHeaders: React.FC<HttpHeadersProps> = ({ headers }) => {
    const headersList = useMemo(() => {
        if (!headers) return [];
        return Object.entries(headers).map(([key, value]) => ({
            name: key,
            value: Array.isArray(value) ? value.join(', ') : value
        }));
    }, [headers]);

    const columns = [
        { 
            title: 'Header Name', 
            dataIndex: 'name', 
            key: 'name', 
            width: 150,
            fixed: 'left' as const
        },
        { 
            title: 'Value', 
            dataIndex: 'value', 
            key: 'value',
            render: (text: string) => <span className="break-all">{text}</span>
        }
    ];

    return (
        <Table 
            dataSource={headersList} 
            columns={columns} 
            pagination={false} 
            scroll={{ y: 400 }} 
            size="small" 
            rowKey="name"
            bordered
        />
    );
};

export default HttpHeaders;
