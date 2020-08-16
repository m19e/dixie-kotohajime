import React, { useState } from "react";

interface ITodo {
    id: number;
    content: string;
    done: boolean;
}

const App = () => {
    const [value, setValue] = useState("");
    const [todoList, setTodoList] = useState<ITodo[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const add = () => {
        if (value.trim() === "") return;
        setTodoList([...todoList, { id: todoList.length, content: value, done: false }]);
        setValue("");
    };

    const handleDelete = (id: number) => {
        setTodoList(todoList.filter((todo) => todo.id !== id));
    };

    const handleToggle = (td: ITodo) => {
        const newTodoList = [...todoList.filter((todo) => todo.id !== td.id), Object.assign({}, td, { done: !td.done })];
        setTodoList(newTodoList);
    };

    return (
        <div>
            <h1>TODO app</h1>
            <input type="text" value={value} onChange={handleChange} />
            <button onClick={add}>Add</button>
            <ul>
                {todoList.map((todo: ITodo) => (
                    <li key={todo.id}>
                        <input type="checkbox" checked={todo.done} onChange={() => handleToggle(todo)} />
                        {todo.content}
                        <button onClick={() => handleDelete(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
