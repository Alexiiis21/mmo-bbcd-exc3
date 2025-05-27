'use client';

import { useEffect, useRef, useState } from 'react';

export default function MachineVisualizer({ 
  visualMachine, // Nueva prop con la definición visual de la máquina
  state, 
  activeTransition 
}) {
  const canvasRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // Usar posiciones proporcionadas por visualMachine o default vacío
  const [statePositions, setStatePositions] = useState({});

  // Actualizar posiciones si cambia la definición de la máquina
  useEffect(() => {
    if (visualMachine?.statePositions) {
      setStatePositions(visualMachine.statePositions);
      // Reset view offset cuando cambia la máquina
      setViewOffset({ x: 0, y: 0 });
    }
  }, [visualMachine]);

  // Manejo de eventos de mouse para arrastrar estados o el fondo
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Comprobar si estamos en algún estado
    const radius = 38;
    let draggedState = null;
    
    if (visualMachine?.states) {
      Object.entries(statePositions).forEach(([id, pos]) => {
        // Ajustar por el desplazamiento de la vista
        const adjustedX = pos.x + viewOffset.x;
        const adjustedY = pos.y + viewOffset.y;
        const distance = Math.sqrt(Math.pow(x - adjustedX, 2) + Math.pow(y - adjustedY, 2));
        if (distance <= radius) {
          draggedState = id;
        }
      });
    }
    
    if (draggedState) {
      // Arrastrando un estado
      setDragState({
        id: draggedState,
        offsetX: x - (statePositions[draggedState].x + viewOffset.x),
        offsetY: y - (statePositions[draggedState].y + viewOffset.y)
      });
    } else {
      // Arrastrando el fondo
      setIsDraggingCanvas(true);
      setDragStart({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (dragState) {
      // Mover un estado específico
      setStatePositions(prev => ({
        ...prev,
        [dragState.id]: {
          x: x - dragState.offsetX - viewOffset.x,
          y: y - dragState.offsetY - viewOffset.y
        }
      }));
    } else if (isDraggingCanvas) {
      // Mover el fondo completo
      setViewOffset(prev => ({
        x: prev.x + (x - dragStart.x),
        y: prev.y + (y - dragStart.y)
      }));
      setDragStart({ x, y });
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
    setIsDraggingCanvas(false);
  };
  
  // Función para resetear la vista
  const resetView = () => {
    setViewOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Configuración de estados - Radio aumentado
    const radius = 38;
    
    // Dibujar marco decorativo que se mantiene fijo
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, width - 30, height - 30);
    
    // Guardar el contexto antes de aplicar el desplazamiento
    ctx.save();
    
    // Aplicar el desplazamiento de la vista
    ctx.translate(viewOffset.x, viewOffset.y);
    
    // Estados predeterminados en caso de no tener visualMachine
    const defaultStates = [];
    const defaultTransitions = [];
    
    // Usar los estados y transiciones del visualMachine o defaults
    const states = visualMachine?.states || defaultStates;
    const transitions = visualMachine?.transitions || defaultTransitions;
    
    // Mejorar la función de dibujo para transiciones autorecursivas
    const drawSelfLoop = (state, inputSymbol, outputSymbol, isActive, loopDirection) => {
      const x = state.x;
      const y = state.y;
      
      // Determinar la dirección del bucle
      let startAngle = 0, endAngle = 0, loopOffsetX = 0, loopOffsetY = 0, labelX = 0, labelY = 0;
      
      switch(loopDirection) {
        case 'top':
          startAngle = -0.8 * Math.PI;
          endAngle = -0.2 * Math.PI;
          loopOffsetX = 0;
          loopOffsetY = -radius * 2.0; // Más distancia para mayor visibilidad
          labelX = x;
          labelY = y - radius * 2.7;
          break;
        case 'right':
          startAngle = -0.3 * Math.PI;
          endAngle = 0.3 * Math.PI;
          loopOffsetX = radius * 2.0; // Más distancia
          loopOffsetY = 0;
          labelX = x + radius * 2.7;
          labelY = y;
          break;
        case 'bottom':
          startAngle = 0.2 * Math.PI;
          endAngle = 0.8 * Math.PI;
          loopOffsetX = 0;
          loopOffsetY = radius * 2.0; // Más distancia
          labelX = x;
          labelY = y + radius * 2.7;
          break;
        case 'left':
          startAngle = 0.7 * Math.PI;
          endAngle = 1.3 * Math.PI;
          loopOffsetX = -radius * 2.0; // Más distancia
          loopOffsetY = 0;
          labelX = x - radius * 2.7;
          labelY = y;
          break;
      }
      
      // Mejorar visibilidad de los bucles con un resplandor/halo
      if (isActive) {
        ctx.beginPath();
        ctx.arc(x + loopOffsetX, y + loopOffsetY, radius * 1.5, startAngle, endAngle, false);
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
        ctx.lineWidth = 12;
        ctx.stroke();
      }
      
      // Dibujar arco del bucle con mayor grosor para mayor visibilidad
      ctx.beginPath();
      ctx.arc(x + loopOffsetX, y + loopOffsetY, radius * 1.4, startAngle, endAngle, false);
      ctx.strokeStyle = isActive ? '#f97316' : '#333';
      ctx.lineWidth = isActive ? 6 : 5; // Líneas más gruesas para mayor visibilidad
      ctx.stroke();
      
      // Calcular posición para la punta de flecha
      const arrowAngle = endAngle - 0.05;
      const arrowX = x + loopOffsetX + radius * 1.4 * Math.cos(arrowAngle);
      const arrowY = y + loopOffsetY + radius * 1.4 * Math.sin(arrowAngle);
      
      // Dibujar punta de flecha más grande
      const arrowSize = 14;
      const arrowDir = arrowAngle + Math.PI/2;
      
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX + arrowSize * Math.cos(arrowDir - Math.PI/6),
        arrowY + arrowSize * Math.sin(arrowDir - Math.PI/6)
      );
      ctx.lineTo(
        arrowX + arrowSize * Math.cos(arrowDir + Math.PI/6),
        arrowY + arrowSize * Math.sin(arrowDir + Math.PI/6)
      );
      ctx.closePath();
      ctx.fillStyle = isActive ? '#f97316' : '#333';
      ctx.fill();
      
      // Dibujar fondo para la etiqueta con mayor contraste
      ctx.fillStyle = 'white';
      ctx.globalAlpha = 0.95;
      ctx.fillRect(labelX - 30, labelY - 15, 60, 30);
      ctx.globalAlpha = 1;
      
      // Borde para el fondo más pronunciado
      ctx.strokeStyle = isActive ? '#f97316' : '#aaa';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(labelX - 30, labelY - 15, 60, 30);
      
      // Dibujar etiqueta
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Entrada
      ctx.fillStyle = isActive && activeTransition?.input === inputSymbol ? '#f97316' : '#2563eb';
      ctx.font = (isActive && activeTransition?.input === inputSymbol) ? 'bold 16px Arial' : '15px Arial';
      ctx.fillText(inputSymbol, labelX - 15, labelY);
      
      // Separador
      ctx.fillStyle = '#666';
      ctx.fillText('/', labelX, labelY);
      
      // Salida
      ctx.fillStyle = isActive ? '#059669' : '#059669';
      ctx.font = isActive ? 'bold 16px Arial' : '15px Arial';
      ctx.fillText(outputSymbol, labelX + 15, labelY);
    };
    
    // Función para dibujar una transición mejorada
    const drawTransition = (fromState, toState, inputSymbol, outputSymbol, isActive, options = {}) => {
      const from = states.find(s => s.id === fromState);
      const to = states.find(s => s.id === toState);
      
      if (!from || !to) return;
      
      const fromPos = statePositions[from.id];
      const toPos = statePositions[to.id];
      if (!fromPos || !toPos) return;
      
      // Definir posiciones reales
      const fromStateWithPos = { ...from, x: fromPos.x, y: fromPos.y };
      const toStateWithPos = { ...to, x: toPos.x, y: toPos.y };
      
      // Manejar bucles de manera especial
      if (options.selfLoop) {
        drawSelfLoop(fromStateWithPos, inputSymbol, outputSymbol, isActive, options.loopDirection || 'top');
        return;
      }
      
      // Calcular puntos base
      const dx = toStateWithPos.x - fromStateWithPos.x;
      const dy = toStateWithPos.y - fromStateWithPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      // Puntos de inicio y fin básicos
      let startX = fromStateWithPos.x + radius * Math.cos(angle);
      let startY = fromStateWithPos.y + radius * Math.sin(angle);
      let endX = toStateWithPos.x - radius * Math.cos(angle);
      let endY = toStateWithPos.y - radius * Math.sin(angle);
      
      // Determinar si usar una curva y en qué dirección
      const curveStrength = options.curveStrength || 0;
      let controlPointX, controlPointY;
      // Declarar perpX y perpY fuera del bloque condicional
      let perpX = 0;
      let perpY = 0;
      
      // Mejorar visibilidad con un resplandor si está activa
      if (isActive) {
        ctx.shadowColor = 'rgba(249, 115, 22, 0.6)';
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      
      if (options.curveDirection === 'none' || curveStrength === 0) {
        // Línea recta, sin puntos de control
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
      } else {
        // Calcular punto de control para la curva según la dirección solicitada
        perpX = -dy / distance;
        perpY = dx / distance;
        
        // Ajustar la dirección de la curvatura
        if (options.curveDirection === 'down' || options.curveDirection === 'right') {
          perpX = -perpX;
          perpY = -perpY;
        }
        
        // Calcular punto de control
        controlPointX = (fromStateWithPos.x + toStateWithPos.x) / 2 + perpX * curveStrength;
        controlPointY = (fromStateWithPos.y + toStateWithPos.y) / 2 + perpY * curveStrength;
        
        // Dibujar curva bezier cuadrática
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlPointX, controlPointY, endX, endY);
      }
      
      // Estilo de línea
      ctx.strokeStyle = isActive ? '#f97316' : '#666';
      ctx.lineWidth = isActive ? 4 : 3;
      ctx.stroke();
      
      // Resetear sombra después de dibujar la línea
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Calcular ángulo para la punta de flecha
      let arrowAngle;
      
      if (options.curveDirection === 'none' || curveStrength === 0) {
        arrowAngle = angle;
      } else {
        // Calcular tangente al final de la curva
        const t = 0.95; // Punto cercano al final para calcular la tangente
        const qx = (1-t)*((1-t)*startX + t*controlPointX) + t*((1-t)*controlPointX + t*endX);
        const qy = (1-t)*((1-t)*startY + t*controlPointY) + t*((1-t)*controlPointY + t*endY);
        arrowAngle = Math.atan2(endY - qy, endX - qx);
      }
      
      // Dibujar punta de flecha
      const arrowSize = 10;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowSize * Math.cos(arrowAngle - Math.PI/6),
        endY - arrowSize * Math.sin(arrowAngle - Math.PI/6)
      );
      ctx.lineTo(
        endX - arrowSize * Math.cos(arrowAngle + Math.PI/6),
        endY - arrowSize * Math.sin(arrowAngle + Math.PI/6)
      );
      ctx.closePath();
      ctx.fillStyle = isActive ? '#f97316' : '#666';
      ctx.fill();
      
      // Posicionar etiqueta
      let labelX, labelY;
      
      if (options.curveDirection === 'none' || curveStrength === 0) {
        // Para líneas rectas
        labelX = (startX + endX) / 2;
        labelY = (startY + endY) / 2 - 15; // Subir la etiqueta para no tapar la línea
      } else {
        // Para curvas, colocar cerca del punto de control
        labelX = (startX + endX) / 2 + perpX * (curveStrength * 0.7);
        labelY = (startY + endY) / 2 + perpY * (curveStrength * 0.7);
      }
      
      // Dibujar fondo para la etiqueta
      ctx.fillStyle = 'white';
      ctx.globalAlpha = 0.92;
      ctx.fillRect(labelX - 30, labelY - 15, 60, 30);
      ctx.globalAlpha = 1;
      
      // Borde para el fondo
      ctx.strokeStyle = isActive ? '#f97316' : '#ddd';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(labelX - 30, labelY - 15, 60, 30);
      
      // Dibujar etiqueta con entrada y salida claramente distinguibles
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Entrada
      ctx.fillStyle = isActive && activeTransition?.input === inputSymbol ? '#f97316' : '#2563eb';
      ctx.font = (isActive && activeTransition?.input === inputSymbol) ? 'bold 16px Arial' : '15px Arial';
      ctx.fillText(inputSymbol, labelX - 15, labelY);
      
      // Separador
      ctx.fillStyle = '#666';
      ctx.fillText('/', labelX, labelY);
      
      // Salida
      ctx.fillStyle = isActive ? '#059669' : '#059669';
      ctx.font = isActive ? 'bold 16px Arial' : '15px Arial';
      ctx.fillText(outputSymbol, labelX + 15, labelY);
    };
    
    // Función mejorada para dibujar estados
    const drawState = (state, isActive) => {
      // Si no hay posición definida, saltar
      const pos = statePositions[state.id];
      if (!pos) return;
      
      const x = pos.x;
      const y = pos.y;
      
      // Dibujar sombra para efecto 3D más pronunciado
      ctx.beginPath();
      ctx.arc(x + 5, y + 5, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();
      
      // Dibujar círculo principal
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      
      let fillColor;
      if (isActive) {
        // Gradiente para estado activo
        const gradient = ctx.createLinearGradient(
          x - radius, y - radius, 
          x + radius, y + radius
        );
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(1, '#ea580c');
        fillColor = gradient;
      } else if (state.isFinal) {
        // Gradiente para estado final
        const gradient = ctx.createLinearGradient(
          x - radius, y - radius, 
          x + radius, y + radius
        );
        gradient.addColorStop(0, '#93c5fd');
        gradient.addColorStop(1, '#60a5fa');
        fillColor = gradient;
      } else {
        // Gradiente para estado normal con más contraste
        const gradient = ctx.createLinearGradient(
          x - radius, y - radius, 
          x + radius, y + radius
        );
        gradient.addColorStop(0, '#cbd5e1');
        gradient.addColorStop(1, '#94a3b8');
        fillColor = gradient;
      }
      
      // Añadir resplandor alrededor del estado activo
      if (isActive) {
        ctx.shadowColor = 'rgba(249, 115, 22, 0.6)';
        ctx.shadowBlur = 15;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Resetear sombra después de dibujar el círculo principal
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Círculo adicional para estados finales
      if (state.isFinal) {
        ctx.beginPath();
        ctx.arc(x, y, radius - 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Flecha para estado inicial
      if (state.isInitial) {
        ctx.beginPath();
        ctx.moveTo(x - radius - 50, y);
        ctx.lineTo(x - radius - 5, y);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Punta de flecha
        ctx.beginPath();
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x - radius - 15, y - 10);
        ctx.lineTo(x - radius - 15, y + 10);
        ctx.closePath();
        ctx.fillStyle = '#1e293b';
        ctx.fill();
      }
      
      // Etiqueta del estado
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Arial'; // Texto más grande para mejor legibilidad
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.label, x, y);
      
      // Añadir indicación de arrastrable cuando el mouse está sobre el estado
      if (dragState && dragState.id === state.id) {
        ctx.font = '12px Arial';
        ctx.fillStyle = '#1e293b';
        ctx.fillText('Moviendo...', x, y + radius + 20);
      }
    };
    
    // Comprobar si hay máquina para dibujar
    if (states.length === 0) {
      // Si no hay máquina, mostrar mensaje
      ctx.restore(); // Restaurar antes de dibujar texto
      
      ctx.font = 'italic 16px Arial';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('No hay máquina para visualizar', width/2, height/2);
      
      // Dibujar título como placeholder
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Visualizador de Máquina de Moore', width/2, 40);
      
      return; // Salir temprano
    }
    
    // Dibujar primero las transiciones
    transitions.forEach(t => {
      // Verificación mejorada de transición activa
      const isActive = 
        activeTransition && 
        activeTransition.from === t.from && 
        ((activeTransition.input === t.input) || (t.input === '*')) && 
        ((activeTransition.to === t.to) || (t.selfLoop && t.from === t.to));
      
      drawTransition(
        t.from, 
        t.to, 
        t.input, 
        t.output, 
        isActive, 
        {
          selfLoop: t.selfLoop, 
          loopDirection: t.loopDirection,
          curveDirection: t.curveDirection,
          curveStrength: t.curveStrength
        }
      );
    });
    
    // Luego dibujar los estados para que estén encima de las transiciones
    states.forEach(s => {
      let isActive = false;
      if (state) {
        isActive = s.id === state.currentState;
      }
      
      drawState(s, isActive);
    });
    
    // Restaurar el contexto para dibujar elementos fijos
    ctx.restore();
    
    // Dibujar título en la parte superior - esto se mantiene fijo
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    // Mostrar título adecuado según si hay máquina o no
    ctx.fillText('Máquina de Moore', width/2, 40);
    
    // Leyenda para los colores (fija en la parte inferior)
    const legendY = height - 60;
    
    // Entrada (azul)
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(40, legendY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'left';
    ctx.fillText('Entrada', 55, legendY + 5);
    
    // Salida (verde)
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(140, legendY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Salida', 155, legendY + 5);
    
    // Transición activa (naranja)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(240, legendY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Transición activa', 255, legendY + 5);
    
    // Auto-bucles (explicación)
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(400, legendY, 8, 0, Math.PI * 2);
    ctx.fill();

    
  }, [state, activeTransition, statePositions, dragState, viewOffset, visualMachine]);

  // Determinar el cursor adecuado
  const cursorStyle = isDraggingCanvas ? 'grabbing' : 'grab';

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width="900"
        height="550"
        className={`border rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-xl cursor-${cursorStyle}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
    </div>
  );
}