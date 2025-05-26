'use client';

import { useEffect, useRef, useState } from 'react';

export default function MachineVisualizer({ state, activeTransition }) {
  const canvasRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [statePositions, setStatePositions] = useState({
    'S0,0': { x: 120, y: 170 },
    'S0,1': { x: 300, y: 100 },
    'S0,2': { x: 500, y: 100 },
    'S1,0': { x: 120, y: 370 },
    'S1,1': { x: 300, y: 440 },
    'S1,2': { x: 500, y: 440 },
    'F0': { x: 730, y: 170 },
    'F1': { x: 730, y: 370 }
  });

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
    
    Object.entries(statePositions).forEach(([id, pos]) => {
      // Ajustar por el desplazamiento de la vista
      const adjustedX = pos.x + viewOffset.x;
      const adjustedY = pos.y + viewOffset.y;
      const distance = Math.sqrt(Math.pow(x - adjustedX, 2) + Math.pow(y - adjustedY, 2));
      if (distance <= radius) {
        draggedState = id;
      }
    });
    
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
    
    // Definir estados y sus posiciones - Usando las posiciones del estado
    const states = [
      // Estados regulares S_{c,p}
      { id: 'S0,0', label: 'S₀,₀', x: statePositions['S0,0'].x, y: statePositions['S0,0'].y, isInitial: true },
      { id: 'S0,1', label: 'S₀,₁', x: statePositions['S0,1'].x, y: statePositions['S0,1'].y },
      { id: 'S0,2', label: 'S₀,₂', x: statePositions['S0,2'].x, y: statePositions['S0,2'].y },
      { id: 'S1,0', label: 'S₁,₀', x: statePositions['S1,0'].x, y: statePositions['S1,0'].y },
      { id: 'S1,1', label: 'S₁,₁', x: statePositions['S1,1'].x, y: statePositions['S1,1'].y },
      { id: 'S1,2', label: 'S₁,₂', x: statePositions['S1,2'].x, y: statePositions['S1,2'].y },
      
      // Estados finales
      { id: 'F0', label: 'F₀', x: statePositions['F0'].x, y: statePositions['F0'].y, isFinal: true },
      { id: 'F1', label: 'F₁', x: statePositions['F1'].x, y: statePositions['F1'].y, isFinal: true }
    ];
    
    // Definir transiciones con detalles adicionales para curvaturas específicas
    const transitions = [
      // Desde S0,0
      { from: 'S0,0', to: 'S0,1', input: '0', output: '1', curveDirection: 'up', curveStrength: 25 },
      { from: 'S0,0', to: 'S1,1', input: '1', output: '0', curveDirection: 'down', curveStrength: 60 },
      { from: 'S0,0', to: 'F0', input: '#', output: '⊥', curveDirection: 'none', curveStrength: 0 },
      
      // Desde S0,1
      { from: 'S0,1', to: 'S0,2', input: '0', output: '1', curveDirection: 'up', curveStrength: 30 },
      { from: 'S0,1', to: 'S1,2', input: '1', output: '0', curveDirection: 'down', curveStrength: 80 },
      { from: 'S0,1', to: 'F0', input: '#', output: '⊥', curveDirection: 'up', curveStrength: 40 },
      
   // Desde S0,2 - Auto-bucle más visible y transiciones claras
{ from: 'S0,2', to: 'S0,2', input: '0', output: '0', selfLoop: true, loopDirection: 'right' },  // Cambiado a right para mayor visibilidad
{ from: 'S0,2', to: 'S1,2', input: '1', output: '1', curveDirection: 'down', curveStrength: 60 }, // Dirección modificada 
{ from: 'S0,2', to: 'F0', input: '#', output: '⊥', curveDirection: 'up', curveStrength: 20 },
      
      // Desde S1,0
      { from: 'S1,0', to: 'S1,1', input: '0', output: '0', curveDirection: 'down', curveStrength: 25 },
      { from: 'S1,0', to: 'S0,1', input: '1', output: '1', curveDirection: 'up', curveStrength: 60 },
      { from: 'S1,0', to: 'F1', input: '#', output: '1', curveDirection: 'none', curveStrength: 0 },
      
      // Desde S1,1
      { from: 'S1,1', to: 'S1,2', input: '0', output: '0', curveDirection: 'down', curveStrength: 30 },
      { from: 'S1,1', to: 'S0,2', input: '1', output: '1', curveDirection: 'up', curveStrength: 80 },
      { from: 'S1,1', to: 'F1', input: '#', output: '1', curveDirection: 'down', curveStrength: 40 },
      
      // Desde S1,2 - Auto-bucle más visible
      { from: 'S1,2', to: 'S1,2', input: '0', output: '1', selfLoop: true, loopDirection: 'bottom' },
      { from: 'S1,2', to: 'S0,2', input: '1', output: '0', curveDirection: 'left', curveStrength: 60 },
      { from: 'S1,2', to: 'F1', input: '#', output: '1', curveDirection: 'down', curveStrength: 20 },
      
      // Bucles en estados finales
      { from: 'F0', to: 'F0', input: '*', output: '-', selfLoop: true, loopDirection: 'right' },
      { from: 'F1', to: 'F1', input: '*', output: '-', selfLoop: true, loopDirection: 'left' }
    ];
    
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
          loopOffsetY = -radius * 1.5;
          labelX = x;
          labelY = y - radius * 2.3;
          break;
        case 'right':
          startAngle = -0.3 * Math.PI;
          endAngle = 0.3 * Math.PI;
          loopOffsetX = radius * 1.5;
          loopOffsetY = 0;
          labelX = x + radius * 2.3;
          labelY = y;
          break;
        case 'bottom':
          startAngle = 0.2 * Math.PI;
          endAngle = 0.8 * Math.PI;
          loopOffsetX = 0;
          loopOffsetY = radius * 1.5;
          labelX = x;
          labelY = y + radius * 2.3;
          break;
        case 'left':
          startAngle = 0.7 * Math.PI;
          endAngle = 1.3 * Math.PI;
          loopOffsetX = -radius * 1.5;
          loopOffsetY = 0;
          labelX = x - radius * 2.3;
          labelY = y;
          break;
      }
      
      // Mejorar visibilidad de los bucles con un resplandor/halo
      if (isActive) {
        ctx.beginPath();
        ctx.arc(x + loopOffsetX, y + loopOffsetY, radius * 1.3, startAngle, endAngle, false);
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.3)';
        ctx.lineWidth = 8;
        ctx.stroke();
      }
      
      // Dibujar arco del bucle con mayor grosor para mayor visibilidad
      ctx.beginPath();
      ctx.arc(x + loopOffsetX, y + loopOffsetY, radius * 1.2, startAngle, endAngle, false);
      ctx.strokeStyle = isActive ? '#f97316' : '#555';
      ctx.lineWidth = isActive ? 5 : 4; // Líneas más gruesas para mayor visibilidad
      ctx.stroke();
      
      // Calcular posición para la punta de flecha
      const arrowAngle = endAngle - 0.05;
      const arrowX = x + loopOffsetX + radius * 1.2 * Math.cos(arrowAngle);
      const arrowY = y + loopOffsetY + radius * 1.2 * Math.sin(arrowAngle);
      
      // Dibujar punta de flecha más grande
      const arrowSize = 12;
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
      ctx.fillStyle = isActive ? '#f97316' : '#555';
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
      
      // Manejar bucles de manera especial
      if (options.selfLoop) {
        drawSelfLoop(from, inputSymbol, outputSymbol, isActive, options.loopDirection || 'top');
        return;
      }
      
      // Calcular puntos base
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      // Puntos de inicio y fin básicos
      let startX = from.x + radius * Math.cos(angle);
      let startY = from.y + radius * Math.sin(angle);
      let endX = to.x - radius * Math.cos(angle);
      let endY = to.y - radius * Math.sin(angle);
      
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
        controlPointX = (from.x + to.x) / 2 + perpX * curveStrength;
        controlPointY = (from.y + to.y) / 2 + perpY * curveStrength;
        
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
      // Dibujar sombra para efecto 3D más pronunciado
      ctx.beginPath();
      ctx.arc(state.x + 5, state.y + 5, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();
      
      // Dibujar círculo principal
      ctx.beginPath();
      ctx.arc(state.x, state.y, radius, 0, Math.PI * 2);
      
      let fillColor;
      if (isActive) {
        // Gradiente para estado activo
        const gradient = ctx.createLinearGradient(
          state.x - radius, state.y - radius, 
          state.x + radius, state.y + radius
        );
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(1, '#ea580c');
        fillColor = gradient;
      } else if (state.isFinal) {
        // Gradiente para estado final
        const gradient = ctx.createLinearGradient(
          state.x - radius, state.y - radius, 
          state.x + radius, state.y + radius
        );
        gradient.addColorStop(0, '#93c5fd');
        gradient.addColorStop(1, '#60a5fa');
        fillColor = gradient;
      } else {
        // Gradiente para estado normal con más contraste
        const gradient = ctx.createLinearGradient(
          state.x - radius, state.y - radius, 
          state.x + radius, state.y + radius
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
        ctx.arc(state.x, state.y, radius - 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Flecha para estado inicial
      if (state.isInitial) {
        ctx.beginPath();
        ctx.moveTo(state.x - radius - 50, state.y);
        ctx.lineTo(state.x - radius - 5, state.y);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Punta de flecha
        ctx.beginPath();
        ctx.moveTo(state.x - radius, state.y);
        ctx.lineTo(state.x - radius - 15, state.y - 10);
        ctx.lineTo(state.x - radius - 15, state.y + 10);
        ctx.closePath();
        ctx.fillStyle = '#1e293b';
        ctx.fill();
      }
      
      // Etiqueta del estado
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Arial'; // Texto más grande para mejor legibilidad
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.label, state.x, state.y);
    };
    
    // Dibujar primero las transiciones
    transitions.forEach(t => {
      const isActive = 
        activeTransition && 
        activeTransition.from === t.from && 
        activeTransition.to === t.to &&
        ((activeTransition.input === t.input) || (t.input === '*'));
      
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
      if (state?.isFinal) {
        isActive = s.id === (state.carry === 1 ? 'F1' : 'F0');
      } else if (state) {
        isActive = s.id === `S${state.carry},${state.position}`;
      }
      
      drawState(s, isActive);
    });
    
    // Restaurar el contexto para dibujar elementos fijos
    ctx.restore();
    
    // Dibujar título en la parte superior - esto se mantiene fijo
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Máquina de Moore: Conversión BCD a Exceso-3', width/2, 40);
    
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
    
  }, [state, activeTransition, statePositions, dragState, viewOffset]);

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