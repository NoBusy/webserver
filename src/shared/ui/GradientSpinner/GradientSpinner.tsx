import React from 'react';
import styles from './GradientSpinner.module.scss';

const GradientSpinner = ({ size = "lg" }) => {
  const spinnerSize = size === 'lg' ? 52 : 24;
  return (
    <div className={styles.spinner} style={{ width: `${spinnerSize}px`, height: `${spinnerSize}px` }}>
      <div className={styles.inner_spinner} />
    </div>
  );
};

export default GradientSpinner;