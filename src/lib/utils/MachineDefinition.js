/**
 * Define una máquina de Moore vacía
 */
export const createEmptyMachine = () => ({
  states: [],             // Lista de estados (strings)
  inputs: [],             // Alfabeto de entrada
  outputs: [],            // Alfabeto de salida
  initialState: null,     // Estado inicial
  finalStates: [],        // Estados finales (opcional)
  transitions: [],        // Lista de transiciones {from, input, to}
  outputFunction: {},     // Mapeo de estado a salida {estado: simbolo}
});

/**
 * Valida que la definición de la máquina sea correcta
 */
export const validateMachine = (machine) => {
  const errors = [];
  
  if (!machine.states || machine.states.length === 0) {
    errors.push("La máquina debe tener al menos un estado");
  }
  
  if (!machine.initialState) {
    errors.push("Debe especificar un estado inicial");
  } else if (!machine.states.includes(machine.initialState)) {
    errors.push("El estado inicial debe ser uno de los estados definidos");
  }
  
  // Validar transiciones
  machine.transitions.forEach((transition, index) => {
    if (!transition.from || !machine.states.includes(transition.from)) {
      errors.push(`Transición ${index+1}: Estado de origen inválido`);
    }
    if (!transition.to || !machine.states.includes(transition.to)) {
      errors.push(`Transición ${index+1}: Estado de destino inválido`);
    }
    if (!transition.input || !machine.inputs.includes(transition.input)) {
      errors.push(`Transición ${index+1}: Símbolo de entrada inválido`);
    }
  });
  
  // Validar función de salida
  machine.states.forEach(state => {
    if (!machine.outputFunction[state]) {
      errors.push(`El estado "${state}" no tiene una salida definida`);
    } else if (!machine.outputs.includes(machine.outputFunction[state])) {
      errors.push(`La salida del estado "${state}" no está en el alfabeto de salida`);
    }
  });
  
  return errors;
};

/**
 * Convierte la definición de la máquina a un formato visual
 */
export const machineToVisualFormat = (machine) => {
  // Generar posiciones automáticas
  const statePositions = generateStatePositions(machine.states);
  
  // Transformar transiciones
  const visualTransitions = machine.transitions.map(t => ({
    from: t.from,
    to: t.to,
    input: t.input,
    output: machine.outputFunction[t.to], // En Moore, la salida depende del estado
    selfLoop: t.from === t.to,
    loopDirection: determineLoopDirection(t.from, t.to, statePositions),
    curveDirection: determineCurveDirection(t.from, t.to, statePositions),
    curveStrength: determineCurveStrength(t.from, t.to)
  }));
  
  return {
    statePositions,
    states: machine.states.map(id => ({
      id,
      label: id,
      isInitial: id === machine.initialState,
      isFinal: machine.finalStates?.includes(id) || false
    })),
    transitions: visualTransitions
  };
};

/**
 * Genera posiciones automáticas para los estados
 */
function generateStatePositions(states) {
  const positions = {};
  const stateCount = states.length;
  
  if (stateCount <= 1) {
    positions[states[0]] = { x: 450, y: 275 };
    return positions;
  }
  
  // Ajustar radio según cantidad de estados
  const radius = Math.min(300, 100 + stateCount * 20);
  const centerX = 450;
  const centerY = 275;
  
  // Colocar estados en un círculo
  states.forEach((state, index) => {
    const angle = (2 * Math.PI * index) / stateCount - Math.PI/2; // Empezar desde arriba
    positions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  return positions;
}

/**
 * Determina la dirección de un auto-bucle
 */
function determineLoopDirection(from, to, positions) {
  if (from !== to) return null;
  
  // Elegir una dirección basada en la posición del estado 
  // para evitar solapamientos
  const pos = positions[from];
  const centerX = 450;
  const centerY = 275;
  
  const dx = pos.x - centerX;
  const dy = pos.y - centerY;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'bottom' : 'top';
  }
}

/**
 * Determina la dirección de curvatura para una transición
 */
function determineCurveDirection(from, to, positions) {
  if (from === to) return null;
  
  // Para transiciones normales, determinar si curvar arriba o abajo
  const fromPos = positions[from];
  const toPos = positions[to];
  
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // Estados alineados horizontalmente
    return dy > 0 ? 'down' : 'up';
  } else {
    // Estados alineados verticalmente
    return dx > 0 ? 'right' : 'left';
  }
}

/**
 * Determina la fuerza de curvatura para una transición
 */
function determineCurveStrength(from, to) {
  if (from === to) return 0;
  
  // Una curvatura moderada para transiciones normales
  return 40;
}

/**
 * Exporta la máquina a un formato de texto simple
 */
export const machineToTextFormat = (machine) => {
  let text = "QUINTUPLA MAQUINA DE MOORE\n\n";
  
  // Estados
  text += "Conjunto de Estados Q:\n";
  machine.states.forEach(state => {
    text += `${state}\n`;
  });
  text += "\n";
  
  // Alfabeto de entrada
  text += "Alfabeto de Entrada Σ:\n";
  machine.inputs.forEach(input => {
    text += `${input}\n`;
  });
  text += "\n";
  
  // Alfabeto de salida
  text += "Alfabeto de Salida Γ:\n";
  machine.outputs.forEach(output => {
    text += `${output}\n`;
  });
  text += "\n";
  
  // Estado inicial
  text += "Estado Inicial qo:\n";
  text += `${machine.initialState}\n\n`;
  
  // Tabla de transiciones
  text += "Tabla de Transición:\n";
  machine.transitions.forEach(t => {
    text += `${t.from}\n`;
    text += `${machine.outputFunction[t.to]}\n`; 
    text += `${t.input}\n`;
    text += `${t.to}\n`;
  });
  
  return text;
};