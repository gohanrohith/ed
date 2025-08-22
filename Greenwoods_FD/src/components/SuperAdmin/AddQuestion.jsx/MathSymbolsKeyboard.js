import React from 'react';
import { Button } from 'antd';
import { addStyles, StaticMathField } from 'react-mathquill';

// Apply MathQuill styles
addStyles();

const MathSymbolsKeyboard = ({ onInsert }) => {
  const symbols = [
    { label: 'Plus', latex: '+' },
    { label: 'Minus', latex: '-' },
    { label: 'Multiply', latex: '\\times' },
    { label: 'Divide', latex: '\\div' },
    { label: 'Equal', latex: '=' },
    { label: 'Not Equal', latex: '\\neq' },
    { label: 'Infinity', latex: '\\infty' },
    { label: 'Theta', latex: '\\theta' },
    { label: 'Pi', latex: '\\pi' },
    { label: 'Alpha', latex: '\\alpha' },
    { label: 'Beta', latex: '\\beta' },
    { label: 'Gamma', latex: '\\gamma' },
    { label: 'Square Root', latex: '\\sqrt{□}' }, // Square root
    { label: 'Fraction', latex: '\\frac{□}{□}' }, // Fraction
    { label: 'Summation', latex: '\\sum_{n=□}^{□} □' },
    { label: 'Integral', latex: '\\int_{a}^{b} f(x)dx' },
    { label: 'Limit', latex: '\\lim_{x\\to\\infty} □' },
    { label: 'Derivative', latex: '\\frac{d}{dx} □' },
    { label: 'Partial Derivative', latex: '\\frac{\\partial}{\\partial x} □' },
    { label: 'Exponent', latex: 'x^{□}' },
    { label: 'Subscript', latex: 'x_{□}' },
    { label: 'Vector', latex: '\\vec{v}' }
  ];

  return (
    <div className="math-symbols-keyboard">
      {symbols.map((symbol, index) => (
        <Button 
          key={index} 
          onClick={() => onInsert(symbol.latex)} 
          style={{ margin: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <StaticMathField>{symbol.latex}</StaticMathField>
        </Button>
      ))}
    </div>
  );
};

export default MathSymbolsKeyboard;