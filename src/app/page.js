'use client';

import { useState, useEffect, useRef } from 'react';
import MooreAutomaton from '@/components/MooreAutomaton';

export default function Home() {
  const [currentInput, setCurrentInput] = useState('0000');
  const [currentState, setCurrentState] = useState('S0');
  const [currentOutput, setCurrentOutput] = useState('0011');
  
  // Tabla de conversión BCD a estado y salida
  const bcdToStateOutput = {
    '0000': { state: 'S0', output: '0011' },
    '0001': { state: 'S1', output: '0100' },
    '0010': { state: 'S2', output: '0101' },
    '0011': { state: 'S3', output: '0110' },
    '0100': { state: 'S4', output: '0111' },
    '0101': { state: 'S5', output: '1000' },
    '0110': { state: 'S6', output: '1001' },
    '0111': { state: 'S7', output: '1010' },
    '1000': { state: 'S8', output: '1011' },
    '1001': { state: 'S9', output: '1100' },
  };
  
  // Actualizar estado y salida cuando cambia la entrada
  useEffect(() => {
    if (bcdToStateOutput[currentInput]) {
      setCurrentState(bcdToStateOutput[currentInput].state);
      setCurrentOutput(bcdToStateOutput[currentInput].output);
    }
  }, [currentInput]);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-white">
      <h1 className="text-3xl font-bold mb-6">Máquina de Moore: BCD a Exceso-3</h1>      
      <div className="w-full max-w-4xl h-[500px] mt-20 border rounded-lg bg-white shadow-lg">
        <MooreAutomaton currentState={currentState} />
      </div>
    </main>
  );
}