import React from 'react';
import styles from './DistributionRow.module.css';

interface DistributionRowProps {
  title: string;
  subtitle: string;
  alpha: number;
  beta: number;
}

export const DistributionRow: React.FC<DistributionRowProps> = ({
  title,
  subtitle,
  alpha,
  beta,
}) => {
  // Generate points for the beta distribution curve
  const generateBetaPoints = () => {
    const points: [number, number][] = [];
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      const y = (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) / getBetaConstant(alpha, beta);
      points.push([x, y]);
    }
    
    return points;
  };

  // Calculate beta function constant
  const getBetaConstant = (a: number, b: number) => {
    return (gamma(a) * gamma(b)) / gamma(a + b);
  };

  // Approximation of gamma function
  const gamma = (z: number) => {
    const g = 7;
    const C = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];

    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));

    z -= 1;
    let x = C[0];
    for (let i = 1; i < g + 2; i++) x += C[i] / (z + i);
    const t = z + g + 0.5;

    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  };

  const points = generateBetaPoints();
  const maxY = Math.max(...points.map(p => p[1]));
  
  // Scale points to fit in the SVG
  const scaledPoints = points.map(([x, y]) => [x * 200, (1 - y / maxY) * 100]);
  const pathData = `M ${scaledPoints[0][0]},${scaledPoints[0][1]} ` + 
    scaledPoints.slice(1).map(point => `L ${point[0]},${point[1]}`).join(' ');

  // Calculate mean and mode
  const mean = alpha / (alpha + beta);
  const mode = (alpha - 1) / (alpha + beta - 2);

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <h3>{title}</h3>
        <p>{subtitle}</p>
        <div className={styles.stats}>
          <span>α: {alpha.toFixed(2)}</span>
          <span>β: {beta.toFixed(2)}</span>
          <span>mean: {mean.toFixed(2)}</span>
          <span>mode: {mode.toFixed(2)}</span>
        </div>
      </div>
      <div className={styles.graph}>
        <svg width="200" height="100" viewBox="0 0 200 100">
          <path
            d={pathData}
            stroke="#2563eb"
            strokeWidth="2"
            fill="none"
          />
          {/* Mean line */}
          <line
            x1={mean * 200}
            y1="0"
            x2={mean * 200}
            y2="100"
            stroke="#dc2626"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </svg>
      </div>
    </div>
  );
}; 