import React, { useState, useEffect } from 'react';
import { Descriptions, Tag, Typography, Avatar } from 'antd';

const { Title } = Typography;

interface SiteInfoProps {
  site: any;
  target: string;
}

const SiteInfo: React.FC<SiteInfoProps> = ({ site, target }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [site.favicon]);

  return (
    <div className="site-info-header">
      <div className="flex items-center mb-4">
        {site.favicon && !imgError && (
          <Avatar 
            src={site.favicon} 
            shape="square" 
            size="large" 
            className="mr-4 flex-shrink-0"
            onError={() => {
                setImgError(true);
                return false;
            }}
          />
        )}
        <Title level={4} style={{ margin: 0 }} ellipsis={{ tooltip: site.title || target }}>
            {site.title || target}
        </Title>
      </div>
      
      <Descriptions bordered column={1} size="small">
         {site.description && (
             <Descriptions.Item label="站点描述">
                 {site.description}
             </Descriptions.Item>
         )}
         
         <Descriptions.Item label="服务器 IP">
             <span className="font-mono">{site.ip}</span>
         </Descriptions.Item>
         
         <Descriptions.Item label="CNAME">
             <span className="font-mono">{site.cname}</span>
         </Descriptions.Item>
         
         {site.geo && (
             <Descriptions.Item label="地理位置">
                 <div className="flex flex-wrap gap-2">
                     {site.geo.country && <Tag>{site.geo.country}</Tag>}
                     {site.geo.region && <Tag>{site.geo.region}</Tag>}
                     {site.geo.city && <Tag>{site.geo.city}</Tag>}
                 </div>
             </Descriptions.Item>
         )}
         
         <Descriptions.Item label="Web 服务器">
             <Tag color="blue">{site.server}</Tag>
         </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default SiteInfo;
