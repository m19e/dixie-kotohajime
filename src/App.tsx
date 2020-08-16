import React, { useState } from "react";

interface ITodo {
    id: number;
    content: string;
}

const App = () => {
    const [value, setValue] = useState("");
    const [todoList, setTodoList] = useState<ITodo[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const add = () => {
        setTodoList([...todoList, { id: todoList.length, content: value }]);
        setValue("");
    };

    const handleDelete = (id: number) => {
        setTodoList(todoList.filter((todo) => todo.id !== id));
    };

    return (
        <div>
            <h1>TODO app</h1>
            <input type="text" value={value} onChange={handleChange} />
            <button onClick={add}>Add</button>
            <ul>
                {todoList.map((todo: ITodo) => (
                    <li key={todo.id}>
                        {todo.content}
                        <button onClick={() => handleDelete(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
