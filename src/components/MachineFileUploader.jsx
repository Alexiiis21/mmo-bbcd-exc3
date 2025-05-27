'use client';

import { useState, useRef } from 'react';
import { parseMooreMachine, parseSimpleFormat } from '@/lib/utils/MachineParser';

/**
 * @param {Function} onMachineParsed - Función callback cuando se parsea una máquina con éxito
 * @param {Function} onError - Función callback cuando ocurre un error
 */
export default function MachineFileUploader({ onMachineParsed, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [parseFormat, setParseFormat] = useState('standard'); // 'standard' o 'simple'
  const fileInputRef = useRef(null);

  // Manejador de eventos para clic en el área de arrastrar y soltar
  const handleAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Manejadores para eventos de arrastrar y soltar
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Procesar el archivo soltado
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  // Manejar cambio en el input de archivo
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  // Procesar el archivo seleccionado
  const processFile = (file) => {
    // Verificar tipo de archivo
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.json')) {
      if (onError) {
        onError('Solo se aceptan archivos .txt o .json');
      }
      return;
    }

    setFileName(file.name);
    setLoading(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        
        // Elegir la función de parseo según el formato seleccionado
        const parseFunction = parseFormat === 'standard' ? parseMooreMachine : parseSimpleFormat;
        const machine = parseFunction(content);
        
        if (onMachineParsed) {
          onMachineParsed(machine);
        }
      } catch (error) {
        if (onError) {
          onError(`Error al procesar el archivo: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      if (onError) {
        onError('Error al leer el archivo');
      }
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="w-full">
      {/* Selección de formato */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2 text-black">Formato de archivo:</div>
        <div className="flex gap-4">
          <label className="flex items-center text-black">
            <input
              type="radio"
              name="fileFormat"
              value="standard"
              checked={parseFormat === 'standard'}
              onChange={() => setParseFormat('standard')}
              className="mr-2 text-black"
            />
            Estándar (Quíntupla)
          </label>
        </div>
      </div>

      {/* Área para arrastrar y soltar */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        onClick={handleAreaClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">Procesando archivo...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-gray-600 mb-1">
              {fileName ? (
                <span>
                  Archivo seleccionado: <strong>{fileName}</strong>
                </span>
              ) : (
                <>
                  <span className="font-medium">Haga clic para seleccionar</span> o arrastre y suelte
                </>
              )}
            </p>
            <p className="text-sm text-gray-500">
              Solo archivos .txt o .json
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {parseFormat === 'standard' ? 
                "Formato esperado: Quíntupla de Máquina de Moore (elementos separados por comas)" : 
                "Formato esperado: estado,entrada,siguiente,salida"
              }
            </p>
          </>
        )}
      </div>

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".txt,.json"
      />

      {fileName && !loading && (
        <div className="mt-2 text-center">
          <button
            onClick={() => {
              setFileName('');
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Cambiar archivo
          </button>
        </div>
      )}
      
      {/* Plantillas descargables */}
      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-1">Descargar plantillas:</p>
        <div className="flex space-x-3">
          <a 
            href="/templates/template.txt" 
            download
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Plantilla Quíntupla
          </a>
        </div>
      </div>
    </div>
  );
}