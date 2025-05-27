'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Componente para simular la ejecución de una máquina de Moore
 * 
 * @param {Object} machine - Definición de la máquina de Moore
 * @param {Function} onStateChange - Función callback al cambiar de estado
 * @param {Function} onTransition - Función callback al realizar una transición
 */
export default function MachineSimulator({ machine, onStateChange, onTransition }) {
  // Estado de la simulación
  const [currentState, setCurrentState] = useState(null);
  const [currentOutput, setCurrentOutput] = useState(null);
  const [history, setHistory] = useState([]);
  const [inputSequence, setInputSequence] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500); // ms entre pasos
  const [isComplete, setIsComplete] = useState(false);
  const prevStateRef = useRef(null);
  
  // Inicializar simulador cuando cambia la máquina
  useEffect(() => {
    if (machine && machine.initialState) {
      resetSimulation();
    }
  }, [machine]);
  
  // Efecto para notificar cambios de estado
useEffect(() => {
  if (currentState && onStateChange) {
    const stateInfo = {
      currentState,
      output: currentOutput
    };
    
    if (JSON.stringify(stateInfo) !== JSON.stringify(prevStateRef.current)) {
      prevStateRef.current = stateInfo;
      onStateChange(stateInfo);
    }
  }
}, [currentState, currentOutput]);
  
  // Reiniciar simulación
  const resetSimulation = () => {
    const initialState = machine.initialState;
    const initialOutput = machine.outputFunction[initialState];
    
    setCurrentState(initialState);
    setCurrentOutput(initialOutput);
    setHistory([{
      state: initialState,
      input: null,
      output: initialOutput
    }]);
    setIsComplete(false);
    setIsRunning(false);
  };
  
  // Procesar un símbolo de entrada
  const processInput = (input) => {
    if (!machine || !currentState || isComplete) return false;
    
    // Encontrar la transición correspondiente
    const transition = machine.transitions.find(
      t => t.from === currentState && t.input === input
    );
    
    if (!transition) return false;
    
    // Notificar sobre la transición activa
    if (onTransition) {
      onTransition({
        from: transition.from,
        to: transition.to,
        input: transition.input
      });
    }
    
    // Aplicar la transición
    const nextState = transition.to;
    const output = machine.outputFunction[nextState];
    
    // Actualizar estado
    setCurrentState(nextState);
    setCurrentOutput(output);
    
    // Actualizar historial
    setHistory(prev => [...prev, {
      state: nextState,
      input,
      output
    }]);
    
    return true;
  };
  
  // Procesar una secuencia de entrada
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputSequence(value);
  };
  
  // Validar si la secuencia contiene sólo símbolos válidos
  const isValidSequence = () => {
    if (!inputSequence.trim() || !machine) return false;
    
    const validSymbols = new Set(machine.inputs);
    return inputSequence.split('').every(char => validSymbols.has(char));
  };
  
  // Ejecutar la simulación paso a paso para la secuencia
  const runSequence = async () => {
    if (!isValidSequence() || isRunning) return;
    
    setIsRunning(true);
    setIsComplete(false);
    
    const sequence = inputSequence.split('');
    
    for (let i = 0; i < sequence.length; i++) {
      const success = processInput(sequence[i]);
      
      if (!success) {
        setIsComplete(true);
        setIsRunning(false);
        return;
      }
      
      // Esperar antes del siguiente paso
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    
    setIsComplete(true);
    setIsRunning(false);
  };
  
  // Ejecutar un solo paso
  const stepForward = () => {
    if (!inputSequence || isRunning) return;
    
    const nextInput = inputSequence.charAt(0);
    if (nextInput) {
      const success = processInput(nextInput);
      if (success) {
        setInputSequence(inputSequence.substring(1));
      }
    }
  };
  
  // Ejecutar un paso con un símbolo específico
  const handleSymbolClick = (symbol) => {
    processInput(symbol);
  };
  
  if (!machine) {
    return (
      <div className="p-4 border rounded bg-gray-50 text-gray-500">
        No hay máquina definida para simular.
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Simulador de Máquina</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 border rounded bg-blue-50">
          <div className="text-sm text-gray-500 mb-1">Estado Actual</div>
          <div className="text-xl font-mono text-black">{currentState || '-'}</div>
        </div>
        <div className="p-3 border rounded bg-green-50">
          <div className="text-sm text-gray-500 mb-1">Salida Actual</div>
          <div className="text-xl font-mono text-black">{currentOutput || '-'}</div>
        </div>
      </div>
      
      {/* Controles de entrada */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-black">
          Secuencia de Entrada:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputSequence}
            onChange={handleInputChange}
            placeholder="Ingrese símbolos..."
            className="flex-grow border rounded px-3 py-2 text-black"
            disabled={isRunning}
          />
          <button
            onClick={runSequence}
            disabled={!isValidSequence() || isRunning}
            className={`px-4 py-2 rounded font-medium ${
              !isValidSequence() || isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? 'Ejecutando...' : 'Ejecutar'}
          </button>
          <button
            onClick={stepForward}
            disabled={!inputSequence || isRunning}
            className={`px-4 py-2 rounded font-medium ${
              !inputSequence || isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Paso
          </button>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 rounded font-medium bg-gray-600 text-white hover:bg-gray-700"
          >
            Reiniciar
          </button>
        </div>
        
        {/* Mensaje de validación */}
        {inputSequence && !isValidSequence() && (
          <p className="text-red-500 text-sm mt-1">
            La secuencia contiene símbolos no válidos. Símbolos permitidos: {machine.inputs.join(', ')}
          </p>
        )}
        
        {/* Mensaje de finalización */}
        {isComplete && (
          <p className="text-green-600 font-medium mt-2">
            ¡Simulación completada!
          </p>
        )}
      </div>
      
      <div className="mb-6">
        <div className="text-sm font-medium mb-2 text-black">Entrada Directa:</div>
        <div className="flex flex-wrap gap-2">
          {machine.inputs.map(symbol => (
            <button
              key={symbol}
              onClick={() => handleSymbolClick(symbol)}
              disabled={isRunning}
              className={`px-4 py-2 rounded font-mono ${
                isRunning
                  ? 'bg-gray-100 text-gray-400 border cursor-not-allowed'
                  : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
      
      
      <div>
        <h3 className="text-lg font-semibold mb-2 text-black">Historial de Ejecución</h3>
        <div className="border rounded overflow-y-auto max-h-64">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left text-black">Paso</th>
                <th className="border p-2 text-left text-black">Estado</th>
                <th className="border p-2 text-left text-black">Entrada</th>
                <th className="border p-2 text-left text-black">Salida</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index} className={currentState === item.state && index === history.length - 1 ? 'bg-yellow-50' : ''}>
                  <td className="border p-2 text-black">{index}</td>
                  <td className="border p-2 font-mono text-black">{item.state}</td>
                  <td className="border p-2 font-mono text-black">{item.input || '-'}</td>
                  <td className="border p-2 font-mono text-black">{item.output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}