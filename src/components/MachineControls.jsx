export default function MachineControls({ onInput, onReset, isCompleted }) {
  return (
    <div className="flex flex-wrap gap-3 mb-4 justify-center">
      <button 
        className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onInput('0')}
        disabled={isCompleted}
      >
        Entrada: 0
      </button>
      <button 
        className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onInput('1')}
        disabled={isCompleted}
      >
        Entrada: 1
      </button>
      <button 
        className="px-4 py-2 bg-gradient-to-b from-yellow-500 to-yellow-600 text-white rounded hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onInput('#')}
        disabled={isCompleted}
      >
        Fin (#)
      </button>
      <button 
        className="px-4 py-2 bg-gradient-to-b from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 font-medium shadow-md transition-all"
        onClick={onReset}
      >
        Reiniciar
      </button>
    </div>
  );
}