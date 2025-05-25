import React from 'react';
import { GridLoader as ReactGridLoader } from 'react-spinners';

const GridLoader = ({ loading = true, size = 15, color = "#64748B" }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <ReactGridLoader loading={loading} size={size} color={color} />
        </div>
    );
};

export default GridLoader;
