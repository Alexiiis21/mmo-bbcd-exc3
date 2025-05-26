import { useState } from 'react';

export function useMooreMachine() {
  // Estado: (c,p) donde c es acarreo y p es posición
  const [machineState, setMachineState] = useState({ 
    carry: 0,     // acarreo (c)
    position: 0,  // posición (p)
    isFinal: false // indica si estamos en estado final
  });
  
  const [inputSequence, setInputSequence] = useState([]);
  const [outputSequence, setOutputSequence] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTransition, setActiveTransition] = useState(null);

  // Define la función k(p): devuelve 1 para p ∈ {0,1}, 0 para p=2
  const getConstantBit = (p) => (p < 2 ? 1 : 0);

  // Procesa un bit de entrada
  const processInput = (input) => {
    if (isCompleted) return;
    
    // Añadir a la secuencia de entrada
    setInputSequence(prev => [...prev, input]);
    
    const { carry, position, isFinal } = machineState;
    
    if (isFinal) {
      // Si ya estamos en estado final, nos quedamos ahí
      return;
    }
    
    if (input === '#') {
      // Símbolo de fin de palabra
      // Transición al estado final según el acarreo
      const newState = { 
        carry: carry,
        position: position,
        isFinal: true 
      };
      
      setActiveTransition({
        from: `S${carry},${position}`,
        to: carry === 1 ? 'F1' : 'F0',
        input: '#',
        output: carry === 1 ? '1' : '⊥'
      });
      
      // Si el acarreo es 1, entonces ponemos un '1' final
      if (carry === 1) {
        setOutputSequence(prev => [...prev, '1']);
      }
      
      setMachineState(newState);
      setIsCompleted(true);
      return;
    }
    
    // Procesar un bit normal (0 o 1)
    const x = parseInt(input, 10);
    const k = getConstantBit(position);
    
    // Calcular bit de suma: s = x ⊕ k ⊕ c
    const s = x ^ k ^ carry;
    
    // Calcular siguiente acarreo: c' = (x ∧ k) ∨ (x ∧ c) ∨ (k ∧ c)
    const newCarry = (x & k) | (x & carry) | (k & carry);
    
    // Calcular siguiente posición: p' = min(p+1, 2)
    const newPosition = Math.min(position + 1, 2);
    
    // Añadir a la secuencia de salida
    setOutputSequence(prev => [...prev, s.toString()]);
    
    // Registrar la transición activa
    setActiveTransition({
      from: `S${carry},${position}`,
      to: `S${newCarry},${newPosition}`,
      input,
      output: s.toString()
    });
    
    // Actualizar estado
    setMachineState({
      carry: newCarry,
      position: newPosition,
      isFinal: false
    });
  };

  // Resetear la máquina
  const resetMachine = () => {
    setMachineState({ carry: 0, position: 0, isFinal: false });
    setInputSequence([]);
    setOutputSequence([]);
    setIsCompleted(false);
    setActiveTransition(null);
  };

  // Obtener representación del estado actual
  const getCurrentStateDisplay = () => {
    const { carry, position, isFinal } = machineState;
    return isFinal ? (carry === 1 ? 'F1' : 'F0') : `S${carry},${position}`;
  };

  return {
    state: machineState,
    inputSequence,
    outputSequence,
    isCompleted,
    activeTransition,
    processInput,
    resetMachine,
    getCurrentStateDisplay
  };
}