import React, { useState } from 'react';

const ProjectForm: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [who, setWho] = useState<string>('');
  const [what, setWhat] = useState<string>('');
  const [when, setWhen] = useState<string>('');
  const [where, setWhere] = useState<string>('');
  const [why, setWhy] = useState<string>('');
  const [how, setHow] = useState<string>('');
  const [howMuch, setHowMuch] = useState<number>(0);
  const [origin, setOrigin] = useState<string>('');
  const [originDate, setOriginDate] = useState<string>('');
  const [status, setStatus] = useState<number>(0);
  const [conclusionText, setConclusionText] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      title,
      description,
      who,
      what,
      when,
      where,
      why,
      how,
      howMuch,
      origin,
      originDate,
      status,
      conclusionText,
    };

    // Obtendo o token do local storage
    const token = localStorage.getItem('token'); // Ajuste conforme necessário

    try {
      const response = await fetch('http://localhost:5168/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluindo o token no cabeçalho
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar o projeto');
      }

      const result = await response.json();
      console.log('Projeto criado com sucesso:', result);

      // Limpar os campos após o envio
      setTitle('');
      setDescription('');
      setWho('');
      setWhat('');
      setWhen('');
      setWhere('');
      setWhy('');
      setHow('');
      setHowMuch(0);
      setOrigin('');
      setOriginDate('');
      setStatus(0);
      setConclusionText('');
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Iniciar Novo Projeto</h2>

      <div className="flex flex-wrap mb-4">
        <div className="flex-1 mr-4">
          <label htmlFor="title" className="block text-gray-700">Título do Projeto</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* <div className="flex-1 mr-4">
          <label htmlFor="description" className="block text-gray-700">Descrição</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            rows={4}
          />
        </div> */}
      </div>

      <h3 className="text-lg font-semibold mb-2">5W2H</h3>

      <div className="flex flex-wrap mb-4">
        <div className="flex-1 mr-4">
          <label htmlFor="who" className="block text-gray-700">Quem?</label>
          <input
            type="text"
            id="who"
            value={who}
            onChange={(e) => setWho(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex-1 mr-4">
          <label htmlFor="what" className="block text-gray-700">O quê?</label>
          <input
            type="text"
            id="what"
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex-1 mr-4">
          <label htmlFor="when" className="block text-gray-700">Quando?</label>
          <input
            type="text"
            id="when"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex-1 mr-4">
          <label htmlFor="where" className="block text-gray-700">Onde?</label>
          <input
            type="text"
            id="where"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex-1 mr-4">
          <label htmlFor="why" className="block text-gray-700">Por quê?</label>
          <input
            type="text"
            id="why"
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex-1 mr-4">
          <label htmlFor="how" className="block text-gray-700">Como?</label>
          <input
            type="text"
            id="how"
            value={how}
            onChange={(e) => setHow(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="flex flex-wrap mb-4">
        <div className="flex-1 mr-4">
          <label htmlFor="howMuch" className="block text-gray-700">Quanto?</label>
          <input
            type="number"
            id="howMuch"
            value={howMuch}
            onChange={(e) => setHowMuch(Number(e.target.value))}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex-1 mr-4">
          <label htmlFor="origin" className="block text-gray-700">Origem</label>
          <input
            type="text"
            id="origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex-1 mr-4">
          <label htmlFor="originDate" className="block text-gray-700">Data de Origem</label>
          <input
            type="text"
            id="originDate"
            value={originDate}
            onChange={(e) => setOriginDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex-1 mr-4">
          <label htmlFor="status" className="block text-gray-700">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          >
            <option value={0}>Criado</option>
            <option value={1}>Em Progresso</option>
            <option value={2}>Suspenso</option>
            <option value={3}>Cancelado</option>
            <option value={4}>Concluído</option>
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="conclusionText" className="block text-gray-700">Texto de Conclusão</label>
          <textarea
            id="conclusionText"
            value={conclusionText}
            onChange={(e) => setConclusionText(e.target.value)}
            disabled={status !== 4} // Desabilitar se o status não for 'Concluído'
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            rows={2}
          />
        </div>
      </div>

      <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-700">
        Criar Projeto
      </button>
    </form>
  );
};

export default ProjectForm;
