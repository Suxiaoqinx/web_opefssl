import React, { useMemo } from 'react';
import { DescriptionItem, DescriptionTable } from './ui/Descriptions';

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

    return (
        <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded">
             <table className="min-w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-3 border-b border-gray-200">
                            Header Name
                        </th>
                        <th scope="col" className="px-6 py-3 border-b border-gray-200">
                            Value
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {headersList.map((header, index) => (
                        <tr key={index} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border-r border-gray-200">
                                {header.name}
                            </td>
                            <td className="px-6 py-4 break-all">
                                {header.value}
                            </td>
                        </tr>
                    ))}
                    {headersList.length === 0 && (
                        <tr className="bg-white border-b">
                            <td colSpan={2} className="px-6 py-4 text-center">
                                No headers available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default HttpHeaders;
