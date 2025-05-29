import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  // Estados para gerenciar a edição de tarefas
  const [editingId, setEditingId] = useState(null); // ID da tarefa atualmente em edição
  const [editText, setEditText] = useState('');     // Texto do campo de edição

  // DEFINA A URL DA API AQUI
  // Esta URL deve apontar para o IP público da sua instância EC2 e a porta do seu backend
  const API_BASE_URL = 'http://13.58.105.38:3001/api'; 

  // Efeito para buscar as tarefas quando o componente é montado
  useEffect(() => {
    fetchTasks();
  }, []); // O array vazio garante que este efeito seja executado apenas uma vez, na montagem

  // Função assíncrona para buscar todas as tarefas do backend
  const fetchTasks = async () => {
    try {
      // Faz uma requisição GET para a API de tarefas
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      // Atualiza o estado 'tasks' com os dados recebidos
      setTasks(response.data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      // Opcional: exibir uma mensagem de erro para o usuário
    }
  };

  // Lida com a mudança no campo de input para adicionar nova tarefa
  const handleInputChange = (event) => {
    setNewTask(event.target.value);
  };

  // Lida com a adição de uma nova tarefa
  const handleAddTask = async () => {
    // Verifica se o campo da nova tarefa não está vazio ou contém apenas espaços
    if (newTask.trim()) {
      try {
        // Faz uma requisição POST para a API para adicionar uma nova tarefa
        const response = await axios.post(`${API_BASE_URL}/tasks`, { title: newTask });
        // Adiciona a nova tarefa (retornada pelo backend) ao estado 'tasks'
        setTasks([...tasks, response.data]);
        // Limpa o campo de input da nova tarefa
        setNewTask('');
      } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
        // Opcional: exibir uma mensagem de erro para o usuário
      }
    }
  };

  // Lida com a exclusão de uma tarefa
  const handleDeleteTask = async (id) => {
    try {
      // Faz uma requisição DELETE para a API para excluir a tarefa com o ID fornecido
      await axios.delete(`${API_BASE_URL}/tasks/${id}`);
      // Atualiza o estado 'tasks' removendo a tarefa excluída
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error(`Erro ao excluir tarefa ${id}:`, error);
      // Opcional: exibir uma mensagem de erro para o usuário
    }
  };

  // Entra no modo de edição para uma tarefa específica
  const handleEdit = (task) => {
    setEditingId(task.id);   // Define o ID da tarefa que está sendo editada
    setEditText(task.title);  // Preenche o campo de edição com o título atual da tarefa
  };

  // Lida com a mudança no campo de input de edição
  const handleEditTextChange = (event) => {
    setEditText(event.target.value);
  };

  // Salva as alterações de uma tarefa editada
  const handleSaveEdit = async (id) => {
    // Verifica se o campo de edição não está vazio ou contém apenas espaços
    if (editText.trim()) {
      try {
        // Faz uma requisição PUT para a API para atualizar a tarefa
        const response = await axios.put(`${API_BASE_URL}/tasks/${id}`, { title: editText });
        // Atualiza o estado 'tasks' substituindo a tarefa antiga pela versão atualizada
        setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
        // Sai do modo de edição
        setEditingId(null);
        setEditText('');
      } catch (error) {
        console.error(`Erro ao atualizar tarefa ${id}:`, error);
        // Opcional: exibir uma mensagem de erro para o usuário
      }
    } else {
      // Se o campo de edição estiver vazio, sai do modo de edição sem salvar
      setEditingId(null);
      setEditText('');
    }
  };

  // Renderiza o componente da aplicação
  return (
    <div className="App">
      <h1>Lista de Tarefas</h1>
      <div className="input-section">
        <input
          type="text"
          value={newTask}
          onChange={handleInputChange}
          placeholder="Adicionar nova tarefa"
          className="task-input"
        />
        <button onClick={handleAddTask} className="add-button">Adicionar</button>
      </div>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            {/* Renderização condicional: se a tarefa está em edição, mostra input e botões de salvar/cancelar */}
            {editingId === task.id ? (
              <div className="edit-mode">
                <input
                  type="text"
                  value={editText}
                  onChange={handleEditTextChange}
                  className="edit-input"
                />
                <button onClick={() => handleSaveEdit(task.id)} className="save-button">Salvar</button>
                <button onClick={() => setEditingId(null)} className="cancel-button">Cancelar</button>
              </div>
            ) : (
              // Caso contrário, mostra o título da tarefa e botões de editar/excluir
              <div className="view-mode">
                <span className="task-title">{task.title}</span>
                <div className="task-actions">
                  <button onClick={() => handleEdit(task)} className="edit-button">Editar</button>
                  <button onClick={() => handleDeleteTask(task.id)} className="delete-button">Excluir</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
