'use client';

import { useMooreMachine } from '../lib/utils/useMooreMachine';
import MachineVisualizer from './MachineVisualizer';
import MachineControls from './MachineControls';

export default function MooreAutomaton() {
  const {
    state,
    inputSequence,
    outputSequence,
    isCompleted,
    activeTransition,
    processInput,
    resetMachine,
    getCurrentStateDisplay
  } = useMooreMachine();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center mt-20 mb-10">      
      <MachineControls 
        onInput={processInput}
        onReset={resetMachine}
        isCompleted={isCompleted}
      />
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md w-full max-w-3xl">
        <div className="bg-white rounded-lg p-4 shadow-inner">
          <h3 className="font-bold text-lg mb-3 text-blue-800 border-b pb-1">Estado y Entrada</h3>
          <div className="space-y-2">
            <p className="font-semibold flex items-center">
              <span className="text-gray-700 w-32">Estado actual:</span>
              <span className="ml-2 font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded">
                {getCurrentStateDisplay()}
              </span>
            </p>
            <p className="font-semibold flex items-center">
              <span className="text-gray-700 w-32">Secuencia de entrada:</span>
              <span className="ml-2 font-mono">
                {inputSequence.length > 0 ? 
                  inputSequence.map((bit, i) => (
                    <span key={i} className={`inline-block px-2 py-1 m-0.5 rounded text-gray-700 ${bit === '#' ? 'bg-yellow-100' : 'bg-gray-100'}`}>{bit}</span>
                  )) : 
                  <span className="text-gray-500 italic">Vacía</span>
                }
              </span>
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-inner">
          <h3 className="font-bold text-lg mb-3 text-green-800 border-b pb-1">Salida (Exceso-3)</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-gray-700 font-semibold w-32">Bits generados:</span>
              <p className="font-mono text-xl">
                {outputSequence.length > 0 ? 
                  outputSequence.map((bit, i) => (
                    <span key={i} className="inline-block px-2 py-1 m-0.5 text-gray-700 bg-green-100 rounded">{bit}</span>
                  )) : 
                  <span className="text-gray-500 italic">Esperando entrada</span>
                }
              </p>
            </div>
            {isCompleted && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-800">
                  Conversión completa: 
                  <span className="ml-2 font-mono">{inputSequence.filter(i => i !== '#').join('')} → {outputSequence.join('')}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  BCD (binario) → Exceso-3 (binario)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-3xl mb-6">
        <MachineVisualizer 
          state={state}
          activeTransition={activeTransition}
        />
      </div>
    </div>
  );
}