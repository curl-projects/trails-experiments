interface NodeTypeColors {
    background: string;
    text: string;
  }
  
  const nodeColorMap: Record<string, NodeTypeColors> = {
    'Post': {
      background: '#ebf8ff',  // light blue
      text: '#2c5282'        // dark blue
    },
    'Author': {
      background: '#faf5ff',  // light purple
      text: '#553c9a'        // dark purple
    },
    'Concept': {
      background: '#f0fff4',  // light green
      text: '#276749'        // dark green
    },
    'Entity': {
      background: '#fff5f5',  // light red
      text: '#9b2c2c'        // dark red
    },
    'Account': {
      background: '#fffaf0',  // light orange
      text: '#9c4221'        // dark orange
    }
  } as const;
  
  export const getNodeTypeColors = (nodeType: string): NodeTypeColors => {
    return nodeColorMap[nodeType] || { background: '#f7fafc', text: '#4a5568' };
  };