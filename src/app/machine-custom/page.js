'use client';

import { useState, useCallback } from 'react';
import { machineToVisualFormat, validateMachine } from '@/lib/utils/MachineDefinition';
import MachineVisualizerD from '@/components/MachineVisualizerD';
import MachineSimulator from '@/components/MachineSimulator';
import MachineFileUploader from '@/components/MachineFileUploader';

export default function MachinePage() {
  const [machine, setMachine] = useState(null);
  const [visualMachine, setVisualMachine] = useState(null);
  const [currentState, setCurrentState] = useState(null);
  const [activeTransition, setActiveTransition] = useState(null);
  const [errors, setErrors] = useState([]);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'simulator', 'details'
  const [showVisualization, setShowVisualization] = useState(true);

  // Manejar la máquina parseada desde el uploader
  const handleMachineParsed = (parsedMachine) => {
    try {
      // Validar la máquina
      const validationErrors = validateMachine(parsedMachine);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // Convertir a formato visual
      const visual = machineToVisualFormat(parsedMachine);
      
      // Actualizar estados
      setMachine(parsedMachine);
      setVisualMachine(visual);
      setCurrentState({ currentState: parsedMachine.initialState });
      setErrors([]);
      
      // Cambiar a la pestaña del simulador
      setActiveTab('simulator');
    } catch (error) {
      setErrors([`Error al procesar la máquina: ${error.message}`]);
    }
  };

  // Manejar errores del uploader
  const handleUploaderError = (errorMessage) => {
    setErrors([errorMessage]);
  };

  // Manejar cambios de estado en el simulador
 const handleStateChange = useCallback((stateInfo) => {
  setCurrentState(stateInfo);
}, []);

  // Manejar transiciones en el simulador
  const handleTransition = (transitionInfo) => {
    setActiveTransition(transitionInfo);
    
    // Limpiar la transición activa después de un tiempo
    setTimeout(() => {
      setActiveTransition(null);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Máquina de Moore</h1>
      
      {/* Navegación de pestañas */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`py-3 px-6 ${
            activeTab === 'upload' 
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Cargar Máquina
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`py-3 px-6 ${
            activeTab === 'simulator' 
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          } ${!machine ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!machine}
        >
          Simulador
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`py-3 px-6 ${
            activeTab === 'details' 
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          } ${!machine ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!machine}
        >
          Detalles
        </button>
      </div>
      
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-md">
          <h3 className="text-red-800 font-medium mb-2">Errores:</h3>
          <ul className="list-disc list-inside text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {showVisualization && visualMachine && (
          <div className="lg:col-span-3 border rounded-lg bg-white shadow-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Visualización</h2>
            </div>
            <MachineVisualizerD
              visualMachine={visualMachine}
              state={currentState}
              activeTransition={activeTransition}
            />
          </div>
        )}
        
        <div className={`${showVisualization && visualMachine ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
          {activeTab === 'upload' && (
            <div className="border rounded-lg bg-white shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-black">Cargar Definición de Máquina</h2>
              <MachineFileUploader
                onMachineParsed={handleMachineParsed}
                onError={handleUploaderError}
              />
              
             
            </div>
          )}
          
          {activeTab === 'simulator' && machine && (
            <div className="border rounded-lg bg-white shadow-md">
              <MachineSimulator 
                machine={machine}
                onStateChange={handleStateChange}
                onTransition={handleTransition}
              />
            </div>
          )}
          
          {activeTab === 'details' && machine && (
            <div className="border rounded-lg bg-white shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-black">Detalles de la Máquina</h2>
              
              {/* Resumen de la máquina */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 border rounded">
                  <h3 className="text-sm text-gray-500 mb-1">Estados</h3>
                  <div className="font-mono text-sm">
                    {machine.states.join(', ')}
                  </div>
                </div>
                <div className="p-3 border rounded">
                  <h3 className="text-sm text-gray-500 mb-1">Alfabeto de Entrada</h3>
                  <div className="font-mono text-sm">
                    {machine.inputs.join(', ')}
                  </div>
                </div>
                <div className="p-3 border rounded">
                  <h3 className="text-sm text-gray-500 mb-1">Alfabeto de Salida</h3>
                  <div className="font-mono text-sm">
                    {machine.outputs.join(', ')}
                  </div>
                </div>
                <div className="p-3 border rounded">
                  <h3 className="text-sm text-gray-500 mb-1">Estado Inicial</h3>
                  <div className="font-mono text-sm">
                    {machine.initialState}
                  </div>
                </div>
              </div>
              
              {/* Tabla de transiciones */}
              <h3 className="font-medium mb-2">Tabla de Transición</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse mb-6">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-2 text-left">Estado</th>
                      <th className="border p-2 text-left">Salida</th>
                      {machine.inputs.map(input => (
                        <th key={input} className="border p-2 text-left">{input}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {machine.states.map(state => (
                      <tr key={state}>
                        <td className="border p-2 font-mono">{state}</td>
                        <td className="border p-2 font-mono">{machine.outputFunction[state] || '-'}</td>
                        {machine.inputs.map(input => {
                          const transition = machine.transitions.find(
                            t => t.from === state && t.input === input
                          );
                          return (
                            <td key={`${state}-${input}`} className="border p-2 font-mono">
                              {transition ? transition.to : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Botón para mostrar visualización si está oculta */}
              {!showVisualization && (
                <button
                  onClick={() => setShowVisualization(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Mostrar Visualización
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}