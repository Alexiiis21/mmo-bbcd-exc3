/**
 * @param {string} text - Texto con la definición de la máquina de Moore
 * @returns {Object} - Objeto con la estructura de la máquina
 */
export function parseMooreMachine(text) {
  // Eliminar espacios en blanco adicionales y dividir por líneas
  const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
  let currentIndex = 0;
  
  // Objeto para almacenar la máquina resultante
  const machine = {
    states: [],
    inputs: [],
    outputs: [],
    initialState: '',
    finalStates: [], 
    transitions: [],
    outputFunction: {} 
  };
  
  try {
    // Verificar encabezado (opcional)
    if (lines[currentIndex].includes('QUINTUPLA') || lines[currentIndex].includes('MÁQUINA')) {
      currentIndex++;
    }
    
    // Procesar estados (Q)
    if (lines[currentIndex].includes('Estados') || lines[currentIndex].includes('Q:')) {
      currentIndex++;
      
      // Parsear estados separados por comas
      if (currentIndex < lines.length) {
        const statesLine = lines[currentIndex++].trim();
        machine.states = statesLine.split(',').map(s => s.trim());
      } else {
        throw new Error("No se encontraron los estados");
      }
    } else {
      throw new Error("No se encontró la sección de estados (Q)");
    }
    
    // Procesar alfabeto de entrada (Σ)
    if (lines[currentIndex].includes('Alfabeto de Entrada') || lines[currentIndex].includes('Σ:')) {
      currentIndex++;
      
      // Parsear símbolos de entrada separados por comas
      if (currentIndex < lines.length) {
        const inputsLine = lines[currentIndex++].trim();
        machine.inputs = inputsLine.split(',').map(s => s.trim());
      } else {
        throw new Error("No se encontró el alfabeto de entrada");
      }
    } else {
      throw new Error("No se encontró la sección del alfabeto de entrada (Σ)");
    }
    
    // Procesar alfabeto de salida (Γ)
    if (lines[currentIndex].includes('Alfabeto de Salida') || lines[currentIndex].includes('Γ:')) {
      currentIndex++;
      
      // Parsear símbolos de salida separados por comas
      if (currentIndex < lines.length) {
        const outputsLine = lines[currentIndex++].trim();
        machine.outputs = outputsLine.split(',').map(s => s.trim());
      } else {
        throw new Error("No se encontró el alfabeto de salida");
      }
    } else {
      throw new Error("No se encontró la sección del alfabeto de salida (Γ)");
    }
    
    // Procesar estado inicial (q0)
    if (lines[currentIndex].includes('Estado Inicial')) {
      currentIndex++;
      if (currentIndex < lines.length) {
        machine.initialState = lines[currentIndex++].trim();
      } else {
        throw new Error("No se encontró el estado inicial");
      }
    } else {
      throw new Error("No se encontró la sección del estado inicial (q0)");
    }
    
    // Procesar tabla de transición
    if (lines[currentIndex].includes('Tabla de Transición')) {
      currentIndex++;
      
      // Procesar cada línea de la tabla de transición en el nuevo formato:
      // estado_actual, salida, estado_siguiente_para_entrada_1, estado_siguiente_para_entrada_2, ...
      while (currentIndex < lines.length) {
        const transitionLine = lines[currentIndex++];
        const parts = transitionLine.split(',').map(part => part.trim());
        
        if (parts.length >= 2 + machine.inputs.length) {
          const state = parts[0];           // Estado actual
          const output = parts[1];          // Salida del estado
          
          // Guardar la salida asociada al estado
          machine.outputFunction[state] = output;
          
          // Crear transiciones para cada símbolo de entrada
          for (let i = 0; i < machine.inputs.length; i++) {
            const input = machine.inputs[i];
            const nextState = parts[2 + i]; // Estado siguiente para esta entrada
            
            if (nextState) {
              machine.transitions.push({
                from: state,
                input: input,
                to: nextState
              });
            }
          }
        } else {
          console.warn("Línea de transición mal formateada:", transitionLine);
        }
      }
    } else {
      throw new Error("No se encontró la sección de la tabla de transición");
    }
    
    return machine;
    
  } catch (error) {
    console.error("Error al parsear la máquina:", error);
    throw error;
  }
}

// El resto del archivo se mantiene igual...

/** 
 * @param {string} text - Texto con definición de la máquina en formato simple
 * @returns {Object} - Objeto con la estructura de la máquina
 */
export function parseSimpleFormat(text) {
  // Esta función ya maneja el formato separado por comas, así que se mantiene igual
  const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
  
  const machine = {
    states: new Set(),
    inputs: new Set(),
    outputs: new Set(),
    initialState: '',
    finalStates: [],
    transitions: [],
    outputFunction: {}
  };
  
  try {
    // Procesar cada línea como una transición
    for (const line of lines) {
      // Omitir líneas de comentarios o encabezados
      if (line.startsWith('#') || line.startsWith('//')) continue;
      
      const parts = line.split(',').map(part => part.trim());
      
      if (parts.length >= 3) { // Debe tener al menos estado actual, entrada, y estado siguiente
        const fromState = parts[0];
        const input = parts[1];
        const toState = parts[2];
        const output = parts[3] || ''; // Salida opcional
        
        // Añadir a los conjuntos
        machine.states.add(fromState);
        machine.states.add(toState);
        machine.inputs.add(input);
        
        if (output) {
          machine.outputs.add(output);
          machine.outputFunction[toState] = output;
        }
        
        // Primera transición define el estado inicial por defecto
        if (!machine.initialState) {
          machine.initialState = fromState;
        }
        
        // Añadir transición
        machine.transitions.push({
          from: fromState,
          to: toState,
          input: input
        });
      }
    }
    
    // Convertir conjuntos a arrays
    return {
      states: Array.from(machine.states),
      inputs: Array.from(machine.inputs),
      outputs: Array.from(machine.outputs),
      initialState: machine.initialState,
      finalStates: [],
      transitions: machine.transitions,
      outputFunction: machine.outputFunction
    };
    
  } catch (error) {
    console.error("Error al parsear formato simple:", error);
    throw error;
  }
}