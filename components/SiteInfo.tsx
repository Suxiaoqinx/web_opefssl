import React from 'react';
import { DescriptionTable, DescriptionItem } from './ui/Descriptions';
import { Tag } from './ui/Tag';

interface SiteInfoProps {
  site: any;
  target: string;
}

const SiteInfo: React.FC<SiteInfoProps> = ({ site, target }) => {
  return (
    <div className="site-info-header">
      <div className="flex items-center mb-4">
        {site.favicon && (
          <img 
            src={site.favicon} 
            className="w-8 h-8 mr-4 rounded" 
            alt="icon" 
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <h2 className="m-0 text-2xl font-bold text-gray-800">{site.title || target}</h2>
      </div>
      
      <DescriptionTable>
         {site.description && (
             <DescriptionItem label="站点描述">
                 {site.description}
             </DescriptionItem>
         )}
         
         <DescriptionItem label="服务器 IP">
             <span className="font-mono">{site.ip}</span>
         </DescriptionItem>
         
         <DescriptionItem label="CNAME">
             <span className="font-mono">{site.cname}</span>
         </DescriptionItem>
         
         {site.geo && (
             <DescriptionItem label="地理位置">
                 <div className="flex flex-wrap gap-2">
                     {site.geo.country && <Tag effect="plain" round>{site.geo.country}</Tag>}
                     {site.geo.region && <Tag effect="plain" round>{site.geo.region}</Tag>}
                     {site.geo.city && <Tag effect="plain" round>{site.geo.city}</Tag>}
                 </div>
             </DescriptionItem>
         )}
         
         <DescriptionItem label="Web 服务器">
             <Tag effect="light" round className="ml-auto">{site.server}</Tag>
         </DescriptionItem>
      </DescriptionTable>
    </div>
  );
};

export default SiteInfo;
