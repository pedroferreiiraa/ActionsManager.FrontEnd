import React, { useState } from 'react';

interface ConclusionEditorProps {
  conclusionText: string;
  onSave: (text: string) => void;
}

const ConclusionEditor: React.FC<ConclusionEditorProps> = ({ conclusionText, onSave }) => {
  const [text, setText] = useState<string>(conclusionText);

  const handleSave = () => {
    onSave(text);
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite a conclusão..."
      />
      <button onClick={handleSave}>Salvar Conclusão</button>
    </div>
  );
};

export default ConclusionEditor;
