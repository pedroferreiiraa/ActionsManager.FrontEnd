import React, { useState } from 'react';

const ProjectForm: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [originDate, setOriginDate] = useState<string>('');
  const [who, setWho] = useState<string>('');
  const [what, setWhat] = useState<string>('');
  const [when, setWhen] = useState<string>('');
  const [where, setWhere] = useState<string>('');
  const [why, setWhy] = useState<string>('');
  const [how, setHow] = useState<string>('');
  const [howMuch, setHowMuch] = useState<number>(0);
  const [conclusionText, setConclusionText] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const projectData = {
      title, origin, originDate, who, what, when, where, why, how, howMuch, conclusionText,
    };

    try {
      const response = await fetch('http://192.168.16.240:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error('Erro ao criar o projeto');
      console.log('Projeto criado com sucesso:', await response.json());

      // Resetar campos após envio
      setTitle('');
      setOrigin('');
      setOriginDate('');
      setWho('');
      setWhat('');
      setWhen('');
      setWhere('');
      setWhy('');
      setHow('');
      setHowMuch(0);
      setConclusionText('');
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto space-y-6">
      <div>
        <label htmlFor="title" className="text-sm text-gray-700 block">Título</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="origin" className="text-sm text-gray-700 block">Origem</label>
          <textarea
            id="origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
          />
        </div>
        <div>
          <label htmlFor="originDate" className="text-sm text-gray-700 block">Data de Origem</label>
          <input
            id="originDate"
            type="text"
            value={originDate}
            onChange={(e) => setOriginDate(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <h3 className="text-lg font-medium text-gray-700">5W2H</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { id: 'who', label: 'Quem?', value: who, setValue: setWho },
          { id: 'what', label: 'O quê?', value: what, setValue: setWhat },
          { id: 'when', label: 'Quando?', value: when, setValue: setWhen },
          { id: 'where', label: 'Onde?', value: where, setValue: setWhere },
          { id: 'why', label: 'Por quê?', value: why, setValue: setWhy },
          { id: 'how', label: 'Como?', value: how, setValue: setHow },
        ].map(({ id, label, value, setValue }) => (
          <div key={id}>
            <label htmlFor={id} className="text-sm text-gray-700 block">{label}</label>
            <textarea
              id={id}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
            />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="howMuch" className="text-sm text-gray-700 block">Quanto?</label>
        <input
          id="howMuch"
          type="number"
          value={howMuch}
          onChange={(e) => setHowMuch(Number(e.target.value))}
          required
          className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Criar Projeto
      </button>
    </form>
  );
};

export default ProjectForm;
