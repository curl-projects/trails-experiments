import React, { forwardRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { ForceGraphMethods } from 'react-force-graph-2d';

const ForceGraph2DWrapper = forwardRef<ForceGraphMethods, any>((props, ref) => (
  <ForceGraph2D ref={ref} {...props} />
));

export default ForceGraph2DWrapper; 